# Next TechBox TODO

## 1 — Healthy ticker
- [x] Remove unattractive ticker border.
- [x] Make ticker visible immediately on first paint.
- [x] Keep tags but make them lighter/tokenized.
- [ ] Browser visual QA.

## 2 — Home shop feed
- [x] Show 4–6 products from shop source.
- [x] Make product feed cards compact instead of one oversized card.
- [ ] Browser visual QA.

## 3 — Home reviews feed
- [x] Show 3–4 latest reviews.
- [x] Make review feed cards compact/list-like.
- [ ] Browser visual QA.

## 4 — Home bento grid gaps
- [x] Remove fixed auto row / row-span layout causing empty spaces.
- [x] Let bento cards size naturally by content.
- [ ] Browser visual QA.

## 5 — More news data
- [x] Add more news items to `data/news.json`.

## 6 — More forum topics
- [x] Add forum topics to `data/forum.json` only.

## 7 — Buttons / UI components
- [x] Replace local button markup with `components/ui/Button` where safe in high-impact forms/overlays.
- [x] Keep `.btn` CSS fallback for links and legacy HTML where needed; tokenized `.btn` fallback.

## 8 — Replace `<img>` with `next/image`
- [x] Replaced images inside home feed/content feed components.
- [x] Replace remaining active `<img>` usages.
- [x] Confirm lint no longer reports `@next/next/no-img-element`.

## 9 — Remove hardcoded design/UI
- [x] Continue removing obvious hardcoded shadows/borders/blur/durations/colors in z-index, ticker, module metadata, buttons.

## 10 — Remove unused duplicates
- [x] Remove unused duplicate `features/shop/hooks/useCart.tsx` if no imports.

## 11 — Visual QA
- [ ] Run local browser checks for ticker, notification, sidebar, bento, shop/review feeds, cart/chat overlays.

## 12 — Secrets
- [x] No key rotation needed now per user; production keys will be changed later.
## Button/design cleanup pass 2
- [x] Added `ButtonLink` and shared `buttonClassName` to `components/ui/Button.tsx`.
- [x] Migrated remaining normal action buttons/forms to `Button` where safe.
- [x] Migrated button-like internal links to `ButtonLink` where safe.
- [x] Left specialized icon/rail/chip/media-card buttons as primitives because their layout behavior is intentionally custom.
- [x] Tokenized additional hardcoded visual styles in cards, overlays, borders, shadows, durations, radius, and module/action states.
## UI primitives pass A2
- [x] Created `CloseButton`.
- [x] Created `ChipButton`.
- [x] Created `IconRailButton`.
- [x] Created `Overlay` / `OverlayBackdrop`.
- [x] Created `Panel`.
- [x] Created `ModuleBadge`.
- [x] Exported new primitives from `components/ui/index.ts`.
- [x] Replaced several close/icon/chip/module-badge usages with the new primitives.

## B Step 1 — deeper design hardcode audit, safe cleanup
- [x] Scanned remaining hardcoded style candidates in `app`, `components`, `features`, `providers`, and `config`.
- [x] Centralized admin role module/status badges with `ModuleBadge`.
- [x] Tokenized admin role table header/rows and removed old `style={{ color/background: var(--muted...) }}` aliases.
- [x] Centralized download tag/version badges with `Badge variant="download"`.
- [x] Reused `OverlayBackdrop` in cart drawer and shared `Modal`.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] B Step 2: continue controlled cleanup in media/chat/forum/admin forms without risky mass rewrites.

## B Step 2 — deeper design hardcode audit, controlled cleanup
- [x] Removed more old inline `var(--muted-foreground)`, `var(--border)`, and `var(--brand)` style usages from admin/new-post, checkout, work-with-us, comments, avatar, media video, and subnet page.
- [x] Replaced more legacy `className="badge"` usage with shared `Badge` variants.
- [x] Tokenized remaining safe `text-brand`, `bg-card`, `bg-muted/*`, and `hover:bg-muted/*` aliases in focused files.
- [x] Reused `OverlayBackdrop` in forum new-topic modal.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] B Step 3: optional next pass for specialized controls/primitives: chatbot FAB, media selector card, sidebar nav/search/theme buttons.

## B Step 3 / A Step 3 — specialized primitive cleanup
- [x] Created `FloatingActionButton` primitive for shared floating actions.
- [x] Migrated chatbot FAB to `FloatingActionButton`.
- [x] Created `MediaSelectorCard` primitive for media/video selector cards.
- [x] Migrated media gallery selector buttons to `MediaSelectorCard`.
- [x] Reused shared `Overlay` for mobile sidebar backdrop.
- [x] Reused `OverlayBackdrop` and `Panel` in sidebar login modal.
- [x] Token-cleaned a few remaining chatbot/sidebar/media selector aliases touched by this pass.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] Next: decide whether to continue B Step 4 or move to C content/data realism.

## B Step 4 — conservative sidebar/control cleanup
- [x] Created `ThemeToggleButton` primitive.
- [x] Migrated sidebar theme row to `ThemeToggleButton`.
- [x] Migrated sidebar logo toggle, expanded search submit, and login row to shared `Button` where safe.
- [x] Removed sidebar nav/account inline active-background/font-size styles and replaced them with token classes.
- [x] Tokenized sidebar config aliases (`linkInactive`, `sidebarBase`, theme class aliases).
- [x] Tokenized `config/module-colors.ts` base foreground color classes.
- [x] Removed hardcoded mobile FAB `drop-shadow-lg`; kept draggable mobile FAB raw button intentionally for pointer-capture safety.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] Next after B: move to C content/data realism, then D admin/CMS cleanup.

## C Step 1 — content/data realism, source JSON expansion
- [x] Added 5 realistic blog/source articles to `data/blog.json`.
- [x] Added 6 realistic media/video items to `data/media.json`.
- [x] Added 8 realistic download-center items to `data/download.json`.
- [x] Added 3 realistic job posts to `data/jobs.json`.
- [x] Kept all content source-driven from JSON; no component hardcoding.
- [x] JSON validation passed for edited files.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] C Step 2: optional next content pass for users/comments/categories/search variety.
