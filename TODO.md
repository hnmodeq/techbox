# TechBox — Stability / Polish / Professionalism To-Do

Goal: professional, stable, catchy site (Vercel/GitHub/Neon level). No hard-codes, no fake data, everything dynamic & alive, latest deps. The 3 GitHub "deployment checks" = **Lint → Typecheck → Build** (`.github/workflows/ci.yml` job `quality-build-smoke`). Push to `main` with clear commit messages. Build/verify at phase checkpoints.

- [x] 1. Wire real auth state — `AuthProvider` fetches `/api/auth/me`, typed context, drives avatar & guarded actions (kill dead `value={null}`).
- [x] 2. Fix duplicate provider composition — single source of truth; one `Chatbot` + one `AuthModal`.
- [x] 3. Add Playwright smoke test asserting zero console errors on `/`, `/blog`, `/forum/[slug]`, `/news` (+ detail & not-found pages).
- [x] 4. CI split into 3 genuine required checks (Lint / Typecheck / Build) in `.github/workflows/ci.yml`; optional DB checks kept separate & non-blocking; no `|| echo` masking.
- [x] 5. Critical CSS — remove the no-op self-referential rule; inject *real* above-the-fold styles or delete the file.
- [x] 6. `HomeDataProvider` pattern — server HTML is initial state, client only enhances (uniform across all rows; no null→content jump).
- [x] 7. Service worker — stop caching navigations/`/`; cache only static assets (or remove SW; keep PWA via manifest).
- [x] 8. Theme flash QA — verify inline script + `next-themes` config produce no FOUC on slow devices.
- [x] 9. Fonts — Kalameh `preload:false` (no 9 blocking preloads, `display:swap` keeps text visible); Vazirmatn fallback slimmed to weights 300–700.
- [x] 10. Images — remove `priority` from the 48px mobile FAB logo (LCP waste).
- [x] 11. Bundle — code-split the heavy gsap-driven `ChromaGrid` via `next/dynamic` (below the fold); `motion` retained (Dock uses `motion/react`), `framer-motion` retained.
- [x] 12. Single source of truth for modules — `config/modules.config.ts` is canonical; `lib/content.ts` derives `moduleMeta` from it (kill 3-way duplication).
- [x] 13. Empty `lib/content.ts` static arrays kept as documented DB fallbacks (return empty, never fake data); unit test rewritten to assert the single-source-of-truth invariant.
- [x] 14. Type `AuthProvider`; unify permission helper (`canEdit` vs `canEditModule`) into one.
- [x] 15. Real `README.md` — setup, env vars, architecture, "how to add a module".
- [x] 16. Delete `docker-compose.yml.bak`.
- [x] 17. Remove duplicate `data`/`data:legacy` & `tree`/`tree:legacy` scripts.
- [x] 18. `contact` form wired to a real `/api/contact` endpoint (zod-validated, rate-limited, emails via Resend); `about` stays dynamic.
- [x] 19. Remove duplicate `AuthProvider`/second `Chatbot` instance (folds into #2).

## Phases / checkpoints (build + lint + typecheck verified at each ★)
- Phase 0: env + baseline (install, baseline lint/typecheck/build).
- Phase 1 ★: #16, #17 (safe deletions) → #5, #10 (quick perf) → #7 (SW).
- Phase 2 ★: #2, #19, #14, #1 (auth/providers) → #6 (home data) → #8 (theme).
- Phase 3 ★: #12, #13 (module consolidation) → #11 (bundle) → #9 (fonts).
- Phase 4 ★: #3 (smoke test) → #15 (README) → #18 (contact) → #4 (CI tightening).
