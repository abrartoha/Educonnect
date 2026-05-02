import { API_BASE_URL } from './config';
import { tokenStorage } from '../auth/storage';

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise = null;

// Callback injected by the AuthProvider so the client can force a logout
// when the refresh token is revoked / expired.
let onAuthExpired = null;
export const setOnAuthExpired = (fn) => {
  onAuthExpired = fn;
};

async function tryRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await tokenStorage.getRefresh();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.tokens) {
        await tokenStorage.save(data.tokens);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(method, path, { body, query, retry = true } = {}) {
  const url = new URL(`${API_BASE_URL}/api${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(k, val));
      else url.searchParams.set(k, String(v));
    }
  }

  const access = await tokenStorage.getAccess();
  const headers = { Accept: 'application/json' };
  if (access) headers.Authorization = `Bearer ${access}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const init = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Mobile is Bearer-auth only — don't let iOS NSURLSession quietly persist
    // cookies the server sets on login responses (causes CSRF false-positives).
    credentials: 'omit',
  };

  let res;
  try {
    res = await fetch(url.toString(), init);
  } catch (err) {
    throw new ApiError(err?.message || 'Network request failed', { status: 0 });
  }

  // Auto-refresh on 401 — don't recurse on the refresh endpoint itself.
  if (res.status === 401 && retry && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(method, path, { body, query, retry: false });
    }
    // Refresh failed — surface an auth-expired event so the UI can redirect.
    onAuthExpired?.();
  }

  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
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
};
