## The Core Idea
A **flexible, configurable rate limiter** that tracks request frequency by different scopes:
- **IP scope** — limits by source IP + User-Agent (catch distributed attacks)
- **Email scope** — limits by email address (prevent signup/login hammering)
- **User scope** — limits by authenticated user ID (prevent API abuse)

The limiter uses Redis for fast, distributed tracking and supports temporary blocking after exceeding limits.

## Making Custom Limiter
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

## Server Side Code Sample

```js
import { signupLimiter, loginLimiter, apiLimiter } from '../middleware/ratelimiter/presets.js'

// Signup route — max 5 attempts per email per hour
router.post(
  '/auth/signup',
  signupLimiter,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);

// Login route — max 5 attempts per email per 15 minutes
router.post(
  '/auth/login',
  loginLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login)
);

// General API route — max 5 requests per minute per IP
router.get(
  '/api/protected',
  apiLimiter,
  asyncHandler(handler)
);
```

## Full Flow

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

## Fingerprinting Strategy

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

## Preset Configurations

### globalLimiter
```js
// 100 requests per minute globally
// Used as a catch-all for all routes
window: 60 seconds
limit: 100
scope: "ip"
```

### apiLimiter
```js
// 5 requests per minute per IP
// Blocks for 15 minutes after exceeding
window: 60 seconds
limit: 5
blockDuration: 900 seconds (15 min)
scope: "ip"
```

### loginLimiter
```js
// 5 login attempts per email per 15 minutes
// Blocks for 30 minutes after exceeding (prevent password spraying)
window: 900 seconds (15 min)
limit: 5
scope: "email"
blockDuration: 1800 seconds (30 min)
routeSpecificLimit: true
```

### signupLimiter
```js
// 5 signup attempts per email per hour
// Blocks for 1 hour after exceeding (prevent account enumeration)
window: 3600 seconds (1 hour)
limit: 5
scope: "email"
blockDuration: 3600 seconds (1 hour)
routeSpecificLimit: true
```

## HTTP Headers

Rate limiters automatically set industry-standard headers:

```
X-RateLimit-Limit: 5           ← max requests allowed
X-RateLimit-Remaining: 3       ← requests left before block
```

## Error Responses

### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many requests."
}
```
**HTTP Status:** `429 Too Many Requests`

### Temporarily Blocked
```json
{
  "success": false,
  "message": "You are temporarily blocked due to repeated rate limit violations."
}
```
**HTTP Status:** `429 Too Many Requests`

## Fail-Open Behavior

If Redis is down, the rate limiter **fails open** (allows request through):
```js
catch (err) {
  console.error("Rate limiter error:", err);
  next(); // proceed anyway — avoid blocking legitimate users
}
```

This is a production best practice: it's better to miss some abuse than to block all users.