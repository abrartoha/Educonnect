# Documentation of Auth Module

|||
|-----|-----|
| **Backend Developer:** | [Md Ariful Islam] |
| **Creation Date:** | 2026-05-09 |
| **Version:** | 1.0.0 |

---

## Overview

Handles all authentication and session management for the EduConnect platform. Covers user registration, login, JWT access token issuance, opaque refresh token rotation, logout, and CSRF token generation. Supports both cookie-based auth (web SPA) and Bearer token auth (mobile). Role-based registration flow auto-activates `STUDENT` accounts; all other roles (`UNIVERSITY`, `AGENT`, `CONSULTANT`) start as `PENDING` pending admin approval.

---

## Routes

| Method | Path | Auth | CSRF | Description |
|--------|------|:----:|:----:|-------------|
| `GET` | `/auth/csrf` | ❌ | ❌ | Issue a CSRF token for the SPA double-submit pattern |
| `POST` | `/auth/signup` | ❌ | ❌ | Register a new user account |
| `POST` | `/auth/login` | ❌ | ❌ | Authenticate and issue access + refresh tokens |
| `POST` | `/auth/refresh` | ❌ | ❌ | Rotate refresh token, issue new access token |
| `POST` | `/auth/logout` | ❌ | ✅ | Revoke refresh token and clear auth cookies |
| `GET` | `/auth/me` | ✅ | ❌ | Return the currently authenticated user's profile |

---

## Client API Alignment

### ✅ Alignments

- **Dual token delivery**: Both cookie (web SPA) and response body (mobile) are set on every auth response — client strategies are handled without a separate endpoint.
- **CSRF**: Mutating routes correctly require CSRF token via `csrfProtection` middleware. Login and signup are correctly exempted (no session exists yet).
- **Refresh cookie path**: Refresh token cookie is scoped to `/api/auth` so it is not sent on unrelated API calls.
- **Role-based status**: `STUDENT` accounts are immediately `ACTIVE`; all others start `PENDING` — matches the registration flow expected by the admin approval UI.

### ⚠️ Misalignments

- **`/me` returns `200 { user: null }` when unauthenticated** instead of `401`. The client `authStore` currently checks for a null user rather than catching a 401 — this works by coincidence but violates the ship plan's requirement of `401 when unauthenticated` on every protected endpoint.

---

## DB Models Used

| Model | Purpose |
|-------|---------|
| `User` | Core user record — holds role, email, passwordHash, status, name, avatarUrl |
| `RefreshToken` | Stores SHA-256 hash of each issued refresh token with expiry, userAgent, ip, revokedAt, and replacedBy chain for reuse detection |
| `UniversityProfile` | Created on UNIVERSITY signup via nested Prisma write |
| `AgentProfile` | Created on AGENT signup |
| `ConsultantProfile` | Created on CONSULTANT signup |
| `StudentProfile` | Created on STUDENT signup |

---

## Key Files

```
server/src/modules/auth/
├── auth.controller.js        # signup, login, refresh, logout, me, csrfToken handlers
├── auth.routes.js            # Route definitions, rate limiters, CSRF, validation
├── auth.service.js           # Core business logic — register, authenticate, token lifecycle
└── auth.schema.js            # Zod schemas for signup and login bodies

server/src/shared/
├── middleware/auth.js        # attachUser, requireAuth, requireRole
├── utils/tokens.js           # JWT sign/verify, opaque refresh token generation and hashing
└── utils/password.js         # Argon2id hash and verify
```

---

## Dependencies

- **Prisma** — all DB queries
- **jsonwebtoken** — access token sign and verify (HS256)
- **argon2** — password hashing (argon2id, OWASP parameters)
- **Node crypto** — opaque refresh token generation (64 random bytes) and SHA-256 hashing
- **Zod** — input validation via `validate()` middleware
- `asyncHandler` — wraps all controllers for error propagation

---

## Rate Limiting

All auth endpoints sit under `/api` and inherit the global `apiLimiter`. Login and signup additionally carry a dedicated `authLimiter` / `signupLimiter`.

### Current Configuration

| Parameter | Value | Environment Variable |
|-----------|-------|----------------------|
| Window | 15 minutes | `RATE_LIMIT_WINDOW_MS` |
| Limit | 300 requests | `RATE_LIMIT_MAX` |
| Key Strategy | User ID (authenticated) or IP (anonymous) | — |

### Infrastructure Note

The request chain is **Browser → Cloudflare → NGINX → Express**. The real client IP arrives in the `CF-Connecting-IP` header injected by Cloudflare — not in `X-Forwarded-For` or `req.ip` as Express sees them after NGINX. If the rate limiter key generator reads `req.ip` directly, all anonymous requests are bucketed against Cloudflare's egress IP rather than the real user's IP, making rate limiting ineffective for unauthenticated endpoints (login, signup, refresh). See Findings — P0 item 2 below.

### Module-Specific Recommendations

1. **Login** (`POST /auth/login`): Highest-value attack target. Suggested: 5 attempts per 15 minutes per IP using `CF-Connecting-IP` as the key.

2. **Signup** (`POST /auth/signup`): Suggested: 3 registrations per hour per IP to limit account-farming.

3. **Refresh** (`POST /auth/refresh`): Suggested: 10 requests per 15 minutes per IP. Refresh reuse already triggers full-family revocation, but rate limiting adds a second layer.

4. **Logout** (`POST /auth/logout`): Global limiter is sufficient — low abuse surface.

### Implementation Location

- Global limiter: `server/src/shared/middleware/rateLimits.js`
- Auth-specific limiters: `server/src/shared/middleware/rateLimits.js` (`authLimiter`, `signupLimiter`)
- Applied at route level: `server/src/modules/auth/auth.routes.js`

---

## Findings

### 🔴 P0 — Security Critical

#### P0-1 — PENDING users can authenticate and access protected routes

**File:** `auth.service.js` → `authenticateUser`, `shared/middleware/auth.js` → `loadUserFromToken`

`UNIVERSITY`, `AGENT`, and `CONSULTANT` accounts start with `status: 'PENDING'` at registration. In `authenticateUser`, only `SUSPENDED` is explicitly blocked — a `PENDING` user receives valid tokens. In `loadUserFromToken`, the guard is `user.status !== 'SUSPENDED'`, which also passes `PENDING` users through, setting `req.user` and granting access to any `requireAuth`-protected route without admin approval.

**Fix — `auth.service.js`:**
```js
if (user.status === 'SUSPENDED') throw new ForbiddenError('Account suspended');
if (user.status === 'PENDING')   throw new ForbiddenError('Account pending admin approval');
if (user.status !== 'ACTIVE')    throw new ForbiddenError('Account not active');
```

**Fix — `shared/middleware/auth.js`:**
```js
// Change:
if (user && user.status !== 'SUSPENDED') return user;
// To:
if (user && user.status === 'ACTIVE') return user;
```

---

#### P0-2 — Real client IP not reaching Express; rate limiting bucketed against Cloudflare's IP

**File:** `app.js`

`trust proxy` is set conditionally on `env.TRUST_PROXY`. In the `Cloudflare → NGINX → Express` chain, even when set, `trust proxy: 1` gives Express Cloudflare's egress IP, not the real client IP. Cloudflare injects the real IP in the `CF-Connecting-IP` header. The rate limiter key generator must read this header. Without this fix, all anonymous rate limit buckets (login, signup, refresh) are shared across every user routed through Cloudflare.

**Fix — `app.js`:**
```js
// Change:
if (env.TRUST_PROXY) app.set('trust proxy', 1);
// To (unconditional, trust 2 hops: Cloudflare + NGINX):
app.set('trust proxy', 2);
```

**Fix — `rateLimits.js` key generator:**
```js
keyGenerator: (req) =>
  req.headers['cf-connecting-ip'] ||
  req.headers['x-real-ip'] ||
  req.ip,
```

---

### 🟡 P1 — Feature Broken

#### P1-1 — `/me` returns `200 { user: null }` instead of `401` when unauthenticated

**File:** `auth.routes.js`, `auth.controller.js`

`/me` has no `requireAuth` middleware on the route. The controller handles unauthenticated access with a soft `return res.json({ user: null })`. The ship plan requires `401 when unauthenticated` for every protected endpoint.

**Fix — `auth.routes.js`:**
```js
router.get('/me', requireAuth, asyncHandler(me));
```

**Fix — `auth.controller.js`:** Remove the null guard; `requireAuth` handles it. Add status check after DB fetch:
```js
export const me = async (req, res) => {
  const full = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true, status: true, avatarUrl: true },
  });
  if (!full || full.status !== 'ACTIVE') throw new ForbiddenError();
  res.json({ user: full });
};
```

---

#### P1-2 — Suspended user can read their profile via `/me` using a valid access token

**File:** `auth.controller.js` → `me`

A user suspended after their access token was issued retains access to `/me` for the token's remaining lifetime (up to 15 min). `loadUserFromToken` in `auth.js` checks `status !== 'SUSPENDED'` which would block them at the middleware level — however this only works if `attachUser` runs and the user is re-fetched from DB on every request. The controller should not assume the middleware state is current.

**Fix:** Already covered by P1-1 fix above — the `full.status !== 'ACTIVE'` check after the DB fetch in `me` closes this gap at the controller level.

---

### 🔵 P2 — Polish / Deferred

#### P2-1 — No failed login tracking; account lockout requirement unmet

**File:** `auth.service.js` → `authenticateUser`

The ship plan requires *"lockout after N failed logins"* as a tested auth flow requirement. No `failedLoginAttempts` or `lockedUntil` field is tracked. Implementation requires a Prisma schema migration — coordinate with the team before opening a schema-changing PR.

**Deferred:** Requires schema change. Ticket raised for Week 2.

---

#### P2-2 — `buildProfileData` silent default case

**File:** `auth.service.js`

Unknown roles return `{}` silently. Zod catches this upstream, but defense-in-depth dictates an explicit throw:
```js
default:
  throw new Error(`buildProfileData: unknown role "${role}"`);
```

---

#### P2-3 — Token verification errors silently swallowed in `loadUserFromToken`

**File:** `shared/middleware/auth.js`

The catch block discards all token errors without logging. Malformed tokens, algorithm confusion attempts, and expired tokens all disappear silently. Sentry and the log aggregation pipeline receive no signal.

```js
} catch (err) {
  req.log?.debug({ err }, 'token verification failed');
}
```

---

#### P2-4 — `TRUST_PROXY` should not be optional in production

**File:** `app.js`, `config/env.js`, `server/.env.example`

`trust proxy` is gated on `env.TRUST_PROXY`. In production behind NGINX this must always be set — if it is missing from the environment the application silently runs without it. Add a startup assertion in `env.js` and document the variable in `.env.example` with a comment.

---

#### P2-5 — Refresh token returned in response body; confirm NGINX is not logging response bodies

**File:** `auth.controller.js` — all auth responses

Tokens are returned in the response body intentionally for mobile clients. If NGINX, Pino, or any APM layer (Datadog, Sentry) is configured to log response bodies, refresh tokens are exfiltrated into logs. **DevOps to confirm NGINX `access_log` does not include response body and that Pino `serializers` redact token fields.**
