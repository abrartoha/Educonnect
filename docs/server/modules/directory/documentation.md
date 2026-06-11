# Documentation of Directory Module
|||
|-----|-----|
| **Backend Developer:** | Jakariya Abbas |
| **Creation Date:** | 08-05-2026 |
| **Version:** | 1.1.0 |

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

#### Frontend Mock Data Audit — Profile Pages & Dashboards

**Profile pages connected (no mock data):**
All `*Profile.jsx` pages (agent, consultant, university, student) and `UniCampaigns.jsx` are fully connected with live APIs.

**Dashboards using mock data:**

| Component | API-Driven | Mock Data |
|-----------|------------|-----------|
| `StudentDashboard.jsx` | 6 API calls, zero mock data | None |
| `AdminDashboard.jsx` | Stats, recent activity, pending approvals | `revenueData` chart data, some totals |
| `AgentDashboard.jsx` | Profile data, some stats | `placementData`, `mockStudents`, `mockBookings`, trend strings |
| `UniDashboard.jsx` | Profile data, real leads (count only) | `monthlyData`, `nationalityData`, `mockLeads` (leads table renders mock despite real fetch) |
| `ConsultantDashboard.jsx` | Profile, reviews | `mockSchedule`, trend strings, fallback `mockReviews` |
| `UniAnalytics.jsx` | `profile.views` (partial) | `generateViewsData()`, `courseInquiries`, `demographicsData`, `topCourses`, `inline Math.random()` |
| `AgentAnalytics.jsx` | None | `monthlyPlacements`, `stats`, `recentActivity` |
| `ConsultantAnalytics.jsx` | None | `weeklyData`, `stats`, `satisfactionData` |

**All three `*Analytics.jsx` pages are entirely hardcoded with zero API calls.**

**Hardcoded trend strings across all dashboards:** `+12%`, `+8.3%`, etc. — all computed on the frontend with no backend support.

**Backend already exposes endpoints that could replace some mock data:**
- `GET /leads`, `GET /leads/mine` — could replace `mockLeads` in `UniDashboard.jsx`
- `GET /reviews/target/:targetId` — could replace fallback `mockReviews` in `ConsultantDashboard.jsx`
- `GET /admin/overview` — already powers most of `AdminDashboard.jsx`

**Missing backend support entirely (no endpoints exist):**
- Bookings / Appointments
- Consultant scheduling
- Activity feed / notifications
- Aggregated analytics and time-series reporting APIs for charts
- Computed trend/growth calculations

**Impact:** The CRUD foundation and auth layer are solid, but dedicated analytics, scheduling, booking, activity, and trend-computation modules are missing to fully replace frontend mock data.

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

Directory endpoints use **Redis-backed rate limiters** defined locally in `server/src/modules/directory/directory.rate-limits.js`, using the limiter factory from `server/src/shared/middleware/ratelimiter/limiterFactory.js`. All directory limiters are scoped to `"user"` (authenticated user ID) and support route-specific counting.

In addition, the global legacy `apiLimiter` (300 req/15min, in-memory) is mounted at `app.js:82` on the `/api` prefix as a baseline for all API routes.

### Rate Limiter Assignments

| Route | Limiter | Window | Limit | Block Duration |
|-------|---------|--------|-------|----------------|
| `GET /universities` | `directoryListLimiter` | 1 min | 10 | 5 min |
| `GET /agents` | `directoryListLimiter` | 1 min | 10 | 5 min |
| `GET /consultants` | `directoryListLimiter` | 1 min | 10 | 5 min |
| `GET /universities/compare` | `directoryCompareLimiter` | 1 min | 5 | 5 min |
| `GET /universities/:id` | `directoryReadLimiter` | 1 min | 20 | 5 min |
| `GET /agents/:id` | `directoryReadLimiter` | 1 min | 20 | 5 min |
| `GET /consultants/:id` | `directoryReadLimiter` | 1 min | 20 | 5 min |
| `PATCH /universities/me` | `directoryWriteLimiter` | 1 hr | 5 | 1 hr |
| `PATCH /agents/me` | `directoryWriteLimiter` | 1 hr | 5 | 1 hr |
| `PATCH /consultants/me` | `directoryWriteLimiter` | 1 hr | 5 | 1 hr |
| `PATCH /students/me` | `directoryWriteLimiter` | 1 hr | 5 | 1 hr |

### Limiter Details

- **directoryListLimiter** — Throttles paginated listing endpoints. 10 requests/minute per user, 5-minute block on exceed.
- **directoryReadLimiter** — Throttles single-profile detail views. 20 requests/minute per user, 5-minute block on exceed.
- **directoryCompareLimiter** — Throttles the comparison endpoint (multi-ID DB query). 5 requests/minute per user, 5-minute block on exceed.
- **directoryWriteLimiter** — Throttles profile update endpoints. 5 requests/hour per user, 1-hour block on exceed.

### Environment Variable Overrides

Every value can be overridden at runtime via `RL_DIR_*` env vars (defined in `server/src/config/env.js`):

| Variable | Default | Profile |
|----------|---------|---------|
| `RL_DIR_LIST_WINDOW` | `60` (1 min) | directoryList |
| `RL_DIR_LIST_LIMIT` | `10` | directoryList |
| `RL_DIR_LIST_BLOCK` | `300` (5 min) | directoryList |
| `RL_DIR_READ_WINDOW` | `60` (1 min) | directoryRead |
| `RL_DIR_READ_LIMIT` | `20` | directoryRead |
| `RL_DIR_READ_BLOCK` | `300` (5 min) | directoryRead |
| `RL_DIR_COMPARE_WINDOW` | `60` (1 min) | directoryCompare |
| `RL_DIR_COMPARE_LIMIT` | `5` | directoryCompare |
| `RL_DIR_COMPARE_BLOCK` | `300` (5 min) | directoryCompare |
| `RL_DIR_WRITE_WINDOW` | `3600` (1 hr) | directoryWrite |
| `RL_DIR_WRITE_LIMIT` | `5` | directoryWrite |
| `RL_DIR_WRITE_BLOCK` | `3600` (1 hr) | directoryWrite |

### Implementation Location

- Rate limit definitions: `server/src/modules/directory/directory.rate-limits.js`
- Global presets: `server/src/shared/middleware/ratelimiter/presets.js`
- Limiter factory: `server/src/shared/middleware/ratelimiter/limiterFactory.js`
- Route wiring: `server/src/modules/directory/directory.routes.js`
