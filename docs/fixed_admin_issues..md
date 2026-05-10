# Findings — Admin Module
Date: 2026-05-09

## modules/admin/admin.routes.js
- No issues found.
- GOOD: router.use(requireAuth, requireRole('ADMIN')) protects 
  all routes at the top level — no route can be accidentally 
  left unprotected.
- GOOD: CSRF protection on every mutating route.
- GOOD: Zod validation on params and body throughout.

## modules/admin/admin.controller.js
- P2: setPostStatus calls prisma.post.update() directly without 
  a prior findUnique check. If the post ID does not exist, 
  Prisma throws a raw P2025 error instead of a clean 404. 
  All other handlers in this file do the findUnique check 
  correctly — this one was missed.
  Fix: add findUnique + NotFoundError before the update, 
  matching the pattern in setPostPin.

- P2: suspendEntity has no self-suspension guard. An admin 
  can suspend their own account and lock themselves out. 
  Add: if (req.params.id === req.user.id) throw new 
  BadRequestError('Cannot suspend your own account').

- P2: overview() fires 7 parallel DB queries on every dashboard 
  load. Works correctly but could be reduced to 2-3 queries 
  using Prisma groupBy. Defer to v1.1.