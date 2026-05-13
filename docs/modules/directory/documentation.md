# Documentation of Directory Module
|||
|-----|-----|
| **Backend Developer:** | Jakariya Abbas |
| **Creation Date:** | 08-05-2026 |
| **Version:** | 1.0.0 |

---

## Overview

Handles public directory listings and profile lookups for universities, agents, and consultants. Supports search, pagination, and university comparison. No auth required for listing endpoints.

---

## Routes

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/universities` | ❌ | Paginated list with search & filters |
| `GET` | `/universities/compare` | ❌ | Compare 2–3 universities by ID |
| `GET` | `/universities/:id` | ❌ | Single university profile |
| `PATCH` | `/universities/me` | ✅ | Update own university profile |
| `GET` | `/agents` | ❌ | Paginated agent listing |
| `GET` | `/agents/:id` | ❌ | Single agent profile |
| `PATCH` | `/agents/me` | ✅ | Update own agent profile |
| `GET` | `/consultants` | ❌ | Paginated consultant listing |
| `GET` | `/consultants/:id` | ❌ | Single consultant profile |
| `PATCH` | `/consultants/me` | ✅ | Update own consultant profile |
| `PATCH` | `/students/me` | ✅ | Update own student profile (not public) |

OpenAPI spec avaialable at [openapi.yaml](./openapi.yaml).

---

## Client API Alignment

The backend routes have a **1-to-1 mapping** with `directoryApi` in `client/src/api/endpoints.js` at the route level. However, there are **significant misalignments** in query parameters, sort options, schema fields, and filtering strategy. These are documented below.

### ✅ Alighnments

- **Route Coverage**: Every route in `directory.routes.js` has a corresponding method in `directoryApi` (`endpoints.js`).
- **Array Parsing**: The client uses `ids.join(',')` for `compareUniversities`; the backend `compareQuery` schema anticipates this with `split(',')`.
- **CSRF / Cookie Auth**: Mutating endpoints (`PATCH`) correctly acquire and send CSRF tokens via `client.js`.
- **Response Normalisation**: `normaliseDirectoryItem` in `mappers.js` correctly flattens the nested `User → profile` shape returned by all `GET` list/detail endpoints.

### ⚠️ Misalignments

#### Client Does Browser Filtering, Bypasses Server-Side Filtering (All Listing Pages)

All three listing pages (`Universities.jsx`, `Agents.jsx`, `Consultants.jsx`) fetch with only `{ limit: 60 }` and perform **all filtering in-browser** (search, location, courses, tuition, ranking, specialisations, languages, rating). The backend `listQuery` schema supports `q`, `location`, `verified`, and `sort` — but the client never sends them. This means:

- Pagination is broken: the client fetches at most 60 records and cannot access page 2+.
- Server-side `q`, `location`, and `verified` filters are dead code from the client's perspective.
- Large datasets will degrade browser performance.

---

## DB Models Used

| Model | Purpose |
|-------|---------|
| `User` | Core user record (holds role, email, name, avatarUrl) |
| `UniversityProfile` | 1:1 extended profile for universities (description, location, etc.) |
| `AgentProfile` | 1:1 extended profile for agents |
| `ConsultantProfile` | 1:1 extended profile for consultants |
| `StudentProfile` | 1:1 extended profile for students (updated via `/students/me`) |

All profiles are 1:1 relations with the `User` model

---

## Key Files

```
server/src/modules/directory/
├── directory.controller.js   # All handlers
├── directory.routes.js       # Route definitions + middleware
└── profile.schema.js         # Zod schemas (listQuery, compareQuery, update schemas)
```

---

## Dependencies

- **Prisma** — all DB queries
- **Zod** — input validation via `validate()` middleware
- `asyncHandler` — wraps all controllers for error propagation

---

## Rate Limiting

All directory endpoints are protected by the global `apiLimiter` applied at `server/src/app.js:80`:

### Current Configuration

| Parameter | Value | Environment Variable |
|-----------|-------|----------------------|
| Window | 15 minutes | `RATE_LIMIT_WINDOW_MS` |
| Limit | 300 requests | `RATE_LIMIT_MAX` |
| Key Strategy | User ID (authenticated) or IP (anonymous) | — |

### Module-Specific Recommendations

1. **Compare endpoint** (`GET /universities/compare`): Add a dedicated stricter limiter due to multi-ID DB queries.
   - Suggested: 5 requests/minute per USER.

2. **Listing endpoints** (`GET /universities`, `GET /agents`, `GET /consultants`): Consider search-specific throttling if `q` parameter abuse becomes an issue. 
   - Suggested: 10 requests/minute per USER.

3. **Write endpoints** (PATCH): The global limiter applies. For stricter per-user limits, import `apiLimiter` directly in `directory.routes.js` and apply per-route.
   - Suggested: 10 requests/hour per USER for profile updates.

### Implementation Location

- Global limiter: `server/src/shared/middleware/rateLimits.js:11-16`
- Configuration: `server/src/config/env.js` (RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX)
