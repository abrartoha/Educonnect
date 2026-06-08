## The Core Idea
A **flexible, configurable rate limiter** that tracks request frequency by different scopes:
- **IP scope** — limits by source IP + User-Agent (catch distributed attacks)
- **Email scope** — limits by email address (prevent signup/login hammering)
- **User scope** — limits by authenticated user ID (prevent API abuse)

The limiter uses Redis for fast, distributed tracking and supports temporary blocking after exceeding limits.

### Making Custom Limiter
```js
export const loginLimiter = rateLimiter({
    window: 15 * 60, // 15 minutes (in seconds)
    limit: 5,
    scope: "email",
    blockDuration: 30 * 60, // Block for 30 minutes after exceeding limit (in seconds)
    routeSpecificLimit: true,
});
```

### Parameter Descriptions

| Parameter | Type | Description |
|-----------|------|-------------|
| **window** | number | Time window in seconds. Requests within this period are counted together. Example: `15 * 60` = 15 minutes |
| **limit** | number | Maximum number of requests allowed within the window. Example: `5` means max 5 requests per 15 minutes |
| **scope** | string | Tracking scope: `"ip"` (by IP + User-Agent), `"email"` (by email address), or `"user"` (by user ID) |
| **blockDuration** | number | How long (in seconds) to block the user after exceeding the limit. Example: `30 * 60` = 30 minutes |
| **routeSpecificLimit** | boolean | When `true`, the limit is applied per route. When `false`, limits are shared across all routes using this limiter |

### Full Flow

```
POST /auth/signup
│
├── signupLimiter middleware
│   │
│   ├── createFingerprint(req, scope="email")
│   │   ├── extract email from req.body
│   │   ├── extract User-Agent from headers
│   │   ├── hash: sha1(email + UA)
│   │   └── key = "rl:email:user@example.com:/auth/signup:hash:3600"
│   │
│   ├── Check Redis for block key
│   │   ├── exists: "rl:email:user@example.com:.../auth/signup:hash:3600:blocked"?
│   │   ├── YES ❌ return 429 "You are temporarily blocked"
│   │   └── NO ✅ proceed
│   │
│   ├── Increment counter
│   │   ├── INCR "rl:email:user@example.com:/auth/signup:hash:3600"
│   │   ├── currentCount = 1 (first request in window)
│   │   ├── if count === 1: SET expiry to window duration (1 hour)
│   │   └── currentCount is now tracked
│   │
│   ├── Check against limit (limit=5)
│   │   ├── currentCount > limit?
│   │   ├── NO ✅ set rate-limit headers, proceed
│   │   └── YES ❌ set block key with blockDuration (1 hour), return 429
│   │
│   └── next()
```

### Fingerprinting Strategy

The fingerprint combines **IP + User-Agent** (for IP scope) to prevent simple spoofing:

```
Scope: IP
│
├── IP: 192.168.1.100 + UA: "Mozilla/5.0..."
├── hash = sha1("192.168.1.100:Mozilla/5.0...") = "abc123def456..."
├── key = "rl:ip:192.168.1.100:/auth/signup:abc123def456:3600"
│
Scope: Email
│
├── Email: user@example.com + UA: "Mozilla/5.0..."
├── hash = sha1("user@example.com:Mozilla/5.0...") = "xyz789abc123..."
├── key = "rl:email:user@example.com:/auth/signup:xyz789abc123:3600"
```

This catches:
- VPN users switching IPs mid-attack (UA won't change)
- Different IPs with same UA (bot farm with same script)

### Fail-Open Behavior

If Redis is down, the rate limiter **fails open** (allows request through):
```js
catch (err) {
  console.error("Rate limiter error:", err);
  next(); // proceed anyway — avoid blocking legitimate users
}
```

This is a production best practice: it's better to miss some abuse than to block all users.

---

## Redis-Backed Preset Configurations

All presets are defined in `server/src/shared/constants/rateLimits.js` and instantiated in `server/src/shared/middleware/ratelimiter/presets.js`. Every value can be overridden via `RL_*` environment variables.

### General

#### globalLimiter
```js
// 100 requests per minute globally
// Used as a catch-all for all routes
window: 60 seconds
limit: 100
scope: "ip"
```
Env overrides: `RL_GLOBAL_WINDOW`, `RL_GLOBAL_LIMIT`

#### apiLimiter
```js
// 5 requests per minute per IP
// Blocks for 15 minutes after exceeding
window: 60 seconds
limit: 5
blockDuration: 900 seconds (15 min)
scope: "ip"
```
Env overrides: `RL_API_WINDOW`, `RL_API_LIMIT`, `RL_API_BLOCK`

### Auth

#### loginLimiter
```js
// 5 login attempts per email per 15 minutes
// Blocks for 30 minutes after exceeding (prevent password spraying)
window: 900 seconds (15 min)
limit: 5
scope: "email"
blockDuration: 1800 seconds (30 min)
routeSpecificLimit: true
```
Env overrides: `RL_LOGIN_WINDOW`, `RL_LOGIN_LIMIT`, `RL_LOGIN_BLOCK`

#### signupLimiter
```js
// 5 signup attempts per email per hour
// Blocks for 1 hour after exceeding (prevent account enumeration)
window: 3600 seconds (1 hour)
limit: 5
scope: "email"
blockDuration: 3600 seconds (1 hour)
routeSpecificLimit: true
```
Env overrides: `RL_SIGNUP_WINDOW`, `RL_SIGNUP_LIMIT`, `RL_SIGNUP_BLOCK`

### Directory

#### directoryListLimiter
```js
// 10 list requests per minute per user
// Blocks for 5 minutes after exceeding
// Applied to: GET /universities, GET /agents, GET /consultants
window: 60 seconds
limit: 10
scope: "user"
blockDuration: 300 seconds (5 min)
routeSpecificLimit: true
```
Env overrides: `RL_DIR_LIST_WINDOW`, `RL_DIR_LIST_LIMIT`, `RL_DIR_LIST_BLOCK`

#### directoryReadLimiter
```js
// 20 read requests per minute per user
// Blocks for 5 minutes after exceeding
// Applied to: GET /universities/:id, GET /agents/:id, GET /consultants/:id
window: 60 seconds
limit: 20
scope: "user"
blockDuration: 300 seconds (5 min)
routeSpecificLimit: true
```
Env overrides: `RL_DIR_READ_WINDOW`, `RL_DIR_READ_LIMIT`, `RL_DIR_READ_BLOCK`

#### directoryCompareLimiter
```js
// 5 compare requests per minute per user
// Blocks for 5 minutes after exceeding (heavy multi-ID query)
// Applied to: GET /universities/compare
window: 60 seconds
limit: 5
scope: "user"
blockDuration: 300 seconds (5 min)
routeSpecificLimit: true
```
Env overrides: `RL_DIR_COMPARE_WINDOW`, `RL_DIR_COMPARE_LIMIT`, `RL_DIR_COMPARE_BLOCK`

#### directoryWriteLimiter
```js
// 5 write requests per hour per user
// Blocks for 1 hour after exceeding
// Applied to: PATCH /universities/me, PATCH /agents/me, PATCH /consultants/me, PATCH /students/me
window: 3600 seconds (1 hour)
limit: 5
scope: "user"
blockDuration: 3600 seconds (1 hour)
```
Env overrides: `RL_DIR_WRITE_WINDOW`, `RL_DIR_WRITE_LIMIT`, `RL_DIR_WRITE_BLOCK`

---

## Legacy Rate Limiters (`express-rate-limit`)

Defined in `server/src/shared/middleware/rateLimits.js`. Uses in-memory storage (not shared across instances). Always active even if Redis is unavailable.

### apiLimiter (legacy)
- **Window:** `RATE_LIMIT_WINDOW_MS` (default 900000ms = 15 min)
- **Limit:** `RATE_LIMIT_MAX` (default 300)
- **Key:** `req.user.id` or `req.ip`
- **Used at:** `app.js:82` — mounted on `/api` prefix as a global baseline

### authLimiter
- **Window:** `RATE_LIMIT_WINDOW_MS` (default 900000ms = 15 min)
- **Limit:** `AUTH_RATE_LIMIT_MAX` (default 10)
- **Key:** IP-based (default)
- **Note:** `skipSuccessfulRequests: true` — only failed attempts count
- **Used at:** `auth.routes.js` — `POST /auth/login`, `POST /auth/refresh`

### signupLimiter (legacy)
- **Window:** 1 hour (hardcoded)
- **Limit:** 5
- **Key:** IP-based (default)
- **Used at:** `auth.routes.js` — `POST /auth/signup`

> **Note:** The auth routes currently use the **legacy** `express-rate-limit` system. A Redis-backed `loginLimiter` and `signupLimiter` exist in presets but are not yet wired to auth routes.

---

## Server Side Code Sample

### Redis-backed (directory routes)
```js
import {
  directoryListLimiter,
  directoryReadLimiter,
  directoryCompareLimiter,
  directoryWriteLimiter,
} from '../../shared/middleware/ratelimiter/presets.js';

// List universities — max 10 per minute per user
router.get('/universities', requireAuth, directoryListLimiter, asyncHandler(listUniversities));

// Compare — max 5 per minute per user
router.get('/universities/compare', requireAuth, directoryCompareLimiter, asyncHandler(compareUniversities));

// Read — max 20 per minute per user
router.get('/universities/:id', requireAuth, directoryReadLimiter, asyncHandler(getUniversity));

// Write — max 5 per hour per user
router.patch('/universities/me', requireAuth, directoryWriteLimiter, asyncHandler(updateOwnProfile));
```

### Legacy (auth routes)
```js
import { authLimiter, signupLimiter } from '../../shared/middleware/rateLimits.js';

// Signup — max 5 per hour per IP
router.post('/auth/signup', signupLimiter, validate({ body: signupSchema }), asyncHandler(signup));

// Login — max 10 failures per 15 min per IP
router.post('/auth/login', authLimiter, validate({ body: loginSchema }), asyncHandler(login));
```

---

## HTTP Headers

Redis-backed limiters set industry-standard headers (draft-7):

```
X-RateLimit-Limit: 5           ← max requests allowed in window
X-RateLimit-Remaining: 3       ← requests left before limit
```

Legacy limiters also set `X-RateLimit-Limit` and `X-RateLimit-Remaining` via `express-rate-limit` with `standardHeaders: 'draft-7'`.

---

## Error Responses

### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many requests."
}
```
**HTTP Status:** `429 Too Many Requests`

### Temporarily Blocked (Redis-backed only)
```json
{
  "success": false,
  "message": "You are temporarily blocked due to repeated rate limit violations."
}
```
**HTTP Status:** `429 Too Many Requests`

---

## Environment Variables

All rate limit env vars are defined in `server/src/config/env.js` via Zod schema.

### Legacy (`express-rate-limit`)
| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Window for `apiLimiter` and `authLimiter` |
| `RATE_LIMIT_MAX` | `300` | Max requests per window for `apiLimiter` |
| `AUTH_RATE_LIMIT_MAX` | `10` | Max failed attempts per window for `authLimiter` |

### Redis-backed overrides
| Variable | Default | Profile |
|----------|---------|---------|
| `RL_GLOBAL_WINDOW` | `60` | global |
| `RL_GLOBAL_LIMIT` | `100` | global |
| `RL_API_WINDOW` | `60` | api |
| `RL_API_LIMIT` | `5` | api |
| `RL_API_BLOCK` | `900` | api |
| `RL_LOGIN_WINDOW` | `900` | login |
| `RL_LOGIN_LIMIT` | `5` | login |
| `RL_LOGIN_BLOCK` | `1800` | login |
| `RL_SIGNUP_WINDOW` | `3600` | signup |
| `RL_SIGNUP_LIMIT` | `5` | signup |
| `RL_SIGNUP_BLOCK` | `3600` | signup |
| `RL_DIR_LIST_WINDOW` | `60` | directoryList |
| `RL_DIR_LIST_LIMIT` | `10` | directoryList |
| `RL_DIR_LIST_BLOCK` | `300` | directoryList |
| `RL_DIR_READ_WINDOW` | `60` | directoryRead |
| `RL_DIR_READ_LIMIT` | `20` | directoryRead |
| `RL_DIR_READ_BLOCK` | `300` | directoryRead |
| `RL_DIR_COMPARE_WINDOW` | `60` | directoryCompare |
| `RL_DIR_COMPARE_LIMIT` | `5` | directoryCompare |
| `RL_DIR_COMPARE_BLOCK` | `300` | directoryCompare |
| `RL_DIR_WRITE_WINDOW` | `3600` | directoryWrite |
| `RL_DIR_WRITE_LIMIT` | `5` | directoryWrite |
| `RL_DIR_WRITE_BLOCK` | `3600` | directoryWrite |
