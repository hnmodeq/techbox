# TechBox stabilization plan

This plan is intentionally split into CI-gated phases. Every phase is committed and pushed independently. A phase is not considered complete until the GitHub Actions workflow for its commit is green.

## Working rules

- Do not rely on local production builds in the agent workspace; GitHub Actions is the source of truth.
- Keep each phase reviewable and avoid mixing unrelated feature work.
- Add regression tests with every security or correctness fix where practical.
- Preserve the active Persian RTL product experience.
- The shop is a real online shop. Remove catalog-only behavior instead of retaining parallel dormant paths.
- Never expose credentials in Git remotes, commits, fixtures, logs, or documentation.

## Phase 1 — Restore a green baseline

- Fix the current RAID calculator/shared-button type mismatch.
- Record the stabilization plan and disposition of the external review.
- Push and keep correcting this phase until CI is green.

## Phase 2 — Real-shop conversion and transaction security

- Remove catalog-only/disabled-payment UI and obsolete mock behavior.
- Make the server reload products and calculate authoritative prices; never trust browser-submitted prices.
- Bind order reads and payment initiation to the owning session or a secure guest-order capability.
- Protect order PII and admin mutations with explicit authorization.
- Enforce payment configuration and robust/idempotent payment state transitions.
- Add tests for repricing, ownership, and payment gating.

## Phase 3 — Authentication and authorization convergence

- Remove persistent user identity from localStorage and use `/api/auth/me` as the session authority.
- Remove the hard-coded development signing secret and require `AUTH_SECRET` in every environment.
- Configure CI with a non-production test secret.
- Make Role/UserRole permissions the single server-enforced staff authorization model.
- Allow staff to retrieve only their own effective permissions.
- Migrate protected admin and mutation APIs away from conflicting role/module checks.
- Add an authorization matrix test suite.

## Phase 4 — Private data and API hardening

- Store new job resumes privately and stream them only through an authorized resume endpoint.
- Stop exposing direct resume URLs from application-list APIs.
- Protect support-ticket conversations with authenticated ownership or a high-entropy ticket access token.
- Require cron secret or admin authorization for scheduled publication in all configurations.
- Remove internal source-price, adjustment, and margin fields from public content DTOs.
- Ensure public timeline/comment endpoints expose approved records only.
- Emit a production-critical warning when distributed Upstash rate limiting is not configured.

## Phase 5 — Correctness and operational stability

- Fix notification construction for users without authored posts.
- Reconcile documented and actual Prisma/Neon connection limits.
- Move runtime table creation into migrations and remove application-time DDL.
- Replace inappropriate silent failures with structured logging/Sentry while retaining intentional public fallbacks.
- Align cache documentation and invalidation behavior.
- Remove committed local Playwright reports, test results, and upload scratch files.

## Phase 6 — Performance and bundle optimization

- Consolidate animation imports on one Motion package entry point and remove the redundant direct dependency.
- Split Three.js and GSAP effects into client-only lazy chunks at their actual call sites.
- Avoid loading global providers/data on routes that do not need them where this can be done without UX regressions.
- Review oversized client components and extract stable domain logic.

## Phase 7 — SEO, accessibility, and mobile RTL UX

- Require a canonical production origin instead of silently using a staging-domain fallback.
- Audit public metadata and JSON-LD, including article, tools, shop, WebSite, and product pages.
- Ensure valid Open Graph/Twitter images and canonical paths.
- Add a touch-friendly Persian RTL mobile bottom navigation for Home, News, Tools, Shop, and Account.
- Preserve keyboard navigation, focus visibility, reduced-motion behavior, and content landmarks.

## Phase 8 — Tools and test hardening

- Keep and improve the existing RAID and subnet calculators; do not create duplicates.
- Extract RAID/SHR and subnet calculations into testable domain modules.
- Add table-driven tests for RAID 0/1/5/6/10, SHR, uneven drives, subnet ranges, masks, and edge prefixes.
- Run the complete Playwright suite in CI, not only `smoke.spec.ts`.
- Add critical API tests for auth, permissions, orders, payments, comments, and public DTO redaction.
- Make environment-specific DB integrity checks visible and actionable.

## Phase 9 — Final stabilization

- Remove obsolete compatibility paths and dead code left by the static-to-database and catalog-to-shop migrations.
- Review the complete API authorization and privacy matrix.
- Update README, environment documentation, architecture notes, and operational runbooks.
- Confirm repeated green GitHub Actions runs and provide a final change/risk report.

## External review disposition

| External concern | Initial assessment | Planned handling |
|---|---|---|
| Auth localStorage desynchronization | Valid; server verification exists but persistent UI state can remain stale | Phase 3; use existing `/api/auth/me` rather than introducing a duplicate `/api/account/me` |
| Development fallback auth secret | Valid hardening request | Phase 3, with CI/dev environment configuration |
| Public resume Blob URLs | Valid privacy concern | Phase 4 |
| Missing distributed production rate limiting | Valid operational concern | Phase 4 |
| Both `framer-motion` and `motion` | Valid cleanup opportunity; actual bundling impact will be verified through import graph | Phase 6 |
| Synchronous Three.js/GSAP | Valid where effects are reachable from initial routes | Phase 6 |
| Staging fallback canonical URL | Valid | Phase 7 |
| Metadata/JSON-LD missing everywhere | Partially stale: substantial SEO infrastructure already exists, but route coverage needs an audit | Phase 7 |
| Mobile bottom navigation | New product request, not a bug | Phase 7 |
| RAID and subnet tools are missing | False/stale: both already exist | Phase 8 will test and improve the existing tools instead of duplicating them |
| Local Sharp avatar-conversion command | Not a repository task and contains machine-specific/personal data | Will not be run or committed |
