# Findings of Business Module
|||
|-----|-----|
| **Backend Developer:** | Jakariya Abbas |
| **Creation Date:** | 11-06-2026 |

## Bugs & Gaps

- **No pagination** on any of the 4 list endpoints — unbounded findMany enables DoS
- **Missing date cross-validation** on updateCampaignSchema — can create impossible date ranges (e.g. `startDate > endDate`)
- **Unauthenticated reviews listing** (GET /reviews/target/:id) with no pagination and only the generic global rate limiter — attractive scraping/DoS target
- **Broken lead status state machine** — permits arbitrary status jumps (e.g. transitioning from `CLOSED` back to `NEW` or jumping straight to `CONVERTED`)
- **Mass assignment via raw req.body spread** — campaign create and update endpoints spread the entire body into Prisma, creating a fragile pattern where fields could be modified if schema validation changes
- ❓️ **Student email leaked to providers** — the `userMini` selection in leads queries includes `email`, exposing the student's raw email to receiving universities, agents, and consultants
- **No rate limiting or cooldown on lead submission** — students can submit unlimited leads to any target, making it a target for spam and artificial inquiries counter inflation
- **No duplicate lead guard** — the system lacks any application or database-level unique constraints to prevent a student from spamming the exact same target/programme combination repeatedly
- **TOCTOU race condition in review duplicate check** — because the duplicate check runs outside the database transaction, concurrent submissions can bypass it and trigger a 500 error instead of a clean 409 Conflict response
- **Redundant role checks in controller** — `listMySubmittedLeads` and `createReview` perform manual role checks that return 400 Bad Request instead of relying solely on the route-level 403 `requireRole` middleware
- **Bypassing of responseHandler utility** — the entire module uses raw `res.json()` instead of the standard envelope wrapper, creating inconsistent API responses across the monorepo
- **Loose ID validation in schemas** — Zod schemas accept any string up to 40 characters for entity IDs instead of validating them strictly as CUIDs
- **Inconsistent DELETE response** — `deleteCampaign` returns a `200 { ok: true }` body instead of a standard `204 No Content` status
- **Schema leakage on campaign creation** — the creation response returns the full database record including system-managed fields like `impressions` and `clicks` without a filtering `select` clause