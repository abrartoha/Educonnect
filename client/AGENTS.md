# EduConnect — Frontend Design Reference

> **Purpose:** A single source of truth for the visual language used across the `client/` app.
> Read this before writing or editing any UI so new components match what already exists —
> the same colors, spacing, radii, shadows, gradients, and motion. **Do not introduce new
> palette colors, fonts, or ad-hoc gradients.** Reuse the tokens and patterns below.
>
> **Stack:** React 19 · Vite · **Tailwind CSS v4** (config-in-CSS, no `tailwind.config.js`) ·
> `framer-motion` (animation) · `lucide-react` (icons) · `react-hot-toast` (toasts) ·
> `recharts` (charts). Theme tokens live in [src/index.css](src/index.css).

---

## 1. How the theme is defined

Tailwind v4 is configured entirely in CSS via `@theme` in [src/index.css](src/index.css).
Every CSS variable there becomes a Tailwind utility automatically:

```
--color-primary-500: #6366f1;   →   bg-primary-500  text-primary-500  border-primary-500 …
--font-sans: 'Inter', …         →   font-sans (also the default body font)
```

There is **no JS config file**. To add a token, add a `--color-*` variable inside `@theme`
in `index.css` — never hardcode a new hex in a component when a token exists.

---

## 2. Color palette (authoritative)

### Brand — `primary` (Indigo) — the dominant brand color
Used for: primary actions, active nav, links, focus rings, brand gradient, badges.

| Token | Hex | Common use |
|---|---|---|
| `primary-50`  | `#eef2ff` | tinted backgrounds (active nav, badges, hover) |
| `primary-100` | `#e0e7ff` | focus ring fill (`focus:ring-primary-100`) |
| `primary-200` | `#c7d2fe` | outlined-button borders |
| `primary-300` | `#a5b4fc` | hover borders, decorative |
| `primary-400` | `#818cf8` | focus border (`focus:border-primary-400`), decorative blurs |
| `primary-500` | `#6366f1` | **base brand**, active pill bg, icon accents |
| `primary-600` | `#4f46e5` | **primary buttons**, links, active text/icons |
| `primary-700` | `#4338ca` | link/badge text on light, hover-darker text |
| `primary-800` | `#3730a3` | dark hero gradient stop |
| `primary-900` | `#312e81` | dark hero gradient base |
| `primary-950` | `#1e1b4b` | `glass-dark` background |

### Secondary — `accent` (Orange) — `accent-50 … accent-900`, base `#f97316`
Sparingly, for warm highlights and the consultant role. Decorative float blurs use `accent-400/10`.

### Tertiary — `emerald` (Green) — `emerald-50 … emerald-900`, base `#10b981`
Success, "live"/online dots (`bg-emerald-500 animate-pulse-slow`), the agent role.

### Neutrals — **`slate`** is the canonical gray scale
The app uses **`slate-*`** for almost all text, borders, and surfaces. A few older files use
`gray-*` (notably [Login.jsx](src/pages/auth/Login.jsx) and [Hero.jsx](src/components/landing/Hero.jsx)).
**Prefer `slate-*` in new code.**

| Role | Class |
|---|---|
| Page background | `bg-slate-50` (also the body bg `#f8fafc`) |
| Card / surface | `bg-white` |
| Inset / vote rail / muted panel | `bg-slate-50` or `bg-slate-100` |
| Primary heading text | `text-slate-900` |
| Body / strong text | `text-slate-800` / `text-slate-700` |
| Secondary text | `text-slate-600` / `text-slate-500` |
| Muted / meta / placeholder | `text-slate-400` |
| Default border | `border-slate-200` |
| Subtle divider | `border-slate-100` |

### Semantic / status colors
| Meaning | Classes |
|---|---|
| Success | `emerald-500/600`, bg `emerald-50/100`, text `emerald-700` |
| Danger / destructive | `text-red-600`, hover `hover:bg-red-50`, `hover:text-red-500` |
| Warning / pinned | `bg-amber-50 text-amber-700`; stars `fill-amber-400 text-amber-400` |
| Info / neutral badge | `bg-slate-100 text-slate-600` |

### Role color system (used in auth + entity badges)
Each user role has a signature color. Source of truth: the `roles` array in
[Login.jsx](src/pages/auth/Login.jsx#L23). Entity badges in
[PostCard.jsx](src/components/feed/PostCard.jsx#L50) follow the same mapping.

| Role | Gradient (`from→to`) | Light bg | Text | Badge (PostCard) |
|---|---|---|---|---|
| Admin | `from-purple-600 to-indigo-600` | `bg-purple-50` | `text-purple-700` | — |
| University | `from-blue-600 to-cyan-600` | `bg-blue-50` | `text-blue-700` | `bg-indigo-100 text-indigo-700` |
| Agent | `from-emerald-600 to-teal-600` | `bg-emerald-50` | `text-emerald-700` | `bg-emerald-100 text-emerald-700` |
| Consultant | `from-orange-500 to-amber-500` | `bg-orange-50` | `text-orange-700` | `bg-orange-100 text-orange-700` |
| Student | `from-violet-500 to-purple-500` | `bg-violet-50` | `text-violet-700` | — |

---

## 3. Custom utility classes (defined in index.css)

These are global helpers — **use them instead of re-deriving gradients/glass by hand.**

| Class | What it does |
|---|---|
| `.gradient-primary` | `linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)` — brand buttons, logo tile, avatars |
| `.gradient-accent` | orange gradient (`#f97316 → #fb923c`) |
| `.gradient-emerald` | green gradient (`#059669 → #10b981`) |
| `.gradient-mesh` | soft multi-radial background blobs — used behind heroes |
| `.text-gradient` | indigo→violet clipped text — used for the "Edu" in the EduConnect wordmark and emphasis words |
| `.glass` | light frosted glass: `rgba(255,255,255,0.7)` + `blur(12px)` + subtle border |
| `.glass-dark` | dark frosted glass over `primary-950` |
| `.animate-float` / `.animate-float-delayed` | 6s vertical float for decorative blobs |
| `.animate-pulse-slow` | 4s opacity pulse (e.g. "live" status dot) |

The wordmark is always: `<span className="text-gradient">Edu</span><span className="text-slate-800">Connect</span>`.

---

## 4. Typography

- **Font:** Inter (loaded in [index.html](index.html)); `font-sans` is the default. Weights 300–900 available.
- **Page H1 (hero):** `text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight` + `leading-[1.1]`.
- **Section / banner H1:** `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight`.
- **Card title (h2/h3):** `text-lg font-bold text-slate-900`.
- **Body:** `text-sm` or `text-base`, `text-slate-600`, `leading-relaxed`.
- **Meta / labels:** `text-xs` / `text-[11px]`, `text-slate-400/500`, often `font-medium`.
- Use `tabular-nums` for counts (votes, comments). Use `tracking-tight` on bold headings.

---

## 5. Shape, elevation, spacing

- **Radii:** chips/badges `rounded-full`; buttons & inputs `rounded-lg` or `rounded-xl`;
  cards `rounded-xl`; large panels/modals `rounded-2xl`. Icon tiles `rounded-lg`/`rounded-xl`.
- **Borders:** default `border border-slate-200`; dividers `border-slate-100`.
- **Shadows:** resting cards `shadow-sm`; hover `hover:shadow-lg` / `hover:shadow-xl`;
  dropdowns/menus `shadow-xl shadow-black/10`; drawers `shadow-2xl`.
  **Colored shadows** on brand buttons: `shadow-md shadow-primary-500/25` (→ `hover:shadow-lg hover:shadow-primary-500/30`).
- **Layout container:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
- **Dashboard content:** wrapped by [DashboardLayout.jsx](src/components/layout/DashboardLayout.jsx)
  → `pt-16 lg:pl-[280px]`, inner `max-w-7xl px-4 py-6 sm:px-6 lg:px-8`. Sidebar is `280px`, navbar `h-16`.

---

## 6. Component recipes (copy these patterns)

### Primary button (brand)
```jsx
<button className="gradient-primary rounded-lg px-5 py-2 text-sm font-semibold text-white
  shadow-md shadow-primary-500/25 transition-all hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-110">
  Action
</button>
```
Large hero variant adds `px-8 py-4 text-lg rounded-xl hover:-translate-y-0.5 transition-all duration-300`.

### Secondary / outline button
```jsx
<button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold
  text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
  Secondary
</button>
```

### Ghost / text button
```jsx
<button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
  Ghost
</button>
```

### Destructive action
```jsx
<button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50">
  <LogOut className="h-4 w-4" /> Sign Out
</button>
```

### Card
```jsx
<div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">…</div>
```
Premium/featured variant swaps the border for `ring-2 ring-primary-500/20`.

### Badge / pill
```jsx
<span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
  Label
</span>
```
Status colors: success `bg-emerald-100 text-emerald-700`, warning `bg-amber-50 text-amber-700`,
neutral `bg-slate-100 text-slate-600`. Role badges per the table in §2.

### Text input (with focus ring)
```jsx
<input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700
  outline-none transition-colors placeholder:text-slate-400
  focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100" />
```
Checkboxes: `accent-primary-600 focus:ring-primary-500`. Standard focus ring for interactive
elements: `focus-visible:ring-2 focus-visible:ring-primary-400`.

### Avatar (image, with initials fallback)
```jsx
{user.avatar
  ? <img src={user.avatar} className="h-9 w-9 rounded-full object-cover" />
  : <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white">{initials}</div>}
```

### Section / banner hero (dark brand)
```jsx
<section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900">
  <div className="absolute inset-0 gradient-mesh opacity-30" />
  {/* white text: text-white, text-white/70 for subtext, text-primary-300 for emphasis */}
</section>
```

### Empty state
Centered card: `rounded-xl border border-slate-200 bg-white px-8 py-20 text-center`, with an
icon in a `h-16 w-16 rounded-full bg-slate-100` circle (`text-slate-400`), a `text-lg font-semibold
text-slate-800` heading, `text-sm text-slate-500` body, and a primary CTA.

### Active nav item
Sidebar/navbar active state = `bg-primary-50 text-primary-700` (+ animated left indicator
`bg-primary-600` via `layoutId`); inactive = `text-slate-600 hover:bg-slate-50/100 hover:text-slate-900`.

---

## 7. Motion (framer-motion conventions)

- **Page/element entrance:** `initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}`,
  `transition={{ duration: 0.4–0.6, ease: 'easeOut' }}`. Hero uses ease `[0.22, 1, 0.36, 1]`.
- **Staggered lists/grids:** parent `staggerChildren: 0.1–0.15`; or per-card `delay: index * 0.08`.
  Reusable variant `fadeUp` recurs across dashboards — mirror it.
- **Springs:** menus/indicators use `type: 'spring', stiffness: 200–400, damping: 30`.
- **Hover:** cards `whileHover={{ scale: 1.005 }}` or CSS `hover:-translate-y-1`; brand buttons `hover:-translate-y-0.5`.
- **Mount/unmount:** wrap conditional UI (dropdowns, drawers, modals) in `<AnimatePresence>`.
- **Drawers (mobile):** slide `x: '-100%' → 0` spring; overlay `bg-black/40 backdrop-blur-sm`.
- Keep durations short (0.15–0.6s). Respect existing easing — don't invent new curves.

---

## 8. Icons & toasts

- **Icons:** `lucide-react`, sized `h-4 w-4` (inline) / `h-5 w-5` / `size={16}`. Color them with
  text utilities (`text-slate-400`, `text-primary-600`). Common: `GraduationCap` (brand),
  `LayoutDashboard`, `Building2`, `Users`, `UserCheck`, `Newspaper`, `BarChart3`, `Search`.
- **Toasts:** `react-hot-toast` — `toast.success(...)`, `toast.error(...)`. Use for all transient
  feedback (don't build custom alert banners for these).

---

## 9. Rules for agents (do / don't)

**Do**
- Reuse tokens (`primary-*`, `slate-*`, `accent-*`, `emerald-*`) and the `.gradient-*` / `.glass` / `.text-gradient` utilities.
- Match the recipes in §6 for buttons, cards, inputs, badges, avatars.
- Use `slate-*` for neutrals, `rounded-xl` for cards, `shadow-sm`→`hover:shadow-lg` for elevation.
- Keep the brand gradient (`.gradient-primary`) for primary CTAs and brand marks only.
- Use framer-motion with the existing entrance/stagger/spring conventions and `AnimatePresence`.
- Respect the role color map for anything role-specific.

**Don't**
- Don't add new hex colors, gradients, or fonts. If a token is truly missing, add it to `@theme` in `index.css`.
- Don't introduce a UI kit (MUI, Chakra, shadcn, etc.) — this is hand-rolled Tailwind.
- Don't mix `gray-*` into new code (legacy only); use `slate-*`.
- Don't create a `tailwind.config.js` — config lives in CSS.
- Don't hand-roll toasts/alerts when `react-hot-toast` fits.

---

## 10. Quick reference (most-used classes)

```
Brand CTA      gradient-primary text-white shadow-md shadow-primary-500/25 rounded-lg
Outline btn    border border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50
Card           rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg
Input focus    focus:border-primary-400 focus:ring-2 focus:ring-primary-100
Badge          rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700
Page bg        bg-slate-50      Surface  bg-white      Heading  text-slate-900
Body text      text-slate-600   Muted    text-slate-400   Border  border-slate-200
Container      mx-auto max-w-7xl px-4 sm:px-6 lg:px-8
Wordmark       <span className="text-gradient">Edu</span><span className="text-slate-800">Connect</span>
```
