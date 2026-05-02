# EduConnect

In-app education marketplace connecting international students with Australian universities, agents, and consultants.

A monorepo with three workspaces:

| Workspace | Stack | Port |
|---|---|---|
| `server/` | Node 20, Express, Prisma, PostgreSQL, Socket.io, LiveKit | `5050` |
| `client/` | React 19, Vite, Tailwind, Zustand, React Router | `5173` |
| `mobile/` | React Native, Expo SDK 54, React Navigation, LiveKit RN | `8081` (Metro) |

Features: feed, marketplace, role-based auth, bookings, in-app messaging (WebSocket), and in-app video/phone meetings (LiveKit).

---

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 14+** running locally (or a hosted DB you can connect to)
- A free **LiveKit Cloud** account at [livekit.io](https://livekit.io) — needed for video/phone meetings
- For mobile development:
  - **Expo Go** app on your phone (works for everything except joining meetings)
  - **EAS CLI** for a custom dev build that supports the meeting screen: `npm install -g eas-cli`

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
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | LiveKit Cloud dashboard → Settings → Keys → "Add Key" |

### Migrate + seed the database

```bash
npm run migrate          # applies all Prisma migrations
npm run seed             # populates demo users, posts, etc.
```

---

## Running the apps

In three separate terminals:

```bash
npm run dev:server       # API + WebSocket gateway → http://localhost:5050
npm run dev:client       # web SPA              → http://localhost:5173
npm run dev:mobile       # Expo Metro bundler   → scan QR with Expo Go
```

For mobile on a physical device, your phone must be on the same Wi-Fi as your laptop. Metro auto-detects the LAN IP.

---

## Demo accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@educonnect.com.au` | `admin123` |
| University | `admissions@unimelb.edu.au` | `password123` |
| Agent | `sarah@pacificedu.com.au` | `password123` |
| Consultant | `emma.thompson@educonsult.com.au` | `password123` |
| Student | `arun.kumar@gmail.com` | `password123` |

---

## In-app meetings (LiveKit)

The web app works out of the box once `LIVEKIT_*` env vars are set.

For the mobile app to join meetings, you need a **custom dev build** (Expo Go can't run native WebRTC):

```bash
cd mobile
eas login
eas init                                            # one-time, links the project
eas build --profile development --platform android  # or --platform ios
```

Install the resulting build on your device, then `npm run dev:mobile` from the repo root and open the new app instead of Expo Go.

Without a dev build, all other mobile features still work — only the meeting screen is gated.

---

## Project structure

```
client/src/
  pages/                  -- top-level routes (auth, marketplace, dashboards, messages, meeting)
  components/             -- shared UI (booking modal, meeting button, message button, etc.)
  api/                    -- typed API client + endpoint definitions
  lib/                    -- socket.io singleton
  store/                  -- Zustand store + auth hydration

server/src/
  app.js, server.js       -- Express app + HTTP server + Socket.io attach
  config/                 -- env schema (zod) + Pino logger
  db/                     -- Prisma client singleton
  modules/                -- one folder per feature (auth, posts, directory, business,
                             meetings, messaging, admin)
  shared/
    middleware/           -- helmet, CORS, CSRF, rate limits, validate, errorHandler
    utils/                -- tokens, cookies, password, asyncHandler, errors
    validators/           -- common zod schemas (idParam, etc.)
  jobs/                   -- node-cron jobs (token cleanup, booking auto-completion)

mobile/src/
  screens/                -- one folder per feature (feed, marketplace, business,
                             messages, meeting, profile, admin)
  components/             -- shared UI (avatar, badges, JoinMeetingButton, etc.)
  navigation/             -- React Navigation tab + stack setup
  api/, lib/              -- mirror of client API + socket
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
