# TechBox (تکباکس)

A Persian-language (RTL) multi-module tech content platform covering IT
infrastructure, networking, servers, storage, and security — magazine, news,
video media, forum, downloads, tools, reviews, shop, and a tech timeline.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**,
**Tailwind CSS v4**, **Prisma + PostgreSQL (Neon)**, **Vercel Blob**,
**Sentry**, and **Upstash Redis**.

---

## Quick start

```bash
# 1. Install dependencies (pnpm 10.12.1)
pnpm install

# 2. Configure environment
cp .env.example .env        # then fill in real values (see below)

# 3. Generate the Prisma client & sync the database schema
pnpm prisma generate
pnpm db:push                # or: pnpm prisma migrate deploy

# 4. (optional) seed demo content
pnpm db:seed

# 5. Run the dev server
pnpm dev
```

The site is available at `http://localhost:3000` (RTL, Persian).

---

## Environment variables

All secrets live in `.env` (git-ignored). Required for a working app:

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | JWT session signing secret (`openssl rand -base64 32`) |
| `DATABASE_URL` | PostgreSQL connection string (Neon). `DIRECT_URL` if you separate pooling |
| `NEXT_PUBLIC_SITE_URL` | Public site origin, e.g. `http://localhost:3000` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for images / downloads |

Optional (features degrade gracefully when absent):

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Transactional email (welcome, password reset, contact) |
| `CHAT_API_KEY` / `CHAT_BASE_URL` / `CHAT_MODEL` | TechBox AI chat assistant (OpenAI-compatible) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_DSN` | Error monitoring |
| `CONTACT_EMAIL` | Recipient for the contact form (default `info@techbox.ir`) |
| Zarinpal keys | Payments for the shop |

> The chat route has a built-in demo fallback that is shown **only** when
> `CHAT_API_KEY` is not configured — it never fabricates real content.

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` / `pnpm build` / `pnpm start` | Dev / production build / serve |
| `pnpm lint` | ESLint (next core-web-vitals) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:push` / `pnpm db:seed` | Schema sync / seed |
| `pnpm test:e2e` | Playwright smoke tests |
| `pnpm check:content` / `check:db` / `check:blob` / `check:all` | Content/DB/Blob integrity checks |

---

## Architecture

- **`app/`** — App Router segments (`blog`, `news`, `media`, `forum`,
  `download`, `tools`, `review`, `shop`, `timeline`, `account`, `admin`, …)
  plus `app/api/*` route handlers.
- **`features/`** — vertical slices, one per domain
  (`auth`, `blog`, `chat`, `comment`, `consultation`, `content`, `download`,
  `forum`, `home`, `media`, `news`, `review`, `shop`, `timeline`, `tools`).
  Each holds its `components/`, and some `actions/`, `hooks/`, `lib/`.
- **`components/`** — shared UI: `layout/` (shell, sidebar, footer),
  `ui/` (buttons, cards, modals, rating, …), `effects/` (ChromaGrid, Dock,
  BorderGlow, …), `newsletter/`, `seo/`.
- **`config/`** — **single source of truth** for modules
  (`modules.config.ts`), colors, and the sidebar.
- **`lib/`** — server & client helpers (db, auth, content, search, seo,
  recommendations, nas/nvr tools, rate-limit, email, …).
- **`providers/`** — React context providers (Theme, Auth, Cart, Query,
  Stats, TimelineLikes) composed once in `components/layout/LayoutShell.tsx`.
- **`prisma/`** — `schema.prisma` (User, Post, Comment, Rating, Like,
  TimelineEvent, NewsletterSubscriber, …) plus seed/backfill scripts.

### Data model
One universal **`Post`** type (keyed by `module` + `slug`) powers
blog/news/media/review/download/shop/forum. Comments, ratings, likes, and
revision history are separate tables. The tech **timeline** is its own
cluster (`TimelineEvent` + comments/likes).

### Rendering & performance notes
- The homepage fetches its data **server-side** (`lib/home-server.ts`, cached
  60s) and streams it into `HomeDataProvider` as initial state, so content is
  present on first paint — no loading flash. The client only refreshes silently.
- Auth state is centralized in a typed `AuthProvider` (`useAuth()`), verified
  against `/api/auth/me` only when a local session exists.
- The service worker caches **only static assets** — it never caches HTML
  navigations, so pages are never served stale.
- Fonts: Kalameh (primary, self-hosted via `next/font`) without blocking
  preloads; Vazirmatn is a slim fallback.

---

## How to add a module

1. Add the module to `config/modules.config.ts` (`modules` tiles and/or
   `moduleList` registry) — this is the **only** place to define its
   `title` / `titleFa` / `color` / `href`. `lib/content.ts` derives its
   `moduleMeta` from here automatically.
2. Add a `Post` `module` value (e.g. `"blog"`) and create the route under
   `app/<module>/` plus a feature slice in `features/<module>/`.
3. Register nav/sidebar entries in `config/sidebar.config.ts`.
4. Use `getModuleMeta(slug)` / `moduleMeta[slug]` everywhere you need
   presentation metadata — never hard-code it.

---

## CI / deployment

`.github/workflows/ci.yml` runs **three required checks** on every push/PR to
`main`: **Lint**, **Typecheck**, and **Build**. An optional, non-blocking
**DB/content check** job runs when `DATABASE_URL` is configured. The build is
DB-outage-safe (all DB access is guarded) so it succeeds even without a live
database.

---

## License

Proprietary — TechBox / هونامیک ارتباط رستاک.
