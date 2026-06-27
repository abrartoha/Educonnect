# EduConnect — Monorepo Guide (Claude Code)

Monorepo with four workspaces. When working inside one, follow that workspace's own guide
(Claude Code auto-loads the nested `CLAUDE.md` when you touch files in that subtree).

| Dir | What it is | Stack | Guide |
|---|---|---|---|
| `client/` | Web app (SPA) | React 19, Vite, **Tailwind v4**, framer-motion | [client/AGENTS.md](client/AGENTS.md) — design system (auto-loaded via [client/CLAUDE.md](client/CLAUDE.md)) |
| `server/` | Backend REST API | **Express 4**, **Prisma 6**, ESM | `server/` |
| `mobile/` | Mobile app | **Expo / React Native** | `mobile/` |
| `docs/`   | Handover & reference docs | Markdown | `docs/` |

## Frontend design system

All UI work in `client/` (and any frontend styling questions) must follow the design system
in **[client/AGENTS.md](client/AGENTS.md)**: the indigo `primary` / `slate` palette, the
`.gradient-primary` / `.glass` / `.text-gradient` utilities, and the documented button / card /
input / badge recipes. It auto-loads whenever Claude reads or edits files under `client/`.

> Want it loaded for **every** task (even server/mobile work)? Add `@client/AGENTS.md` as the
> last line of this file. By default it's scoped to `client/` to keep backend context clean.
