# TechBox — Stability / Polish / Professionalism To-Do

Goal: professional, stable, catchy site (Vercel/GitHub/Neon level). No hard-codes, no fake data, everything dynamic & alive, latest deps. The 3 GitHub "deployment checks" = **Lint → Typecheck → Build** (`.github/workflows/ci.yml` job `quality-build-smoke`). Push to `main` with clear commit messages. Build/verify at phase checkpoints.

- [x] 1. Wire real auth state — `AuthProvider` fetches `/api/auth/me`, typed context, drives avatar & guarded actions (kill dead `value={null}`).
- [x] 2. Fix duplicate provider composition — single source of truth; one `Chatbot` + one `AuthModal`.
- [ ] 3. Add Playwright smoke test asserting zero console errors on `/`, `/blog`, `/forum/[slug]`.
- [ ] 4. Ensure Prisma Client generates before build (tighten `ci.yml`; honest build gate).
- [x] 5. Critical CSS — remove the no-op self-referential rule; inject *real* above-the-fold styles or delete the file.
- [x] 6. `HomeDataProvider` pattern — server HTML is initial state, client only enhances (uniform across all rows; no null→content jump).
- [x] 7. Service worker — stop caching navigations/`/`; cache only static assets (or remove SW; keep PWA via manifest).
- [x] 8. Theme flash QA — verify inline script + `next-themes` config produce no FOUC on slow devices.
- [ ] 9. Fonts — optimize Kalameh (subset to Persian glyphs / limit preloaded weights) for RTL first-paint speed.
- [x] 10. Images — remove `priority` from the 48px mobile FAB logo (LCP waste).
- [ ] 11. Bundle — consolidate `gsap`/`framer-motion`/`motion` (keep one); `next/dynamic` lazy-load heavy effects (ChromaGrid, Dock, ...).
- [ ] 12. Single source of truth for modules — `config/modules.config.ts` is canonical; `lib/content.ts` imports from it (kill 3-way duplication).
- [ ] 13. Deprecate empty `lib/content.ts` static arrays — remove static mock layer / mark `@deprecated`, grep usages.
- [x] 14. Type `AuthProvider`; unify permission helper (`canEdit` vs `canEditModule`) into one.
- [ ] 15. Real `README.md` — setup, env vars, architecture, "how to add a module".
- [x] 16. Delete `docker-compose.yml.bak`.
- [x] 17. Remove duplicate `data`/`data:legacy` & `tree`/`tree:legacy` scripts.
- [ ] 18. `about`/`contact` — make `contact` form actually submit (real endpoint → email/DB); keep `about` dynamic.
- [x] 19. Remove duplicate `AuthProvider`/second `Chatbot` instance (folds into #2).

## Phases / checkpoints (build + lint + typecheck verified at each ★)
- Phase 0: env + baseline (install, baseline lint/typecheck/build).
- Phase 1 ★: #16, #17 (safe deletions) → #5, #10 (quick perf) → #7 (SW).
- Phase 2 ★: #2, #19, #14, #1 (auth/providers) → #6 (home data) → #8 (theme).
- Phase 3 ★: #12, #13 (module consolidation) → #11 (bundle) → #9 (fonts).
- Phase 4 ★: #3 (smoke test) → #15 (README) → #18 (contact) → #4 (CI tightening).
