# TechBox — Agent Implementation Roadmap

> **Audience:** Any human or coding agent continuing this project.  
> **Source audit:** Static read-only review of `main` @ `5e8c011` (2026-07-11).  
> **Repo:** https://github.com/hnmodeq/techbox  
> **This file is the single source of truth for remaining work.** Older `TODO.md` (hard-code cleanup) is mostly done; prefer this document.

---

## 0. How to use this document

1. Read **§1 Product decisions** first — they override generic “production perfection” advice.
2. Read **§2 Project map** so you do not invent parallel architecture.
3. Fix items in **priority order (P0 → P1 → P2 → P3)**. Do not start P2 while open P0s remain unless blocked.
4. Every task has: **IDs**, **files**, **why**, **steps**, **acceptance**, **tests**, **effort**.
5. **Do not** print, commit, or log secret values. Rotate secrets out-of-band if they were ever pasted into chat.
6. **Do not** enable real Zarinpal payments or custom-domain assumptions until product says so.
7. Prefer **incremental PR-sized changes**. No rewrites unless a task explicitly requires them.
8. After each task: `pnpm lint`, `pnpm typecheck`, and relevant smoke tests if deps are installed.

### Working conventions

| Rule | Detail |
|------|--------|
| Package manager | `pnpm` only (`packageManager`: `pnpm@10.12.1`) |
| App structure | App Router `app/`, feature slices `features/`, shared `lib/`, modules SSOT `config/modules.config.ts` |
| Auth truth | Server: `tb_session` JWT cookie via `lib/auth-server.ts`. Client `localStorage` (`tb_auth_user`) is cache only — never authorize from it alone |
| Content truth | DB `Post` (`module` + `slug`). Static arrays in `lib/content.ts` are empty fallbacks |
| Schema changes | Prefer Prisma **migrations** going forward (today repo only has `db push` — see DATA-001) |
| Secrets | `.env` / `.env.local` gitignored. Update `.env.example` names only, never real values |

---

## 1. Product decisions (owner answers — binding)

| # | Topic | Decision | Implementation implication |
|---|--------|----------|----------------------------|
| 1 | Stage | **Development only** for now | Optimize for safety + correctness + honest UX, not full launch polish. Still fix **security blockers** so preview/dev deploys are not trivially owned. |
| 2 | Shop | **Catalog only** | No real checkout. Hide/disable payment; no Order ledger required yet. Products remain browseable. |
| 3 | Domain | **No custom domain** | Use `NEXT_PUBLIC_SITE_URL` = current `*.vercel.app` (or localhost). SEO/callbacks/reset links use that origin. |
| 4 | Email | **Resend free / default sender** | No paid domain. Wire configurable from-address (e.g. `onboarding@resend.dev` or Resend account default). Document limit: free tier often only delivers to the Resend account owner. Never use fake `no-reply@techbox.local` as if it were real. |
| 5 | Timeline / jobs admin | **Editors allowed** (not only super_admin) | Gate writes with `super_admin` **or** `editor` (and/or `canEditModule` where a module key exists). |
| 6 | Comments | **Admin-configurable policy** | Setting A: free (auto-approve). Setting B: all comments need admin approval. Plus **one-click hide/unhide all comments** site-wide. Store settings server-side (DB), not localStorage. |
| 7 | Job resumes | **Default retention 30 days**, **admin-configurable** | Store retention days in settings; cleanup job or on-read GC; admin panel field. |
| 8 | Trust / partners | **No partner permissions** | Remove hard-coded brand names / fake “trusted by” claims. |
| 9 | Cost | **Free tier only** while developing | No paid search/AI upsell. Chat stays cheap model from env. Sentry sampling low. Rate limits via free Upstash if present; safe in-memory fallback if not. |
| 10 | AI chat | **Public** | No login required, but harden cost (server model only, size limits, rate limit). |

### Explicit non-goals (for now)

- Real Zarinpal live payments / order fulfillment  
- Custom email domain / branded production sender beyond Resend free  
- Partner logo program / legal trademark licenses  
- Full CMS rewrite, Prisma 7, or framework migrations  
- Perfect CWV / large bundle rewrite (only high-ROI perf fixes)

---

## 2. Project map (for orientation)

### Stack

- **Next.js 16** App Router, React 19, TypeScript strict, Tailwind v4  
- **Prisma 6** + PostgreSQL (Neon) — `prisma/schema.prisma`, `lib/db.ts`  
- **Auth:** custom JWT (`jose`) + `bcryptjs` — `lib/auth-server.ts`, `lib/auth.ts`, `providers/auth.provider.tsx`  
- **Blob:** `@vercel/blob` — admin upload + job resumes  
- **Email:** Resend — `lib/email.ts`  
- **Rate limit:** Upstash — `lib/rate-limit.ts`  
- **Chat:** OpenAI-compatible — `app/api/chat/route.ts`  
- **Pay (partial/mock):** `app/api/pay/zarinpal/*`, `app/shop/checkout/page.tsx`  
- **Sentry:** `sentry.*.config.ts`, `instrumentation.ts`  
- **CI:** `.github/workflows/ci.yml` (lint, typecheck, build, smoke e2e)  
- **No `middleware.ts` today** — admin UI is client-gated only  

### Important modules

| Path | Role |
|------|------|
| `config/modules.config.ts` | Module registry (titles, colors, hrefs) — SSOT |
| `lib/auth-server.ts` | Session create/verify, password hash, `canEditModule` |
| `lib/db.ts` | Prisma client (must not throw at import if DB missing) |
| `app/api/posts/route.ts` | Content CRUD + list (RBAC on writes) |
| `app/api/admin/*` | Admin APIs (mostly super_admin / editor) |
| `app/api/timeline/*` | Timeline events/comments/likes |
| `features/*` | UI per domain |
| `prisma/schema.prisma` | Data model |

### Roles (current code)

- `super_admin` — full access  
- `editor` — modules in `User.modules` JSON string array  
- `user` — normal member  

**Product decision:** editors may manage timeline (and similar editorial surfaces), not only super_admin.

---

## 3. Critical issues summary (must internalize)

| ID | Severity | One-line problem | Primary file(s) |
|----|----------|------------------|-----------------|
| **SEC-001** | Blocker | `getSessionUser()` accepts spoofable `x-user-id` / `x-auth-user` → full auth bypass | `lib/auth-server.ts` |
| **SEC-002** | Blocker | Timeline event POST/PUT/DELETE has **no auth** | `app/api/timeline/events/**` |
| **SEC-003** | Critical | Change-password accepts hardcoded `techbox123` as current password | `app/api/auth/change-password/route.ts` |
| **SEC-004** | Critical | Seed shared weak password (`123456xX`) + account UI defaults (`techbox123`) | `prisma/seed-blob-content.ts`, `app/account/page.tsx` |
| **SEC-005** | Critical | Payment mock auto-verifies; client amount; no orders — **shop is catalog-only** so **disable**, don’t build full pay yet | `app/api/pay/**`, `app/shop/checkout/**` |
| **SEC-006** | Critical | Secrets may have been exposed in chat — rotate out-of-band | ops / Vercel / Neon / etc. |
| **SEC-007** | Critical | Fallback `AUTH_SECRET` if env missing | `lib/auth-server.ts` |
| **SEC-008** | High | Admin pages trust client localStorage; no middleware | `app/admin/**` |
| **SEC-009** | High | Login ignores banned/suspended; username enumeration | `app/api/auth/login/route.ts` |
| **SEC-010** | High | Chat accepts client `model`; weak size limits; public OK but must cap cost | `app/api/chat/route.ts` |
| **SEC-011** | High | Rate limit fail-open without Redis; IP from spoofable headers | `lib/rate-limit.ts` |
| **SEC-012** | High | Job resumes uploaded `access: "public"` | `app/api/jobs/[slug]/apply/route.ts` |
| **SEC-013** | High | Contact/comment emails interpolate unsanitized HTML | `app/api/contact/route.ts`, `lib/email.ts` |
| **SEC-014** | High | Reset links to missing `/auth/reset-password` page; tokens plaintext | auth routes + no UI |
| **SEC-019** | High | Env name mismatches (`ZARIN*` vs example, Sentry DSN, no `RESEND_FROM_EMAIL` in code) | `.env.example`, pay, sentry, email |
| **CONT-001** | High | Fake homepage stats + fake partner brands (owner: **remove brands**) | `LandingStats.tsx`, `TrustSection.tsx` |
| **DATA-001** | High | No `prisma/migrations`; only `db push` | `prisma/` |
| **REL-002/003** | Medium | Consultation form fake success; forum “new topic” localStorage only | consultation + forum features |

---

## 4. Settings model (new — needed for owner decisions 6 & 7)

Several P1 tasks need a small **site settings** store. Implement once, reuse.

### Suggested approach

Add Prisma model (name flexible):

```prisma
model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   // JSON string or plain
  updatedAt DateTime @updatedAt
  updatedBy String?
}
```

### Keys to support

| Key | Type | Default | Used by |
|-----|------|---------|---------|
| `comments.mode` | `"auto_approve" \| "require_approval"` | `"auto_approve"` | comment create + public list |
| `comments.hidden_globally` | `boolean` | `false` | GET comments / UI empty state |
| `jobs.resume_retention_days` | `number` | `30` | resume cleanup + apply metadata |
| (optional later) `chat.enabled` | `boolean` | `true` | chat route |

### Admin API

- `GET/PATCH /api/admin/settings` — `super_admin` only (or super_admin + editor if you prefer; **default: super_admin only for global switches**).  
- Admin UI section under `/admin` (e.g. `/admin/settings` or tabs on moderation page).

### One-click hide/unhide all comments

- Prefer **global flag** `comments.hidden_globally` (instant, reversible, no mass row rewrite).  
- When true: public comment GETs return `[]` + message; POSTs return 403 with clear copy.  
- Admin moderation UI can still list comments when flag is on (admin APIs bypass hide for moderators).  
- Optional later: mass `status=hidden` migration — not required if flag works.

---

## 5. Prioritized TODO list

Legend: effort **XS** &lt;1h · **S** half-day · **M** 1–2 days · **L** multi-day

---

### P0 — Security & honesty blockers (do first)

#### [x] P0-1 — Rotate exposed credentials (ops, not code)

- **IDs:** SEC-006  
- **Why:** Secrets may have appeared outside the repo; treat as compromised.  
- **Steps:**
  1. Rotate: Neon DB password/URL, `AUTH_SECRET`, Blob token, Resend key, Upstash token, OpenAI/chat key, Sentry DSNs.  
  2. Update Vercel project env + local `.env` only.  
  3. Never commit values; never paste into issues/chat.  
- **Acceptance:** Old credentials fail; app works with new ones on preview.  
- **Tests:** Manual login, healthz, one authenticated admin GET.  
- **Effort:** S · **Deps:** none  

#### [x] P0-2 — Remove header-based auth bypass

- **IDs:** SEC-001  
- **Files:** `lib/auth-server.ts` (and any test that assumed headers)  
- **Why:** Anyone can send `x-user-id: <cuid>` and become that user (including super_admin).  
- **Steps:**
  1. Delete fallback that sets `sub` from `x-user-id` / `x-auth-user`.  
  2. Session = verified JWT cookie only.  
  3. After loading user: if `status` is `banned` or `suspended`, return `null`.  
  4. Prefer not returning full user row with password hash to general callers — add `getSessionUserPublic()` without `password` if needed; keep password only for change-password path via explicit select.  
- **Acceptance:** Request with only spoofed headers → unauthenticated on `/api/auth/me` and admin APIs. Valid cookie still works. Banned user cookie → null session.  
- **Tests:** Unit/integration: spoof header fails; good cookie works; banned fails.  
- **Effort:** S · **Deps:** none  

#### [x] P0-3 — Auth-guard timeline event mutations

- **IDs:** SEC-002  
- **Files:** `app/api/timeline/events/route.ts`, `app/api/timeline/events/[id]/route.ts`  
- **Why:** Public can create/update/delete timeline history.  
- **Steps:**
  1. POST/PUT/DELETE require `getSessionUser()`.  
  2. Allow if `role === "super_admin"` **OR** `role === "editor"` (owner decision #5).  
  3. Validate body with Zod (title, description, dates, importance, tags).  
  4. GET public list may stay public for published events only.  
- **Acceptance:** Anonymous POST/PUT/DELETE → 401; random user → 403; editor/super_admin → success.  
- **Tests:** API tests for 401/403/201.  
- **Effort:** S · **Deps:** P0-2  

#### [x] P0-4 — Remove password backdoors and dev login defaults

- **IDs:** SEC-003, SEC-004  
- **Files:**  
  - `app/api/auth/change-password/route.ts`  
  - `app/account/page.tsx`  
  - `prisma/seed-blob-content.ts` (stop logging password; use env `SEED_DEFAULT_PASSWORD` only for local seed)  
- **Why:** Change-password route has `techbox123` backdoor (`if (!ok && currentPassword !== "techbox123")`); account page quick-login defaults to `techbox123` and placeholder advertises it; seed uses shared password `123456xX` for all users and logs it to console. Two different weak passwords — both dangerous.  
- **Steps:**
  1. Remove `currentPassword !== "techbox123"` bypass entirely from change-password route.  
  2. Remove quick-login that posts `techbox123`; remove placeholder text advertising defaults.  
  3. Seed: password from env `SEED_DEFAULT_PASSWORD` or random; replace hardcoded `123456xX`; log only “seeded N users” never the secret; document local-only seed in README.  
- **Acceptance:** Change-password requires real current password; UI has no default password hints; seed does not print secrets.  
- **Tests:** change-password API tests.  
- **Effort:** S · **Deps:** P0-2  

#### [x] P0-5 — Fail closed if `AUTH_SECRET` missing/weak in deployed envs

- **IDs:** SEC-007  
- **Files:** `lib/auth-server.ts`, optionally `instrumentation.ts`  
- **Why:** Fallback `"dev-secret-please-change-32char!"` allows forged JWTs.  
- **Steps:**
  1. If `NODE_ENV === "production"` or `VERCEL_ENV` is `preview`/`production`: require `AUTH_SECRET` length ≥ 32; throw/log clear error on auth use.  
  2. Local dev may keep explicit opt-in only if documented — prefer requiring `.env` always.  
- **Acceptance:** Deploy without AUTH_SECRET does not silently sign with default.  
- **Effort:** XS · **Deps:** none  

#### [x] P0-6 — Shop = catalog only: disable payment/checkout commerce path

- **IDs:** SEC-005, UX-001  
- **Files:**  
  - `app/api/pay/zarinpal/request/route.ts`  
  - `app/api/pay/zarinpal/verify/route.ts`  
  - `app/shop/checkout/page.tsx`  
  - Shop CTAs in `features/shop/**`, cart drawer if it links to checkout  
- **Why:** Owner decision #2 catalog-only; mock verify is dangerous if left reachable.  
- **Steps:**
  1. Pay APIs: return **503** `{ error: "payments_disabled" }` always (or when `PAYMENTS_ENABLED !== "true"`).  
  2. Checkout page: replace with clear “فروشگاه به‌صورت کاتالوگ — پرداخت غیرفعال” (no mock success, no merchant instructions for end users).  
  3. Cart: allow browse/add for UX **or** simplify to “inquiry” — but **no pay button that claims success**.  
  4. Do **not** build Order models yet.  
  5. Align env docs: mark Zarinpal as future; remove confusing `NEXT_PUBLIC_ZARIN_*` live indicators.  
- **Acceptance:** No UI path shows successful payment; pay APIs cannot return `verified: true` mock in any env unless explicit future flag (default off).  
- **Tests:** e2e checkout shows unavailable; pay API 503.  
- **Effort:** S · **Deps:** none  

#### [x] P0-7 — Remove fake trust brands; neutralize fake stats

- **IDs:** CONT-001  
- **Files:** `features/home/components/TrustSection.tsx`, `features/home/components/LandingStats.tsx`, `app/page.tsx`  
- **Why:** Owner has no partner permission (#8); fake metrics mislead IT audience.  
- **Steps:**
  1. **Remove** `TrustSection` from homepage (or delete component).  
  2. `LandingStats`: either remove section **or** replace numbers with real cached counts (`Post` published count, `User` count, etc.) with honest labels — no fabricated “۸۹٬۰۰۰ کاربر”.  
  3. If DB empty/unavailable, show empty state or omit section — never hard-coded vanity numbers.  
- **Acceptance:** Homepage has no third-party brand list; no invented user/content figures.  
- **Effort:** S · **Deps:** none  

---

### P1 — Required for a safe development/preview deploy

#### [x] P1-1 — Server-side admin protection

- **IDs:** SEC-008  
- **Files:** new `middleware.ts` and/or `app/admin/layout.tsx` (server), keep API checks  
- **Steps:**
  1. For `/admin/*` except `/admin/login`: require session user with `super_admin` or `editor`.  
  2. Redirect unauthenticated → `/admin/login`.  
  3. Never use `getCurrentUserClient()` as sole gate.  
- **Acceptance:** Logged-out browser cannot render admin shell content (redirect). APIs still 401/403.  
- **Effort:** M · **Deps:** P0-2  

#### [x] P1-2 — Login: status check + uniform errors

- **IDs:** SEC-009  
- **Files:** `app/api/auth/login/route.ts`  
- **Steps:**
  1. Same error body for unknown user vs bad password (e.g. 401 `invalid_credentials`).  
  2. If user exists but `status !== "active"` → 403 with safe message (or same generic 401 if you want zero enumeration). Prefer: generic 401 for bad creds; 403 only when password correct but banned (optional product choice — document in code comment).  
- **Acceptance:** No `404 not found` username oracle; banned cannot get session cookie.  
- **Effort:** XS · **Deps:** P0-2  

#### [x] P1-3 — Rate limit: safer default + cover auth email routes

- **IDs:** SEC-011  
- **Files:** `lib/rate-limit.ts`; wire into `forgot-password`, `reset-password`, `newsletter/*`, pay (already disabled)  
- **Steps:**
  1. If Upstash missing: use in-memory sliding window **per instance** (good enough for dev); document multi-instance limit.  
  2. On Vercel, prefer platform IP (`x-forwarded-for` last trusted hop or `request.ip` if available) — document trust model in comment.  
  3. Add limiters for forgot/reset/newsletter.  
- **Acceptance:** Burst forgot-password returns 429; app still runs without Upstash.  
- **Effort:** M · **Deps:** none  

#### [x] P1-4 — Public chat cost hardening (chat stays public)

- **IDs:** SEC-010  
- **Files:** `app/api/chat/route.ts`, `features/chat/components/Chatbot.tsx`  
- **Steps:**
  1. **Ignore** client `model` / force `process.env.CHAT_MODEL` only.  
  2. Cap: max N messages (e.g. 12), max chars per message (e.g. 2k), clamp temperature server-side.  
  3. Strip/ignore client `role: system` in payload (only server system prompt).  
  4. Keep demo fallback when no API key; mark `mock: true`.  
  5. Rate limit remains required (P1-3).  
- **Acceptance:** POST with `"model":"gpt-4o"` still uses env model; oversized body → 400.  
- **Effort:** S · **Deps:** P1-3 preferred  

#### [x] P1-5 — Env canonicalization + soft validation

- **IDs:** SEC-019, OPS-002  
- **Files:** `.env.example`, `lib/email.ts`, sentry configs, pay (disabled), new `lib/env.ts` optional  
- **Steps:**
  1. Document actual names code reads.  
  2. Email: `from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"` (or Resend-required format); never `techbox.local`.  
  3. Sentry: either read `NEXT_PUBLIC_SENTRY_DSN` on server too, or document both vars in `.env.example`.  
  4. Payments vars marked optional/future; remove dead `ZARINPAL` vs `ZARIN` confusion in example.  
  5. README: free Resend limits (recipient often = account owner only).  
- **Acceptance:** With free Resend defaults, contact/welcome attempts use a valid from; example matches code.  
- **Effort:** S · **Deps:** none  

#### [x] P1-6 — Escape user content in emails

- **IDs:** SEC-013  
- **Files:** `lib/email.ts`, `app/api/contact/route.ts`, comment notification path  
- **Steps:** HTML-escape name/email/subject/message/comment text; or render via `@react-email/components` already in deps.  
- **Acceptance:** Payload with `<script>` appears as text in email HTML source.  
- **Effort:** S · **Deps:** P1-5 nice-to-have  

#### [x] P1-7 — Password reset UI + safer tokens

- **IDs:** SEC-014, REL-001  
- **Files:** new `app/auth/reset-password/page.tsx` (and optional forgot UI), `app/api/auth/forgot-password/route.ts`, `reset-password/route.ts`, schema if hashing  
- **Steps:**
  1. Build page that reads `token` + `email` query, posts new password.  
  2. Store **hash** of token in DB (SHA-256), compare hash on reset.  
  3. TTL 1h recommended (was 24h).  
  4. Rate limit (P1-3).  
  5. `NEXT_PUBLIC_SITE_URL` must be vercel.app URL for links.  
- **Acceptance:** Full reset flow works on preview URL; raw token not stored.  
- **Effort:** M · **Deps:** P1-3, P1-5  

#### [x] P1-8 — Site settings + comment policy + global hide

- **IDs:** owner #6, DATA-004  
- **Files:** `prisma/schema.prisma`, new admin settings API/UI, `app/api/comments/route.ts`, moderation pages  
- **Steps:**
  1. Add `SiteSetting` (see §4).  
  2. Admin UI:  
     - Radio/select: **آزاد (تأیید خودکار)** vs **همه دیدگاه‌ها نیاز به تأیید ادمین**  
     - Toggle/button: **مخفی‌سازی همه دیدگاه‌ها در سایت** / **نمایش مجدد**  
  3. On comment POST: if mode `require_approval` → `status: "pending"`; if `auto_approve` → `approved`.  
  4. Public GET: only `approved` AND global hide flag false.  
  5. Moderators keep list/approve/reject APIs.  
- **Acceptance:** Switching mode changes behavior for **new** comments without deploy; global hide empties public threads instantly; admin can still moderate.  
- **Tests:** API tests for both modes + hide flag.  
- **Effort:** M · **Deps:** P0-2, P1-1 for UI  

#### [x] P1-9 — Job resumes: less public + retention setting (default 30d)

- **IDs:** SEC-012, owner #7  
- **Files:** `app/api/jobs/[slug]/apply/route.ts`, admin applications UI, settings, optional cleanup script/route  
- **Steps:**
  1. Sanitize resume filename (reuse upload sanitizer patterns).  
  2. Prefer private blob if Vercel plan allows; if free tier forces public URLs, use unguessable path + **do not list** resumes in public APIs; admin-only listing.  
  3. Setting `jobs.resume_retention_days` default 30; admin editable.  
  4. Cleanup: cron-friendly script or admin button “delete expired resumes” (delete blob + DB row or null URL). Document that Vercel Cron may need later.  
- **Acceptance:** Default 30 days in settings UI; expired cleanup removes files; apply still works.  
- **Effort:** M · **Deps:** P1-8 settings model  

#### [x] P1-10 — Honest consultation form

- **IDs:** REL-002  
- **Files:** `features/consultation/components/consultation-modal.tsx`, `app/consultation/page.tsx`  
- **Steps:** Submit to `/api/contact` (or dedicated endpoint) with validation; real error/success. No fake “registered” without server OK.  
- **Effort:** S · **Deps:** P1-6 preferred  

#### [x] P1-11 — Forum new topic → real API

- **IDs:** REL-003  
- **Files:** `features/forum/components/ForumList.tsx`, `app/api/posts/route.ts` (already supports forum module)  
- **Steps:**
  1. Require login.  
  2. POST `/api/posts` with module `forum` (users may need permission — decide: allow any active user to create forum posts **or** only editors). **Recommendation for IT hub:** any active logged-in user can create forum topics; editors/super_admin can edit/delete. May require posts POST policy change for module `forum` only.  
  3. Remove localStorage-only “published” illusion; drafts optional and labeled.  
- **Acceptance:** New topic appears after refresh for other users.  
- **Effort:** M · **Deps:** P0-2  

#### [x] P1-12 — Prisma migrations workflow

- **IDs:** DATA-001  
- **Files:** `prisma/`, README, optional `DIRECT_URL` in schema  
- **Steps:**
  1. Add `directUrl = env("DIRECT_URL")` for Neon non-pooled migrate.  
  2. Baseline migration from current schema.  
  3. Document: dev may `migrate dev`; deploy `migrate deploy`; stop relying on `db push` for shared DB.  
- **Acceptance:** Fresh env can migrate to full schema without `db push`.  
- **Effort:** M · **Deps:** settings/comments schema tasks ideally land as migrations  

#### [x] P1-13 — Sentry sampling down (free-tier friendly)

- **IDs:** PERF-003  
- **Files:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`  
- **Steps:** `tracesSampleRate` ~0.05–0.1; keep errors; replay rates modest.  
- **Effort:** XS · **Deps:** none  

#### [x] P1-14 — Baseline security headers

- **IDs:** SEC-015  
- **Files:** `next.config.mjs` headers or middleware  
- **Steps:** `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`, practical CSP (start report-only if needed). HSTS only when HTTPS prod host stable.  
- **Effort:** M · **Deps:** none  

#### [x] P1-15 — Editor access consistency (timeline, jobs, moderation)

- **IDs:** owner #5  
- **Files:** timeline APIs (P0-3), `app/api/admin/jobs/**`, admin nav UI, moderation if editors should moderate comments  
- **Steps:**
  1. Align checks: `super_admin || editor` for editorial admin surfaces you want editors to use.  
  2. Keep **user role management**, **global settings**, **blob browser** as `super_admin` only unless product expands later.  
  3. Update admin sidebar/buttons so editors see allowed links only.  
- **Acceptance:** Editor account can manage timeline + jobs content; cannot patch arbitrary users’ roles.  
- **Effort:** S · **Deps:** P0-3, P1-1  

---

### P2 — Important soon (quality / integrity)

#### [x] P2-1 — Transactional like/vote counters

- **IDs:** DATA-002  
- **Files:** `app/api/like/route.ts`, `app/api/comments/vote/route.ts`, timeline like  
- **Steps:** Prisma `$transaction`; prevent negative counts.  
- **Effort:** S  

#### [x] P2-2 — Notifications scoped to current user

- **IDs:** SEC-017  
- **Files:** `app/api/notifications/route.ts`  
- **Steps:** Require auth; only events on user’s posts / mentions.  
- **Effort:** S  

#### [x] P2-3 — Download redirect allowlist

- **IDs:** SEC-018  
- **Files:** `app/api/download/[slug]/route.ts`  
- **Steps:** Only allow Vercel Blob host(s) / configured CDN hosts.  
- **Effort:** S  

#### [x] P2-4 — Disallow SVG admin upload (or sanitize)

- **IDs:** SEC-016  
- **Files:** `app/api/admin/upload/route.ts`  
- **Effort:** XS  

#### [x] P2-5 — `/api/stats` scalability

- **IDs:** PERF-001  
- **Files:** `app/api/stats/route.ts`, `providers/stats.provider.tsx`  
- **Steps:** Avoid loading all posts; batch by keys or cache 30–60s; or embed counts in list APIs.  
- **Effort:** M  

#### [x] P2-6 — Timeline list payload slim

- **IDs:** PERF-002  
- **Files:** `app/api/timeline/events/route.ts`  
- **Steps:** Don’t include all comments/likes on list; fetch on demand.  
- **Effort:** S  

#### [x] P2-7 — CI: run `check:all` when secrets exist; fix unit test runner

- **IDs:** REL-005, REL-006  
- **Files:** `.github/workflows/ci.yml`, `package.json`, `tests/unit/*`  
- **Steps:** Add vitest (or node:test); wire `pnpm test`; optional DB job actually runs checks.  
- **Effort:** M  

#### [x] P2-8 — Stronger password policy

- **IDs:** SEC-020  
- **Files:** register/reset/change-password schemas  
- **Steps:** Min 8+; consistent messages.  
- **Effort:** XS  

#### [x] P2-9 — Healthz no internal DB errors

- **IDs:** REL-008  
- **Files:** `app/api/healthz/route.ts`  
- **Effort:** XS  

#### [x] P2-10 — About page real contact or remove placeholder phone

- **IDs:** UX-002  
- **Files:** `app/about/page.tsx`  
- **Effort:** XS  

#### [x] P2-11 — Roles page honesty

- **IDs:** REL-004  
- **Files:** `app/admin/roles/page.tsx`  
- **Steps:** Either remove localStorage fake roles UI or drive from real `User.role` + modules API.  
- **Effort:** M  

#### [x] P2-12 — Fix or delete broken `scripts/seed-jobs.ts`

- **IDs:** REL-007  
- **Effort:** XS  

---

### P3 — Later enhancements

#### [ ] P3-1 — Sanitized Markdown/HTML content pipeline

- **IDs:** CONT-002  
- **Files:** `features/content/components/ContentDetail.tsx`, admin editor  
- **Note:** Today content is plain text in `<p>` (safe, limited).  

#### [ ] P3-2 — Editorial states (draft / review / published / archived)

- **IDs:** CONT-003  
- **Beyond boolean `published` + localStorage drafts.**  

#### [ ] P3-3 — Full-text search indexes

- **IDs:** PERF-005  

#### [ ] P3-4 — Bundle: dynamic import chat/heavy effects

- **IDs:** PERF-004  

#### [ ] P3-5 — Prisma `Json` fields instead of stringified JSON

- **IDs:** DATA-005  

#### [ ] P3-6 — gitignore `.vercel`; untrack org metadata if not needed

- **IDs:** OPS-001  

#### [ ] P3-7 — Real payments (future only)

- When product leaves catalog-only: server-priced orders, Zarinpal verify against DB amount, idempotency, no mock in production. **Not now.**

---

## 6. Suggested execution sequence (dependency-aware)

```text
Phase 0  P0-1 rotate secrets
Phase 1  P0-2 auth bypass → P0-5 AUTH_SECRET → P0-4 passwords → P0-3 timeline auth
         P0-6 disable payments → P0-7 remove fake trust/stats
Phase 2  P1-1 admin middleware → P1-2 login → P1-15 editor access matrix
         P1-3 rate limit → P1-4 chat harden
         P1-5 env/email → P1-6 escape email → P1-7 reset UI
Phase 3  P1-8 settings + comments policy/hide → P1-9 resumes retention
         P1-10 consultation → P1-11 forum create
         P1-12 migrations (include new tables)
         P1-13 Sentry · P1-14 headers
Phase 4  P2-* quality items as needed
Phase 5  P3-* only after product leaves pure-dev mode
```

### Verification checklist after each phase

- [ ] `pnpm lint`  
- [ ] `pnpm typecheck`  
- [ ] `pnpm build` (DB may be absent — build should still succeed)  
- [ ] `pnpm test:smoke` if Playwright available  
- [ ] Manual: login, admin as editor, comment modes, shop has no pay success, chat still public  

### Rollback notes

- Auth secret rotation logs everyone out (expected).  
- Migrations: keep backward compatible; avoid drop columns until unused.  
- Feature flags: `PAYMENTS_ENABLED` default false; comment hide flag reversible.

---

## 7. Environment variables (agent reference — no values)

| Name | Required now | Notes |
|------|--------------|-------|
| `AUTH_SECRET` | **Yes** | ≥32 chars; no code fallback in deploy |
| `DATABASE_URL` | **Yes** | Neon pooled OK for app |
| `DIRECT_URL` | For migrations | Neon direct; add with P1-12 |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://<project>.vercel.app` or `http://localhost:3000` |
| `BLOB_READ_WRITE_TOKEN` | For uploads/resumes | |
| `RESEND_API_KEY` | Optional | Free tier OK |
| `RESEND_FROM_EMAIL` | Optional | Wire in code; free default e.g. `onboarding@resend.dev` |
| `CONTACT_EMAIL` | Optional | Where contact form delivers (often must be allowed Resend recipient) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Optional | Prefer set on Vercel; in-memory fallback after P1-3 |
| `CHAT_API_KEY` / `CHAT_BASE_URL` / `CHAT_MODEL` | Optional | Public chat; server model only after P1-4 |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Optional | Low sample rates |
| `PAYMENTS_ENABLED` | Optional | Default unset/false — catalog only |
| Zarinpal vars | **Not needed now** | Future only |

Update `.env.example` whenever code names change.

---

## 8. Testing expectations for agents

| Layer | Current state | Target |
|-------|---------------|--------|
| Playwright smoke | `tests/e2e/smoke.spec.ts` | Keep green; add checkout-disabled + auth spoof checks |
| Unit | `tests/unit/*` uses vitest but vitest not in package.json | P2-7 fix |
| Manual | — | Header spoof, timeline write, comment modes, resume apply |

**Do not** run migrations/seeds against production without backup.  
**Do not** call live pay/email/AI from tests without mocks.

---

## 9. Out of scope / do not do

- Do not re-enable mock payment success for “demo wow”.  
- Do not add hard-coded partner brands.  
- Do not trust `localStorage` roles for authorization.  
- Do not put secrets in this file, README, or commits.  
- Do not assume custom domain or paid Resend domain.  
- Do not require login for chat (owner: public).  
- Do not large-rewrite Next/Prisma versions unless blocked.

---

## 10. Definition of “dev-preview ready”

All **P0** and **P1** items complete, and:

1. No auth bypass via headers.  
2. Timeline not world-writable.  
3. No password backdoors.  
4. Shop cannot fake-pay.  
5. Homepage not lying about partners/metrics.  
6. Comment mode + global hide controllable by admin.  
7. Resume retention default 30 days, configurable.  
8. Editors can do editorial work; super_admin retains dangerous ops.  
9. Chat public but cost-capped.  
10. Email uses Resend free-compatible from-address.  
11. `NEXT_PUBLIC_SITE_URL` points at vercel.app / localhost only.

**Production launch** (real payments, custom domain, partner program, paid email domain) is a **later** program of work — see P3-7 and non-goals.

---

## 11. Quick file index for common tasks

| Task | Start here |
|------|------------|
| Session/auth | `lib/auth-server.ts`, `app/api/auth/*` |
| RBAC helper | `canEditModule` in `lib/auth-server.ts` |
| Posts/content API | `app/api/posts/route.ts` |
| Comments | `app/api/comments/route.ts`, `app/api/admin/moderation/comments/route.ts` |
| Timeline | `app/api/timeline/**` |
| Upload | `app/api/admin/upload/route.ts` |
| Jobs/resumes | `app/api/jobs/**`, `app/api/admin/jobs/**` |
| Email | `lib/email.ts` |
| Rate limit | `lib/rate-limit.ts` |
| Chat | `app/api/chat/route.ts` |
| Shop/pay | `app/shop/**`, `app/api/pay/**` |
| Homepage sections | `app/page.tsx`, `features/home/components/*` |
| Schema | `prisma/schema.prisma` |
| Modules SSOT | `config/modules.config.ts` |

---

## 12. Change log for this document

| Date | Note |
|------|------|
| 2026-07-11 | Created from full audit + owner answers (dev stage, catalog shop, vercel.app, free Resend, editors, comment policies, 30d resumes, no partners, free cost, public chat). |

---

**Agents:** When you complete a checkbox task, mark it `[x]` in this file in the same PR, and briefly note residual risk if any. If product decisions change, update **§1** first, then reorder tasks.
