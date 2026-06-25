# Findings of Directory Module
|||
|-----|-----|
| **Backend Developer:** | Jakariya Abbas |
| **Creation Date:** | 07-05-2026 |

## Bugs & Gaps

### Input Validation
- [x] **`GET /universities/compare`** — no validation on `req.query.ids` allows any input. (Severity: **High**)
    - FIXED in PR(fix/validate-university-compare-ids): `validate({ query: compareQuery })` is now present in routes.
- [ ] **Numeric optional fields** (`foundedYear`, `ranking`, `yearsExperience`, `hourlyRate`, etc.) use `z.coerce.number()`. If submitted as an empty string (e.g., clearing a form), they coerce to `0` and fail `.min()` constraints. (Severity: **Medium**)
- [ ] **Range fields** (`tuitionMin`/`tuitionMax`, `budgetMin`/`budgetMax`) lack cross-field validation to ensure `min <= max`. (Severity: **Medium**)
- [ ] **`compareQuery`** should compare only 2-3 universities based on the frontend implementation. (Severity: **Low**)

### Security & Privacy
- [ ] **Public endpoints return `email`** via `uniSelect/agentSelect/consultantSelect` — exposes PII. (Severity: **Critical**)
    - Remove email from selects in `directory.service.js` for all public-facing routes. No need to show emails to other users.
- [ ] **No authentication on list endpoints** — `GET /universities`, `GET /agents`, `GET /consultants` have no access control. (Severity: **High**)
    - Should implement auth checks or remains public if intended.
- [ ] **Unbounded pagination** — `buildListArgs` accepts `limit` directly from user without clamping. (Severity: **High**)
    - Attack: `?limit=10000` causes memory exhaustion or DB load spike.
    - Fix: Add `Math.min(limit, 100)` in `directory.service.js:71` (inside `buildListArgs`).
- [ ] **Unthrottled view counter** — every `GET /universities/:id` triggers DB write (Severity: **Medium**)
    - Attack: High-frequency requests spam the DB.
    - Fix: Throttle to once per session/IP per hour, or batch via async job.
- [ ] **Sequential ID enumeration** — internal `id` field exposed, enabling attacker to scrape all records by incrementing IDs. (Severity: **Medium**)
    - Fix: Consider opaque `publicId` or UUID for public-facing identifiers.

### Schema / Controller Mismatches
- [x] **`updateOwnProfile` — `name` field** — controller accepts `name` and role-specific schemas have been updated to include `name`. (Severity: **N/A** — Fixed)
- [ ] **`updateOwnProfile` — `avatarUrl` field** — controller accepts `avatarUrl` but role-specific schemas don't include it, so `avatarUrl` updates get silently stripped by validation middleware. (Severity: **Low**)
- [ ] **`optStr` and `optUrl` empty string handling** — transform empty strings (`""`) to `undefined`. Since Prisma ignores `undefined` values during updates, users cannot clear optional string/URL fields once set. (Severity: **Medium**)
- [ ] **`updateOwnProfile` upsert** — updates related profile using `{ [profileRel]: { update: profile } }`. If a user's related profile record is missing/corrupted, this throws a Prisma error instead of creating it. (Severity: **High**)

### Query / Prisma Filter Issues
- [ ] **`q` search relation syntax** — uses `{ [profileKey]: { description: { contains } } }` but MUST use `{ [profileKey]: { is: { description: { contains } } } }` for 1:1 relations. (Severity: **Critical** — Will throw Prisma error)
- [ ] **Verified/location filter clobbering** — both filters spread top-level `[profileKey]` key into where, causing the second to overwrite the first. (Severity: **High**)
    - Needs to be merged. Or create profileFilter object first.
- [ ] **Query complexity risk** — `q` search uses `OR` with `mode: 'insensitive'` on multiple columns. With large datasets, this causes slow queries. (Severity: **Medium**)
    - Consider adding search rate limiting or switching to full-text search indexes.

### Error Handling
- [ ] **Silent error swallowing** — `getProfileById` uses `.catch(() => {})` which swallows all DB errors silently, no logging if `universityProfile` views increment fails. (Severity: **Low**)
- [x] **`compareUniversities` error response** — returns `200` with an error object on invalid input. (Severity: **Medium** — Fixed)
    - FIXED in PR(fix/validate-university-compare-ids).


