# EduConnect — Monorepo (Agent Guide)

Generic guide for AI agents/editors that read the root `AGENTS.md` (Copilot, Cursor, Codex, etc.).
This repo has four workspaces — work within the relevant one and follow its specific guide.

| Dir | What it is | Stack | Specific guide |
|---|---|---|---|
| `client/` | Web app (SPA) | React 19, Vite, **Tailwind CSS v4** (config in `src/index.css`, no `tailwind.config.js`), framer-motion, lucide-react | **[client/AGENTS.md](client/AGENTS.md)** |
| `server/` | Backend REST API | **Express 4**, **Prisma 6** (`server/prisma/`), ESM | `server/` |
| `mobile/` | Mobile app | **Expo / React Native** | `mobile/` |
| `docs/`   | Handover & reference docs | Markdown | `docs/` |

## Frontend design system (important)

When generating or editing anything in `client/`, the **authoritative UI design reference** is
**[client/AGENTS.md](client/AGENTS.md)** — the color palette (`primary`/indigo, `slate` neutrals,
`accent`/orange, `emerald`), the custom utilities (`.gradient-primary`, `.glass`, `.text-gradient`),
component recipes (buttons, cards, inputs, badges, avatars), and framer-motion conventions.

**Do not** introduce new palette colors, gradients, fonts, or a UI component library — reuse the
existing tokens and recipes. New tokens go in `@theme` inside `client/src/index.css`.

Tools that auto-discover the *nearest* `AGENTS.md` to the file being edited will pick up
`client/AGENTS.md` automatically when you work on frontend files.
