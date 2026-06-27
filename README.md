# EduConnect

Education marketplace connecting international students with Australian universities, agents, and consultants.

A monorepo with three workspaces:

| Workspace | Stack | Port |
|---|---|---|
| `server/` | Node 20, Express, Prisma, PostgreSQL, nodemailer | `5050` |
| `client/` | React 19, Vite, Tailwind, Zustand, React Router | `5173` |
| `mobile/` | React Native, Expo SDK 54, React Navigation | `8081` (Metro) |

Features: feed, marketplace, role-based auth, posts, reviews, campaigns, and **email-backed enquiries** (students send enquiries to universities / agents / consultants and the recipient gets an email).

---

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 14+** running locally (or a hosted DB you can connect to)
- **Expo Go** app on your phone for the mobile workspace (optional)

---

## First-time setup

```bash
# 1. Clone and install
git clone https://github.com/abrartoha/Educonnect.git
cd Educonnect
npm run install:all      # installs deps in client/, server/, and mobile/

# 2. Create the database
createdb educonnect       # or use any Postgres GUI

# 3. Configure server env
cp server/.env.example server/.env
# then edit server/.env — see "Required env vars" below
```

### Required env vars in `server/.env`

| Var | Where to get it |
|---|---|
| `DATABASE_URL` | Your local Postgres URL, e.g. `postgresql://user@localhost:5432/educonnect?schema=public` |
| `CLIENT_URL` | `http://localhost:5173` for dev |
| `COOKIE_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET` | Generate four random 64-char hex strings: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"` |

### Optional email env vars in `server/.env`

| Var | Notes |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Configure to use a real SMTP server (production). |
| `EMAIL_FROM` | Defaults to `EduConnect <noreply@educonnect.com.au>` |

Leave the SMTP vars blank in dev — the server falls back to a free **Ethereal** test inbox automatically. Each enquiry email logs a preview URL you can open in the browser to verify it. No signup required.

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

---

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

## Branching & contribution

- Branch off `main`, PR back into `main`. Direct pushes to `main` are blocked by branch protection.
- One reviewer approval required before merge.
- Unresolved PR conversations block merge.
- Linear history (no merge commits) — squash or rebase.
# Test deployment Sat Jun 27 12:32:07 UTC 2026
