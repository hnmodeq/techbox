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

## C Step 2 — richer source data variety
- [x] Expanded `data/users.json` with more realistic editors/moderators across modules.
- [x] Expanded `data/comments.json` with seeded threads across blog, media, review, shop, download, and forum content.
- [x] Expanded `data/forum.json` with more realistic active technical topics.
- [x] Expanded `data/shop.json` with more product variety for feeds/search.
- [x] Expanded `data/review.json` with more review variety.
- [x] Kept all content source-driven from JSON; no component hardcoding.
- [x] JSON validation passed for edited files.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] C Step 3 optional: taxonomy/category normalization and search/tag consistency audit.

## C Step 3 — taxonomy/category/tag consistency audit
- [x] Audited categories and tags across source JSON files.
- [x] Added missing author avatars for content authors/teams across news, media, download, forum, review, shop, and tools data.
- [x] Added safe paired Persian/English tag aliases for better cross-module search coverage.
- [x] Added optional `author_avatar` to seeded comments for future UI/CMS use without breaking current UI.
- [x] Kept categories intact where they are meaningful/module-specific; avoided risky mass category rewrites.
- [x] JSON validation passed for edited files.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] Next: D admin/CMS cleanup.

## D Step 1 — admin/CMS cleanup, dashboard/login consistency
- [x] Admin dashboard now uses real `allUsers` source data instead of a hardcoded user list.
- [x] Admin dashboard displays module access with `ModuleBadge` instead of comma-only text.
- [x] Admin login test users are easier to scan and show module badges.
- [x] Admin posts heading shows the current module with `ModuleBadge`.
- [x] Admin roles module selector uses `ModuleBadge` for module access labels.
- [x] Token-cleaned touched admin muted/foreground aliases.
- [x] Kept existing auth/localStorage/API fallback behavior unchanged.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] D Step 2: post editor UX cleanup and safer draft/local feedback.

## D Step 2 — post editor UX cleanup and safer draft/local feedback
- [x] Reworked `app/admin/posts/new/page.tsx` into a clearer CMS editor layout.
- [x] Added module badge and edit/create state badge in the editor header.
- [x] Added category field with module-specific category hints.
- [x] Added slug helper button and shared slug generation logic.
- [x] Improved API payload to send `category` when provided instead of always `undefined`.
- [x] Improved localStorage fallback draft payload with `savedAt`, `savedAtFa`, and `apiError`.
- [x] Added source preview panel showing route, category, tag count, excerpt length, and content length.
- [x] Added CMS guidance panel for editors.
- [x] Kept `/api/posts` endpoint and local fallback behavior compatible.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] D Step 3: admin posts list filters/table UX cleanup.

## D Step 3 — admin posts list filters/table UX cleanup
- [x] Reworked `app/admin/posts/page.tsx` with search and category filters.
- [x] Added source stats cards for filtered result count, views, likes, and unique tags.
- [x] Added local draft count/latest draft summary from `localStorage` per module.
- [x] Improved current module/status badges in the header.
- [x] Reworked table columns with category badges, stats, author/date, and responsive tag display.
- [x] Replaced plain view/edit links with `ButtonLink` actions.
- [x] Added clearer empty filtered-state with reset button.
- [x] Kept existing source JSON loading and module permission behavior unchanged.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] D Step 4: roles page UX cleanup and local role management safeguards.

## D Step 4 — roles page UX cleanup and local role safeguards
- [x] Reworked `app/admin/roles/page.tsx` with clearer RBAC layout and stats cards.
- [x] Added custom/protected role state and protected seed roles from deletion.
- [x] Added delete confirmation for custom roles and blocked deleting roles with active users.
- [x] Added reset-to-default roles action for localStorage recovery.
- [x] Added normalized role-name preview and duplicate role-name validation.
- [x] Added select-all/clear module access controls.
- [x] Improved module access selector and roles table with `ModuleBadge`/`Badge`.
- [x] Kept role behavior localStorage-based and API-ready without schema changes.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] D Step 5 optional: admin auth/login polish or dashboard final pass.

## D Step 5 — admin auth/login polish and dashboard final pass
- [x] Reworked admin login with quick-login buttons from `allUsers` source data.
- [x] Added selected-user preview with role/module badges on login.
- [x] Improved admin dashboard with source stats, module stats, and local draft summary.
- [x] Dashboard now shows manageable content count, source views, managed modules, and local drafts.
- [x] Dashboard module cards now show item count, views, latest date, and quick actions.
- [x] Super-admin user list remains source-driven and more responsive.
- [x] Preserved demo auth/localStorage behavior and did not change schema/API.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
- [ ] Optional next: final full audit/checklist or local apply instructions.

## React Bits effects + requested UX logic batch
- [x] Added `ogl` and `react-icons` dependencies to `package.json`.
- [x] Created reusable effects: `Aurora`, `GradientText`, `LogoLoop`, `BorderGlow`.
- [x] Added `lib/get-module-gradient.ts` helper returning exactly 3 gradient colors.
- [x] Added brand gradient CSS variables in `design/tokens/colors.css`.
- [x] Homepage hero now uses Aurora background and GradientText title.
- [x] Homepage now has a technology LogoLoop section above the footer.
- [x] Module listing headers now use subtle Aurora synced with module colors.
- [x] Home module feed cards are wrapped with BorderGlow synced to module colors.
- [x] Ticker background removed while preserving layout/spacing.
- [x] Shop search moved to top with a filter modal trigger; filter state still works.
- [x] Download main page no longer shows a direct receive/download button; it links to version selection/detail page.
- [x] Download detail/version page keeps OS/version-specific download buttons.
- [x] Admin sidebar item added for admin/super_admin users only.
- [x] Admin edit auth fallback fixed so local demo admins can edit without being forced back to login when server cookie is absent.
- [x] Magazine/blog image category/source tag removed from image.
- [x] Tag styling cleaned to neutral styling in touched high-impact tag areas.
- [x] Validation: `npx tsc --noEmit --pretty false` passes.
- [x] Validation: `npx eslint .` passes cleanly.
