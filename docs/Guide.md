# EduConnect

## Introduction
Education marketplace connecting international students with Australian universities, agents, and consultants.

A monorepo with three workspaces:

| Workspace | Stack | Port |
|---|---|---|
| `server/` | Node 20, Express, Prisma, PostgreSQL, nodemailer | `5050` |
| `client/` | React 19, Vite, Tailwind, Zustand, React Router | `5173` |
| `mobile/` | React Native, Expo SDK 54, React Navigation | `8081` (Metro) |

Features: feed, marketplace, role-based auth, posts, reviews, campaigns, and **email-backed enquiries** (students send enquiries to universities / agents / consultants and the recipient gets an email).


### Server (`server/`)

- **Runtime:** Node.js 20+, ES modules, `node --watch` for dev.
- **Framework:** Express.
- **ORM / DB:** Prisma 6 + PostgreSQL.
- **Caching:** Redis (For rate limiters)
- **Auth:** JWT access + opaque rotating refresh tokens (httpOnly signed cookies for web; `Authorization: Bearer` for mobile).
- **Password hashing:** Argon2id (OWASP-recommended params).
- **Validation:** zod schemas applied via a `validate` middleware.
- **Security:** Helmet (CSP, HSTS, frameguard, noSniff), CORS allow-list, CSRF (double-submit via `csrf-csrf`), `hpp` (HTTP parameter pollution), rate limits (`express-rate-limit`).
- **Email:** `nodemailer` — uses configured SMTP if `SMTP_*` env vars are set, otherwise falls back to a free Ethereal test inbox in dev.
- **Logging:** Pino + pino-http; pretty-print in dev, redaction of secrets.
- **Cron:** `node-cron` for background jobs.

### Client (`client/`)

- **Framework:** React 19 + Vite + Tailwind CSS v4.
- **Routing:** `react-router-dom` v6 with lazy-loaded routes.
- **State:** Zustand (auth-only; all domain data is fetched per-page).
- **HTTP:** custom fetch wrapper with CSRF token caching, silent refresh on 401, CSRF rotation on 403.
- **UI bits:** `framer-motion`, `lucide-react`, `recharts`, `react-hot-toast`.

---

## First-time setup

```bash
# 1. Clone and install
git clone https://github.com/abrartoha/Educonnect.git
cd Educonnect
npm run install:all      # installs deps in client/, server/, and mobile/

# 2. Create the database
createdb educonnect       # or use any Postgres GUI or link

# 3. Configure server env
cp server/.env.example server/.env
# then edit server/.env — see "Required env vars" below
```


## Environment configuration (File : `server/.env`)

Validated in `server/src/config/env.js` (zod). The server **fails to boot** if any required value is missing or malformed.

### Core Configuration

| Variable | Type / Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` (default: `development`) | Toggles dev-only behaviour (pretty logs, looser cookie SameSite, error stack) |
| `PORT` | int (default: `5000`) | HTTP listener port; project conventionally uses `5050` |
| `CLIENT_URL` | URL (required) | Allow-listed origin for CORS |
| `TRUST_PROXY` | `true` / `false` (default: `false`) | Set `app.set('trust proxy', 1)` so `req.ip` works behind nginx/ALB |

### Database

| Variable | Type / Default | Purpose |
|---|---|---|
| `DATABASE_URL` | string ≥ 10 chars (required) | PostgreSQL connection URL |

### Security & Authentication

| Variable | Type / Default | Purpose |
|---|---|---|
| `COOKIE_SECRET` | string ≥ 32 chars (required) | Signs the access/refresh cookies |
| `JWT_ACCESS_SECRET` | string ≥ 32 chars (required) | HS256 signing key for access tokens |
| `JWT_REFRESH_SECRET` | string ≥ 32 chars (required) | Refresh token signing (opaque + hashed) |
| `CSRF_SECRET` | string ≥ 32 chars (required) | Seeds `csrf-csrf` HMAC |
| `ACCESS_TOKEN_TTL` | duration string (default: `15m`) | Access JWT lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | int (default: `30`) | Refresh token lifetime in days |

### Rate Limiting

| Variable | Type / Default | Purpose |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | int (default: `900000`) | Global API rate-limit window in milliseconds |
| `RATE_LIMIT_MAX` | int (default: `300`) | Global API rate-limit max requests per window |
| `AUTH_RATE_LIMIT_MAX` | int (default: `10`) | Auth (login/refresh) max failed attempts per window |

### Logging

| Variable | Type / Default | Purpose |
|---|---|---|
| `LOG_LEVEL` | `trace`–`fatal` (default: `info`) | Pino log level for server logging |

### Email (Enquiry Notifications)

| Variable | Type / Default | Purpose |
|---|---|---|
| `SMTP_HOST` | string (optional) | SMTP server hostname for email transport |
| `SMTP_PORT` | int (optional) | SMTP server port |
| `SMTP_USER` | string (optional) | SMTP authentication username |
| `SMTP_PASS` | string (optional) | SMTP authentication password |
| `EMAIL_FROM` | string (default: `EduConnect <noreply@educonnect.com.au>`) | "From" address on enquiry emails |

**Note:** Leave SMTP vars blank in dev — the server falls back to a free **Ethereal** test inbox automatically. Each enquiry email logs a preview URL you can open in the browser to verify it. No signup required.

### Redis

| Variable | Type / Default | Purpose |
|---|---|---|
| `REDIS_HOST` | string (optional) | Redis server hostname for rate limiters |
| `REDIS_PORT` | int (optional) | Redis server port |
| `REDIS_USERNAME` | string (optional) | Redis authentication username |
| `REDIS_PASSWORD` | string (optional) | Redis authentication password |

### Miscellaneous

| Variable | Type / Default | Purpose |
|---|---|---|
| `FORM_TOKEN_SECRET` | string ≥ 32 chars (default: `default_secret_change_me_in_prod`) | Secret for form token generation |

### Rate Limiter Overrides

All rate limiters support per-endpoint configuration via environment variables (optional). See `server/.env.example` for the complete list of `RL_*` variables for directory, admin, and business modules. These allow production tuning without code changes.

---

**For a complete example with all optional rate limiter overrides, see [`server/.env.example`](../server/.env.example).**

## Database schema (Prisma)

Source of truth: `server/prisma/schema.prisma`.

### Enums

```
Role:           ADMIN, UNIVERSITY, AGENT, CONSULTANT, STUDENT
AccountStatus:  PENDING, ACTIVE, SUSPENDED
Tier:           FREE, PREMIUM, ENTERPRISE
PostStatus:     PUBLISHED, HIDDEN, REMOVED
PostCategory:   SCHOLARSHIPS, VISA_TIPS, COURSES, CAMPUS_LIFE, CAREER, STUDENT_LIFE, EVENTS
MediaType:      NONE, IMAGE, VIDEO
LeadStatus:     NEW, CONTACTED, CONVERTED, CLOSED
CampaignStatus: DRAFT, ACTIVE, PAUSED, ENDED
```

### Core identity

- **`User`** — single users table with `role` discriminator. Holds email, `passwordHash` (argon2id), `name`, `avatarUrl`, `status` (defaults PENDING for non-students), `emailVerified`, `lastLoginAt`. 1:1 to one of `UniversityProfile` / `AgentProfile` / `ConsultantProfile` / `StudentProfile`.
- **`UniversityProfile`** — `userId @id`, `shortName`, `location`, `type`, `description`, `website`, `phone`, `logoUrl`, `coverImageUrl`, `foundedYear`, `studentCount`, `internationalPct`, `ranking`, `rating`, `reviewCount`, `views`, `inquiries`, `tier`, `verified`, `tuitionMin`/`Max`/`Currency` (currency defaults to "AUD"), plus string arrays `courses`, `scholarships`, `intakes`, `facilities`, `accreditations`.
- **`AgentProfile`** — `contactPerson`, `phone`, `location`, `description`, `website`, `logoUrl`, `yearsExperience`, `studentsPlaced`, `partnerInstitutions`, `successRate`, `rating`, `reviewCount`, `verified`, `tier`, arrays `certifications` / `services` / `languages` / `specialisations`, `maraNumber`.
- **`ConsultantProfile`** — `phone`, `location`, `description`, `website`, `yearsExperience`, `studentsAssisted`, `successRate`, `rating`, `reviewCount`, `verified`, `tier`, `qualifications` / `services` / `languages` / `specialisations`, `hourlyRate`.
- **`StudentProfile`** — `phone`, `nationality`, `currentEducation`, `interestedIn`, `preferredLocations`, `budgetMin`/`Max`, `bio`, `intakeTarget`.

### Auth

- **`RefreshToken`** — `tokenHash` (sha256 of opaque token), `userId`, `userAgent`, `ip`, `expiresAt`, `revokedAt`, `replacedBy` (chain for rotation).

### Posts / social

- **`Post`** — `authorId`, `title`, `content`, `category`, `mediaType`, `mediaUrl`, `tags[]`, `status` (default PUBLISHED), `isPinned`, `upvoteCount`, `commentCount`, timestamps.
- **`Comment`** — `postId`, `authorId`, `text`, `upvoteCount`, timestamps.
- **`PostVote`** — composite key `(userId, postId)`.
- **`Bookmark`** — composite key `(userId, postId)`.

### Reviews

- **`Review`** — `reviewerId`, `targetId`, `targetRole` (UNIVERSITY/AGENT/CONSULTANT), `rating` (1-5), `title?`, `body`, `verified`, timestamps. Unique on `(reviewerId, targetId)`.

### Enquiries / Leads

- **`Lead`** — `studentId`, `targetId`, `targetRole` (UNIVERSITY/AGENT/CONSULTANT), `programme?`, `message`, `status` (default NEW), timestamps. Indexed on `(targetId, status)`.

### Campaigns

- **`Campaign`** — `universityId`, `name`, `audience`, `startDate`, `endDate`, `status` (default DRAFT), `impressions`, `clicks`.

### Audit log

- **`AuditLog`** — `actorId?`, `action`, `entityType`, `entityId?`, `meta: Json?`, `ip`, `userAgent`, timestamps. Used for moderation.

---

### Migrate + seed the database

```bash
npm run migrate          # applies all Prisma migrations
npm run seed             # populates demo users, posts, etc.
```

---

## Running the apps

In three separate terminals:

```bash
npm run dev:server       # API → http://localhost:5050
npm run dev:client       # web SPA → http://localhost:5173
npm run dev:mobile       # Expo Metro bundler → scan QR with Expo Go
```

For mobile on a physical device, your phone must be on the same Wi-Fi as your laptop. Metro auto-detects the LAN IP.

---

## Demo accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@educonnect.com.au` | `Admin12345` |
| University | `admissions@unimelb.edu.au` | `Password123` |
| Agent | `sarah@pacificedu.com.au` | `Password123` |
| Consultant | `emma.thompson@educonsult.com.au` | `Password123` |
| Student | `arun.kumar@gmail.com` | `Password123` |

---

## Enquiries (email-backed)

Students can send an enquiry from any university / agent / consultant detail page. The server:

1. Persists a `Lead` row.
2. Sends an HTML email to the target's address with the student's message and reply-to set to the student's email.
3. Surfaces the enquiry inside the recipient's dashboard so they can update its status (NEW → CONTACTED → CONVERTED / CLOSED).

In dev (no SMTP configured) the server prints an Ethereal preview URL for every email — open it in the browser to inspect what the recipient would receive.



## Project structure

```
client/src/
  pages/                  -- top-level routes (auth, marketplace, dashboards, posts, static)
  components/             -- shared UI (layout, etc.)
  api/                    -- typed API client + endpoint definitions + mappers
  store/                  -- Zustand store + auth hydration
  hooks/                  -- useApiResource

server/src/
  app.js, server.js       -- Express app + HTTP server + graceful shutdown
  config/                 -- env schema (zod) + Pino logger
  db/                     -- Prisma client singleton
  modules/                -- one folder per feature (auth, posts, directory,
                             business, admin)
  shared/
    middleware/           -- helmet, CORS, CSRF, rate limits, validate, errorHandler
    utils/                -- tokens, cookies, password, asyncHandler, errors
    services/             -- email (nodemailer)
    validators/           -- common zod schemas (idParam, etc.)
  jobs/                   -- node-cron jobs (token cleanup, campaign auto-end)

mobile/src/
  screens/                -- one folder per feature (feed, marketplace,
                             business, profile, admin)
  components/             -- shared UI
  navigation/             -- React Navigation tab + stack setup
  api/                    -- mirror of client API
  auth/                   -- AsyncStorage-backed token storage + AuthContext
```

---

## Common scripts

From the repo root:

| Command | What it does |
|---|---|
| `npm run install:all` | Install all three workspaces |
| `npm run dev:server` | Start the API in watch mode |
| `npm run dev:client` | Start the web SPA in dev mode |
| `npm run dev:mobile` | Start Expo |
| `npm run dev:mobile:tunnel` | Expo tunnel (use if your phone isn't on the same Wi-Fi) |
| `npm run migrate` | Apply Prisma migrations + regenerate the typed client |
| `npm run seed` | Reset/seed the database with demo data |
| `npm run build:client` | Production build of the web SPA |
| `npm run lint:client` | Lint the web SPA |

---
