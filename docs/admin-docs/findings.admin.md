# Documentation of Admin Module

|||
|-----|-----|
| **Backend Developer:** | [Md Ariful Islam] |
| **Creation Date:** | 2026-05-09 |
| **Version:** | 1.0.0 |

---

## Overview

Handles all admin-facing operations for the EduConnect platform. Provides a dashboard overview, user management (list, approve, suspend, reactivate), and post moderation (pin, status). All routes are protected at the router level by `requireAuth` + `requireRole('ADMIN')` — no route can be accidentally left unprotected. CSRF protection is applied to every mutating operation.

---

## Routes

| Method | Path | Auth | CSRF | Description |
|--------|------|:----:|:----:|-------------|
| `GET` | `/admin/overview` | ✅ ADMIN | ❌ | Dashboard counters — users, posts, leads, pending approvals |
| `GET` | `/admin/users` | ✅ ADMIN | ❌ | Paginated user list with role, status, and search filters |
| `POST` | `/admin/users/:id/approve` | ✅ ADMIN | ✅ | Approve a PENDING entity; sets status ACTIVE and verified flag |
| `POST` | `/admin/users/:id/suspend` | ✅ ADMIN | ✅ | Suspend a user and immediately revoke all refresh tokens |
| `POST` | `/admin/users/:id/reactivate` | ✅ ADMIN | ✅ | Reactivate a suspended entity account |
| `POST` | `/admin/posts/:id/pin` | ✅ ADMIN | ✅ | Toggle the isPinned flag on a post |
| `PATCH` | `/admin/posts/:id/status` | ✅ ADMIN | ✅ | Set post status to PUBLISHED, HIDDEN, or REMOVED |

---

## Client API Alignment

### ✅ Alignments

- **Router-level auth guard**: `router.use(requireAuth, requireRole('ADMIN'))` protects all routes at mount — no individual route can be accidentally left unprotected.
- **CSRF on all mutating routes**: Every `POST` and `PATCH` correctly applies `csrfProtection`.
- **Zod validation throughout**: Params and body are validated on every route.
- **Immediate session revocation on suspend**: `suspendEntity` calls `revokeAllForUser` after the status update, kicking the user out without waiting for their access token to expire.
- **Approval sets verified flag**: `approveEntity` uses a nested Prisma update to set both `status: 'ACTIVE'` and the role-specific `verified: true` in a single operation.

### ⚠️ Misalignments

- **`reactivateEntity` has no role guard** — an admin can reactivate a `STUDENT` or `ADMIN` account that was suspended. `approveEntity` correctly restricts to `UNIVERSITY`, `AGENT`, `CONSULTANT`; `reactivateEntity` should mirror this. See Findings — P1 item 1.

---

## DB Models Used

| Model | Purpose |
|-------|---------|
| `User` | Core user record — queried and updated for all user management operations |
| `UniversityProfile` | Updated (verified flag) on university approval |
| `AgentProfile` | Updated (verified flag) on agent approval |
| `ConsultantProfile` | Updated (verified flag) on consultant approval |
| `StudentProfile` | Returned in user select (read-only in admin module) |
| `RefreshToken` | All tokens for a user revoked on suspension via `revokeAllForUser` |
| `Post` | Updated for pin toggle and status changes |
| `Lead` | Count only — used in dashboard overview |

---

## Key Files

```
server/src/modules/admin/
├── admin.controller.js   # All handlers — listUsers, approveEntity, suspendEntity,
│                         # reactivateEntity, setPostPin, setPostStatus, overview
└── admin.routes.js       # Route definitions, auth guards, CSRF, validation schemas
```

---

## Dependencies

- **Prisma** — all DB queries
- **Zod** — inline schemas in `admin.routes.js` for query and body validation
- `asyncHandler` — wraps all controllers for error propagation
- `revokeAllForUser` — imported from `auth.service.js` for immediate session termination on suspend

---

## Rate Limiting

All admin endpoints inherit the global `apiLimiter` via `app.js`. Because every route requires `ADMIN` role, the rate limit key is always the authenticated user ID — IP bucketing does not apply here.

### Current Configuration

| Parameter | Value | Environment Variable |
|-----------|-------|----------------------|
| Window | 15 minutes | `RATE_LIMIT_WINDOW_MS` |
| Limit | 300 requests | `RATE_LIMIT_MAX` |
| Key Strategy | User ID (authenticated) | — |

### Module-Specific Recommendations

The global limiter is appropriate for the admin module given the low expected request volume and the hard role requirement. No additional per-route limiters are recommended at this stage. If the admin panel adds bulk operations in a future version, a stricter limiter on those endpoints should be introduced at that point.

### Implementation Location

- Global limiter: `server/src/shared/middleware/rateLimits.js`
- Applied in: `server/src/app.js` at `/api` mount

---

## Findings

### 🟡 P1 — Feature Broken

#### P1-1 — `reactivateEntity` has no role guard

**File:** `admin.controller.js` → `reactivateEntity`

`approveEntity` correctly checks that only `UNIVERSITY`, `AGENT`, and `CONSULTANT` accounts are approvable, throwing `BadRequestError` for other roles. `reactivateEntity` performs no such check — an admin can reactivate a suspended `STUDENT` or `ADMIN` account through this endpoint, which is not an intended operation. The fix mirrors the guard already in `approveEntity`.

---

### 🔵 P2 — Fixed / Deferred

#### P2-1 — `setPostStatus` missing 404 check ✅ Fixed

**File:** `admin.controller.js` → `setPostStatus`

Previously called `prisma.post.update()` directly without a prior `findUnique` check. If the post ID did not exist, Prisma threw a raw `P2025` error instead of a clean `404`. Fixed to match the pattern already in `setPostPin` — `findUnique` + `NotFoundError` before the update.

---

#### P2-2 — `suspendEntity` self-suspension guard ✅ Fixed

---

#### P2-3 — `overview` fires 7 parallel DB queries on every dashboard load

**File:** `admin.controller.js` → `overview`

Seven `prisma.user.count()` and `prisma.post.count()` calls run in parallel via `Promise.all` on every dashboard load. Functionally correct, but the user counts could be reduced to 1–2 queries using `prisma.user.groupBy({ by: ['role', 'status'] })`.

**Deferred:** Low impact at current scale. Ticket raised for v1.1.
