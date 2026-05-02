// API client — same-origin fetch with CSRF + silent refresh on 401.
// No tokens are ever stored in JS; everything rides on httpOnly cookies.

const BASE = '/api';

let csrfToken = null;
let csrfPromise = null;
let refreshPromise = null;

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function fetchCsrf() {
  const res = await fetch(`${BASE}/auth/csrf`, { credentials: 'include' });
  if (!res.ok) throw new ApiError('Failed to obtain CSRF token', { status: res.status });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = fetchCsrf().finally(() => {
      csrfPromise = null;
    });
  }
  return csrfPromise;
}

// De-duplicate concurrent refreshes.
async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(method, path, { body, query, skipRefresh = false } = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(k, val));
      else url.searchParams.set(k, v);
    }
  }

  const init = {
    method,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  };

  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  if (MUTATING.has(method)) {
    init.headers['X-CSRF-Token'] = await ensureCsrf();
  }

  let res = await fetch(url.toString().replace(window.location.origin, ''), init);

  // 401 = access token expired or missing. Try refresh once, then replay.
  if (res.status === 401 && !skipRefresh && path !== '/auth/refresh' && path !== '/auth/me') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      if (MUTATING.has(method)) {
        csrfToken = null;
        init.headers['X-CSRF-Token'] = await ensureCsrf();
      }
      res = await fetch(url.toString().replace(window.location.origin, ''), init);
    }
  }

  // CSRF rotation — refetch once on first invalid token.
  if (res.status === 403) {
    try {
      const data = await res.clone().json();
      if (data?.error?.code === 'CSRF_INVALID' && MUTATING.has(method)) {
        csrfToken = null;
        init.headers['X-CSRF-Token'] = await ensureCsrf();
        res = await fetch(url.toString().replace(window.location.origin, ''), init);
      }
    } catch {
      /* non-json body, ignore */
    }
  }

  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const err = data?.error;
    throw new ApiError(err?.message || res.statusText || 'Request failed', {
      status: res.status,
      code: err?.code,
      details: err?.details,
    });
  }

  return data;
}

export const api = {
  get: (p, opts) => request('GET', p, opts),
  post: (p, body, opts) => request('POST', p, { body, ...opts }),
  patch: (p, body, opts) => request('PATCH', p, { body, ...opts }),
  put: (p, body, opts) => request('PUT', p, { body, ...opts }),
  del: (p, opts) => request('DELETE', p, opts),

  resetCsrf: () => {
    csrfToken = null;
  },
};
