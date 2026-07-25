# TechBox stabilization record

The stabilization program was split into reviewable, CI-gated phases. GitHub
Actions and the Vercel deployment attached to a commit are the release source
of truth; local production builds are not used as evidence when the workspace
cannot run them reliably.

## Working rules

- Preserve the Persian RTL product experience and active production data.
- Keep the shop real: server-authoritative pricing and real payment state, not
  catalog-only or browser-trusted behavior.
- Enforce identity, ownership, publication state, privacy, and RBAC on the
  server, regardless of client navigation or UI guards.
- Use Prisma migrations for production schema changes; do not run application
  DDL or production `db push`.
- Never expose credentials, private objects, capability tokens, internal shop
  costs, or personal data in source, logs, or public DTOs.
- Keep the QNAP importer gated by explicit authorization.
- Keep the retired download content removed while the download center is
  disabled.

## Phase status

| Phase | Main commit(s) | Outcome |
| --- | --- | --- |
| 1 — Restore baseline | `264539b` | Shared UI/type mismatch fixed; CI baseline restored; plan recorded. |
| 2 — Real shop/security | `9b9defe` | Canonical server pricing, guest capabilities, order privacy, payment authority/state validation, and order tests. |
| 3 — Authoritative auth/RBAC | `6f6ded7`, `d040aff` | Server session authority, mandatory signing secret, Role/UserRole enforcement, delegation protection, and RBAC migration. |
| 4 — Private data/API hardening | `367a0cd` | Supabase migration, private résumé references/streaming, support capabilities, cron fail-closed behavior, public DTO redaction, and rate-limit warning. |
| 5 — Operational stability | `c1b0cd9`, `439c80b`, `cf42695` | Conservative Prisma pooling, runtime-DDL removal, storage/admin cleanup, all 114 QNAP assets recovered, retired content cleanup. |
| 6 — Performance | `e82ec46` | Dead animation runtimes/effects removed, global fetch/hydration work reduced, assets optimized, and bundle surface reduced. |
| 7 — SEO/accessibility/mobile | `6c3b96e` | Strict canonical origin, structured data, no-index private areas, dynamic sitemap/RSS, mobile RTL navigation, landmarks, and homepage recovery. |
| 8 — Tests/tools | `e2ef5dc`, `5bcd2e2` | RAID/SHR and subnet domain extraction/tests, DTO/URL tests, complete E2E workflow, stable selectors/timeouts, and accessible admin login heading. |
| 9 — Final stabilization | pending final commit | Documentation/governance, workflow runtime updates, dead compatibility cleanup, final API/privacy audit, and repeated CI/Vercel verification. |

## Implemented phase details

### Phase 1 — baseline

- Fixed the RAID calculator/shared-button type mismatch.
- Established required lint, typecheck, unit, build, E2E, and optional integrity
  jobs.

### Phase 2 — shop and transactions

- Consolidated cart/checkout behavior and redirected the retired buying path.
- The server reloads products and calculates authoritative prices.
- Guest order access tokens are high entropy and stored only as SHA-256 hashes.
- Order PII and payment start require owner, admin permission, or capability.
- Zarinpal authority, callback state, amount, and idempotent verification are
  enforced.
- Migration `20260725000013_secure_shop_orders` and pricing/access regression
  tests were added.

### Phase 3 — identity and permissions

- Removed persistent browser identity and made `/api/auth/me` authoritative.
- Required a 32+ character `AUTH_SECRET`; password changes revoke older JWTs.
- Role/UserRole became the staff authorization authority; legacy module arrays
  no longer grant API access.
- Added privilege-delegation checks and canonical role seeding.
- Migration `20260725000014_rbac_authority` was corrected to populate required
  timestamps.

### Phase 4 — private data

- Replaced Vercel Blob usage with Supabase REST Storage.
- New résumés use opaque private-bucket references and a protected streaming
  endpoint; application lists do not expose URLs.
- Support tickets use authenticated ownership or a hashed guest capability.
- Scheduled publishing fails closed without cron/admin authorization.
- Public shop DTOs remove procurement and margin inputs; public timeline and
  comment output filters publication/moderation state.
- Migration `20260725000015_support_ticket_access` was applied.

### Phase 5 — operations and data recovery

- Set a safe default of one Prisma connection per serverless instance.
- Removed runtime DDL and improved structured operational logging.
- Renamed Blob-era admin UI/API to storage terminology, retaining only explicit
  redirect compatibility where external bookmarks may exist.
- Imported all 114 authorized QNAP product assets into
  `techbox/qnap/<official-model>.webp` with audit trace.
- Added idempotent cleanup for the approved retired review, media, download
  records, relations, redirects, and owned storage objects.

### Phase 6 — performance

- Removed direct Framer Motion, GSAP, Three.js, and unused effects/components.
- Consolidated active animation imports on `motion/react`.
- Eliminated duplicate homepage hydration requests and route-gated stats and
  timeline-like providers.
- Optimized the primary logo and removed unused oversized assets.

### Phase 7 — SEO and UX

- Centralized `siteUrl()` and made production reject missing/non-HTTPS/local
  canonical origins.
- Added route metadata, generated Open Graph images, product/tool/timeline
  structured data, and no-index layouts for private/utility routes.
- Made sitemap and RSS respect enabled modules.
- Added touch-friendly Persian RTL bottom navigation, skip navigation, focus
  handling, and reduced-motion support.

### Phase 8 — tests and tools

- Extracted RAID/SHR and IPv4/CIDR logic into unit-tested domain modules.
- Covered RAID 0/1/5/6/10, SHR, uneven drives, `/0`, `/31`, and `/32` cases.
- Added public product DTO redaction and server URL safety tests.
- Changed CI from smoke-only Playwright to the complete E2E suite.
- Stabilized multi-page E2E timing and replaced ambiguous selectors.

## Phase 9 checklist

- [x] Rewrite README and environment/deployment guidance.
- [x] Add operations, security/privacy, contribution, security-reporting, and
      proprietary license documents.
- [x] Upgrade JavaScript actions to Node 24-native releases, pin them to commit
      SHAs, use frozen installs/local executables, and restrict workflow token
      permissions.
- [x] Add Dependabot configuration for pnpm/npm and GitHub Actions.
- [x] Remove unused browser stores, in-memory content/recommendation fallbacks,
      stale layout/command scratch files, and retired sample downloads.
- [x] Reject legacy public résumé URLs; require the configured private bucket.
- [x] Re-audit follow, stats, views, chat, timeline, posts, auth, jobs, and
      search boundaries for server identity, published state, bounded input,
      rate limits, and generic public errors.
- [x] Fix timeline admin listing/edit method and private/public event handling.
- [ ] Push the final commit after rebasing over any user changes.
- [ ] Confirm Lint, Typecheck, Unit Tests, Build, complete E2E, optional
      DB/content/storage checks, and Vercel for the same final commit.
- [ ] Rotate every credential exposed during the stabilization work.

## Migration inventory

The repository contains 16 migration directories: `0_init` plus numbered
migrations through `20260725000015_support_ticket_access`. Phase 9 introduces
no schema migration.

Before release:

```bash
pnpm exec prisma migrate status
pnpm db:migrate:deploy
```

A migration may be marked applied with `prisma migrate resolve --applied` only
when its complete SQL effect is already present. Resolution records migration
state; it does not execute missing statements.

## External review disposition

| Concern | Disposition |
| --- | --- |
| Browser/localStorage auth desynchronization | Resolved with server session authority. |
| Development fallback signing secret | Removed; secret is mandatory in every environment. |
| Public résumé URLs | New storage is private; legacy URLs now receive 410 and require migration. |
| Missing distributed production limits | Upstash supported and missing production config emits a critical warning. |
| Duplicate/heavy animation stacks | Removed or consolidated. |
| Staging canonical fallback | Removed; strict production canonical origin required. |
| SEO/structured data/mobile navigation gaps | Audited and implemented in Phase 7. |
| RAID/subnet tools reported missing | Report was stale; existing tools were extracted, corrected, and tested. |
| Machine-specific avatar conversion request | Not a repository task; not run or committed. |
