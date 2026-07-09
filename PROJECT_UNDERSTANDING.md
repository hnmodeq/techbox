# TechBox — Project Understanding (Agent Reference)

> Snapshot taken 2026-07-09. Source: https://github.com/hnmodeq/techbox (branch `main`).
> Credentials referenced here live in `/home/user/techbox/.env` (git-ignored).
> ⚠️ Rotate ALL secrets after the work session is finished.

## 1. What it is
TechBox (تکباکس) is a **Persian-language (RTL) multi-module tech content platform** — a magazine / news / media / forum / shop / tools / review / download / tech-timeline site for IT infrastructure, networking, servers, storage, and security. Built as a single Next.js 16 App Router application with a feature-based (vertical-slice) architecture. UI is RTL, fonts are Vazirmatn + a custom Kalameh font, and almost everything is themed per "module" with CSS variables.

## 2. Stack
- **Framework:** Next.js 16.2.9 (App Router, React 19, TypeScript 6) — `next dev`/`build`, Turbopack default, `--webpack` variant.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), CSS variables for theming, `clsx` + `tailwind-merge`, `framer-motion` / `motion` + `gsap` for animation.
- **DB / ORM:** PostgreSQL on **Neon** (`DATABASE_URL`), accessed via **Prisma 6** (`prisma/schema.prisma`, `lib/db.ts`).
- **Auth:** Custom JWT sessions (`jose`), `bcryptjs` passwords, `tb_session` httpOnly cookie (30d). Server helpers in `lib/auth-server.ts`; client cache in `lib/auth.ts`. Roles: `super_admin` + per-module `modules: string[]`.
- **Payments:** **Zarinpal** (Iranian gateway) — `app/api/pay/zarinpal/request|verify`.
- **AI:** **OpenAI-compatible** chat (`app/api/chat/route.ts`) — `CHAT_API_KEY`/`CHAT_BASE_URL`/`CHAT_MODEL`, graceful demo fallback.
- **Email:** **Resend** (`lib/email.ts`) — welcome / new comment / password reset templates.
- **Storage:** **Vercel Blob** (`@vercel/blob`) for images & download files.
- **Observability:** **Sentry** (`@sentry/nextjs`) with `/monitoring` tunnel, build instrumentation in `instrumentation.ts`.
- **Rate limiting:** **Upstash Redis** (`@upstash/ratelimit` + `@upstash/redis`), `lib/rate-limit.ts`.
- **Analytics:** Vercel Analytics + Speed Insights. PWA service worker (`sw.js`, `register-sw.js`).

## 3. Architecture
- **App Router** (`app/`): route segments map to modules/pages — `blog, news, media, forum, download, tools, review, shop, timeline, account, admin, about, contact, consultation, work-with-us, search, author, shop, ...`. Plus `app/api/*` route handlers.
- **Feature slices** (`features/`): one folder per domain — `auth, blog, chat, comment, consultation, content, download, forum, home, media, news, review, shop, timeline, tools`. Each holds `components/`, some have `actions/`, `hooks/`, `lib/` (e.g. `features/home/lib/home-data`).
- **Shared `components/`:** `layout/` (LayoutShell, Sidebar, Footer), `ui/` (button, card, modal, tabs, rating-widget, like-button, search-bar, etc.), `effects/` (ChromaGrid, Dock, BorderGlow, GradientText, ModuleHeader…), `newsletter/`, `seo/`.
- **Config & constants:** `config/` (`modules.config.ts`, `module-colors.ts`, `sidebar.config.ts`), `constants/` (routes, modules, validation), `design/` (globals.css, icons, z-index).
- **Providers** (`providers/`): Theme, Cart, Query (React Query), Auth, Stats, TimelineLikes — composed both in `providers/index.tsx` and `components/layout/LayoutShell.tsx`.
- **State:** Zustand stores (`stores/` — auth, sidebar, theme) + React Query for server cache + StatsProvider.
- **Types:** `types/` (api, common, content, user, timeline, sidebar).
- **Lib helpers:** `db.ts, auth.ts, auth-server.ts, content.ts, search.ts, seo.ts, modules.ts, recommendations.ts, nas.ts, nvr.ts, tools.ts, revision.ts, slug-redirects.ts, jalali.ts, image.ts, rate-limit.ts, email.ts, server-post(s).ts, cache-headers.ts, fonts.ts, sentry.ts, utils.ts`.

## 4. Data model (`prisma/schema.prisma`)
- **User** (id, username✱, email✱, role, roleFa, status, job, modules JSON string, avatar, password) — owns posts/comments/ratings.
- **Post** (the universal content type for blog/news/media/review/download/shop/forum via `module`+`slug` unique). Rich fields: content, gallery, tags, category, SEO, brand/model/sku/price/availability/warranty/specs (JSON), author, likes/views/rating, video fields, file fields, `published`, soft-delete (`deletedAt`/`deletedBy`), `PostRevision[]`.
- **Comment** (threaded via `parentId`, status, likes/dislikes, `CommentVote` by fingerprint), **Rating** (per user/post), **Like** (by fingerprint or user, unique per module+slug), **SlugRedirect**, **PostRevision**.
- **TimelineEvent** (+ `TimelineComment`, `TimelineLike`, `TimelineCommentVote`) — tech history timeline (Gregorian + Jalali dates).
- **NewsletterSubscriber**, **PasswordResetToken**, **UserNotificationState** (for unread notification dot).
- Lots of `@@index` hints tuned for listing/sort by date/likes/views/rating.

## 5. Modules (content "tabs")
blog, news, media, forum, download, tools, review, timeline, shop — plus tool sub-apps under `/tools`: `nas-selector`, `nvr-selector`, `raid-calculator` (RAID/SHR), `subnet-calculator`. Defined in `config/modules.config.ts` (`moduleList`, `toolRoutes`).

## 6. API routes (`app/api/...`)
- **auth:** login, logout, register, me, profile, change-password, forgot-password, reset-password.
- **content:** posts, comments + comments/vote, like, rating, views, search, home, stats, notifications.
- **modules:** download/[slug], news, timeline (events, events/[id], comments, like, liked-events).
- **payments:** pay/zarinpal/request, pay/zarinpal/verify.
- **admin:** users, moderation/comments, moderation/users, slug-redirects, upload, blob, content-health.
- **chat:** chat (OpenAI-compatible).
- **newsletter:** subscribe, unsubscribe.

## 7. External services / env
See `.env`. Required: `AUTH_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN`. Optional: `RESEND_API_KEY`, `CHAT_API_KEY`/`CHAT_BASE_URL`/`CHAT_MODEL`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_DSN`, Zarinpal + `NEXT_PUBLIC_SITE_URL`. `.env.example` has placeholders.

## 8. Tooling / scripts (`package.json`)
- `pnpm` (10.12.1) package manager; `postinstall` runs `prisma generate`.
- DB: `db:push`, `db:seed`, `db:backfill-metadata`, `db:seed-blob-content`.
- Checks: `check:content`, `check:db`, `check:blob`, `check:all` (scripts/checks/*).
- Tests: Playwright e2e (`test:e2e`, smoke) — `tests/e2e`, unit in `tests/unit`, `tests/setup.ts`.
- Lint/typecheck: `eslint .`, `tsc --noEmit`.
- Other: `data.cjs`, `tree.cjs` project scripts; `vercel.json`, `.github/workflows`.

## 9. Notable patterns / gotchas
- Client auth state is mirrored into `localStorage` (`tb_auth_user`) for instant cross-tab sync — server is source of truth via `tb_session` cookie.
- `lib/content.ts` is the **static** content fallback (empty arrays) — real data comes from DB/Prisma; `getCommentCount` intentionally returns 0 server-side and is filled live by StatsProvider.
- All images go through `next/image` with remotePatterns for zarinpal cdn + `*.public.blob.vercel-storage.com`; long cache headers on fonts/images/assets.
- `prisma/db.ts` deliberately doesn't throw at import time when `DATABASE_URL` is missing (Vercel build-time metadata collection) — fails safely to `db_unavailable` at query time.
- Theme + sidebar open-state are applied via inline scripts in `app/layout.tsx` to avoid FOUC/hydration flash.

## 10. How to make changes (session workflow)
- Repo already cloned at `/home/user/techbox`; `origin` remote is authenticated (push works to `main` or a new branch).
- Create changes with `edit_file`/`write_file`, then `pnpm install` (needs pnpm; not preinstalled — may need `corepack enable` or `npm i -g pnpm`), `prisma generate`, `pnpm build` to verify.
- Commit & push with the token already in remote URL, or `git push https://hnmodeq:<TOKEN>@github.com/hnmodeq/techbox.git`.
