# TechBox — Hard-code cleanup + polish roadmap

Goal: eliminate ALL fake/hard-coded data, put everything in its correct
folder, and reach Vercel/GitHub/Neon-level professionalism. No rush; verify
with Lint/Typecheck/Build at the end of each phase.

## 🔴 Phase A — Kill fake data (HARD-CODE CLEANUP)

### A1. Work-with-us → real DB feature (centerpiece)
- [x] Add `Job` + `JobApplication` models to `prisma/schema.prisma` (Job: slug,title,type,remote,team,excerpt,description,active,order; JobApplication: name,email,phone,resumeUrl,resumeName,message,status).
- [x] `prisma generate` + `prisma db push` (creates tables on Neon).
- [x] API: `GET /api/jobs` (active list), `GET /api/jobs/[slug]`, `POST /api/jobs/[slug]/apply` (multipart → CV to Vercel Blob via `@vercel/blob`, zod-validated, rate-limited, stores JobApplication).
- [x] Public pages read from DB (server components): `app/work-with-us/page.tsx` + `app/work-with-us/[slug]/page.tsx`.
- [x] Apply form → real POST (no `alert()`), uploads CV to Blob, shows success.
- [x] Admin: `app/admin/jobs` (list + create/edit/delete + view applications with CV download). Gate with `canEditModule(user,'workwithus')` (or super_admin).
- [x] Seed the existing 7 jobs from `jobs.json` into the DB as real records (then delete `prisma/mock-data/jobs.json`).

### A2. Tools — out of the "mock" folder, not content
- [x] Remove `prisma/mock-data/tools.json`; `lib/tools.ts` uses `toolRoutes` from `config/modules.config` directly (drop fake likes/views/author).
- [x] Move `nas-products.json` + `nvr-products.json` out of `prisma/mock-data/` → `data/tools/` (legitimate reference catalogs, not mock).
- [x] `lib/nas.ts` / `lib/nvr.ts`: import from `data/tools/...`; drop the `shop.json` mock merge (self-contained product data).
- [x] Delete `prisma/mock-data/shop.json` if unused elsewhere.
- [x] Confirm tools are never treated as `Post` content anywhere.

### A3. Mention autocomplete — real users, not mock
- [x] Add `GET /api/users/mentions?q=` (public, returns id/username/name/avatar of active users, no email).
- [x] `hooks/useMentionAutocomplete.ts`: fetch from that endpoint instead of hardcoded `mockUsers`.

### A4. Chat demo fallback
- [x] Review `app/api/chat/route.ts` demo mode — keep as graceful offline fallback only (already `mock:true`); ensure it's never shown as real content.

## 🟠 Phase B — High-value polish
- [x] `app/not-found.tsx` (branded 404) + `app/error.tsx` (branded error) matching module theme.
- [x] Sync `.env.example` with all real env vars (RESEND, CHAT, UPSTASH, SENTRY, CONTACT_EMAIL, Zarinpal, BLOB).
- [x] Wire `pnpm test:e2e` into CI as a separate, non-blocking job (needs `playwright install chromium`).

## 🟡 Phase C — Medium
- [x] Accessibility: `prefers-reduced-motion` guards on heavy effects (ChromaGrid/Dock); visible focus-ring audit; skip-link.
- [x] Per-detail-page SEO: ensure `StructuredData` (JSON-LD) is mounted on blog/news/media/review/forum/download/shop detail routes.
- [x] Contact: optionally persist submissions to DB (so none are lost if email unconfigured).

## 🟢 Phase D — Nice-to-have
- [x] `app/api/healthz` route for uptime monitoring.
- [x] Bump dependency majors (Next 16.2.10) — Prisma 7 and ESLint 10 deferred due to breaking changes/plugin incompatibilities.
- [ ] Sentry custom Web-Vital/perf alerts.

---
## Previous phases (done & pushed)
- Phase 1 (7e01f94): cleanup, SW, FAB image.
- Phase 2 (680bbdc): real AuthProvider/useAuth, SSR homepage, theme.
- Phase 3 (b163fc0): module single-source-of-truth, font + bundle opt.
- Phase 4 (2d5c41a): 3-job CI, contact endpoint, smoke test, README, deps.
