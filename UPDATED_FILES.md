# Updated files for TechBox

Copy these files into your real project. Do **not** replace your `public/` folder from this workspace; your real binary fonts/images were not included in the text upload.

## Latest batch fixes
- Rewritten ticker to avoid initial invisibility/flicker/disappearing.
- Notification popover now renders through a portal to avoid sidebar overflow clipping.
- Generic Tools item removed from sidebar; RAID/Subnet remain.
- Sidebar hover icon colors now use each item module color.
- Sidebar tooltip color now matches module/icon color.
- Sidebar header rows have stable heights to reduce open/close vertical shifting.
- Added more news, blog, and shop data.
- Home shop feed remains sourced from shop data and has better latest products to display.

## Config / project files
- package.json
- tsconfig.json
- pnpm-workspace.yaml
- next.config.mjs
- next-env.d.ts
- postcss.config.mjs
- eslint.config.mjs
- .env.example
- .gitignore

## Data
- data/news.json
- data/blog.json
- data/shop.json

## App/API fixes
- app/api/comments/route.ts
- app/api/posts/route.ts
- app/shop/checkout/page.tsx
- app/tools/raid-calculator/page.tsx
- app/account/page.tsx
- app/admin/login/page.tsx
- app/admin/posts/new/page.tsx
- app/admin/posts/page.tsx
- app/admin/roles/page.tsx

## Design tokens / styles
- design/index.ts
- design/tokens/colors.css
- design/tokens/z-index.ts
- design/foundation/globals.css
- design/foundation/primitives.css

## Sidebar / layout / UI
- types/sidebar.types.ts
- components/layout/SidebarContent.tsx
- components/layout/SidebarShell.tsx
- components/layout/SidebarTooltip.tsx
- components/ui/Dropdown.tsx
- components/ui/Modal.tsx
- components/ui/Tooltip.tsx
- components/ui/Input.tsx
- components/ui/LikeButton.tsx

## Features/providers
- providers/cart.provider.tsx
- features/chat/components/Chatbot.tsx
- features/forum/components/ForumList.tsx
- features/blog/components/BlogGrid.tsx
- features/news/components/NewsList.tsx
- features/news/components/NewsTicker.tsx
- features/comment/components/CommentSection.tsx
- features/content/components/ContentCard.tsx
- features/download/components/DownloadDetail.tsx
- features/download/components/DownloadTable.tsx
- features/review/components/ReviewGrid.tsx
- features/shop/components/ShopGrid.tsx
- features/shop/hooks/useCart.tsx
- features/tools/components/RaidCalculator.tsx
- features/tools/components/SubnetCalculator.tsx
- features/tools/components/ToolsGrid.tsx

## Config modules
- config/module-colors.ts
- config/sidebar.config.ts

## Validation done in reconstructed workspace
- `npx tsc --noEmit --pretty false` passes.
- `npx eslint .` exits successfully with warnings only. Warnings are mostly planned `<img>` to `next/image` migration items.

## Notes
- `.env.local` was intentionally **not** created because it contains a sensitive Vercel token.
- If local lint uses ESLint 10, pin ESLint 9 with `pnpm up eslint@^9.39.1`.

## Prisma/Windows install safety update
- Changed `package.json` `postinstall` to a non-blocking Prisma generate command so Windows file locks do not block frontend `pnpm install`, `pnpm build`, `pnpm typecheck`, or `pnpm lint`.
- Added `pnpm prisma:generate` as the explicit manual Prisma Client generation command.

## Design centralization batch — tasks 3 and 4
- Extended `design/tokens/colors.css` with primary aliases and reusable overlay/scrim tokens.
- Extended `design/foundation/primitives.css` with shared CTA, VIP CTA, floating action, overlay panel/backdrop, soft panel, image badge, and action chip primitives.
- Updated `components/ui/Button.tsx` to use tokenized danger styling and added a `vip` variant.
- Updated `features/chat/components/Chatbot.tsx` so the floating chatbot button and chat panel use shared design primitives instead of hardcoded gradients/shadows.
- Validation: `npx tsc --noEmit --pretty false` passes and `npx eslint .` exits successfully with warnings only.

## Home feed / ticker / image cleanup batch
- Fixed ticker first-paint visibility by starting animation at `translate3d(0,0,0)` and removed the heavy border.
- Updated home bento layout to natural-height cards to remove large empty row gaps.
- Shop home feed now requests 6 products and uses compact grid product cards.
- Review home feed now requests 4 reviews and uses compact list/grid cards.
- Added more source data to `data/news.json`, `data/forum.json`, `data/review.json`, and `data/shop.json`.
- Replaced active `<img>` usages with `next/image`; lint no longer reports `@next/next/no-img-element`.
- Removed unused duplicate `features/shop/hooks/useCart.tsx`; use `providers/cart.provider.tsx` only.
- Validation: `npx tsc --noEmit --pretty false` passes and `npx eslint .` exits cleanly with no warnings/errors in reconstructed workspace.

## Z-index / module-color / button cleanup batch
- Expanded `design/tokens/z-index.ts` with clearer layers for sidebar backdrop, dropdown, notification, modal, chatbot, tooltip, toast, and emergency overlays.
- Updated `components/layout/SidebarTooltip.tsx` to render through a React portal into `document.body`, with tokenized high tooltip z-index, so feed sections cannot cover sidebar tooltips.
- Switched mobile sidebar/backdrop and notification/dropdown overlays to z-index tokens instead of hardcoded z classes.
- Fixed home news feed clipping by removing the `max-h-[260px]` scroll cap from the home `ContentFeedList` news variant.
- Synced `lib/content.ts` module metadata colors to `config/module-colors.ts` instead of raw Tailwind palette classes.
- Updated ticker item/tag colors to use `moduleColors.news` and `moduleColors.blog` so ticker module colors stay centralized.
- Tokenized `.btn` CSS fallback and expanded `Badge` module variants to all module color tokens.
- Replaced several high-impact local `<button className="btn ...">` usages with `components/ui/Button` in account/admin/checkout/forum/chat/cart paths.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## Button/design cleanup pass 2
- Added `ButtonLink` and `buttonClassName` helper to `components/ui/Button.tsx` so button-like links and real buttons share the same variants/sizes.
- Migrated more forms/actions to `Button`: consultation/contact/work-with-us, admin posts/roles filters/actions, comment submit/reply, tools tabs, shop add-to-cart, download actions, LikeButton/CommentVote, chatbot/cart close/actions.
- Migrated button-like links to `ButtonLink`: admin links, about/contact links, media/detail links, cart checkout, shop detail, download links, account/admin login links.
- Kept specialized controls as custom primitives where appropriate: sidebar rail icons, sidebar links, chips, switch/tabs internals, chatbot FAB, media card buttons.
- Continued hardcoded design cleanup: tokenized additional borders, shadows, radius, blur/backdrop, durations, overlay backgrounds, and module-color states.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## UI primitives pass A2
- Added dedicated primitives: `CloseButton`, `ChipButton`, `IconRailButton`, `Overlay`, `OverlayBackdrop`, `Panel`, and `ModuleBadge`.
- Exported the new primitives from `components/ui/index.ts`.
- Updated `components/ui/IconButton.tsx` so it respects passed size and shares Button styles.
- Migrated sidebar notification/cart/search icon buttons to `IconRailButton` where safe.
- Migrated chatbot quick prompt chips and forum filter chips to `ChipButton`.
- Migrated chatbot/cart/forum/sidebar close buttons to `CloseButton`.
- Migrated forum solved/open status badges to `ModuleBadge`.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## B Step 1 — deeper design hardcode audit, safe cleanup
- Audited remaining style hardcode candidates and intentionally avoided risky mass rewrites.
- Updated `app/admin/roles/page.tsx` to use `ModuleBadge` for role/module/status badges and tokenized table surfaces.
- Updated `app/admin/posts/page.tsx` to use module badges for allowed-module summary and tokenized table/link hover colors.
- Updated `features/download/components/DownloadTable.tsx` and `features/download/components/DownloadDetail.tsx` to use centralized `Badge variant="download"` for download tags/version OS badges.
- Updated `providers/cart.provider.tsx` and `components/ui/Modal.tsx` to reuse `OverlayBackdrop` instead of local overlay markup.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## B Step 2 — deeper design hardcode audit, controlled cleanup
- Updated `app/admin/posts/new/page.tsx` to remove old muted/brand inline styles and display allowed modules with `ModuleBadge`.
- Updated `app/shop/checkout/page.tsx` to replace old muted/border inline styles with `--tb-*` token classes.
- Updated `app/workwithus/page.tsx` and `app/workwithus/[slug]/page.tsx` to use centralized `Badge` variants and tokenized brand/shadow styles.
- Updated `features/comment/components/CommentSection.tsx` to use tokenized borders/text and `Badge variant="secondary"` for the Server Actions/Prisma label.
- Updated `features/content/components/BentoCard.tsx` and `features/content/components/ContentDetail.tsx` to use shared `Badge` instead of legacy `.badge` markup where safe.
- Updated `features/forum/components/ForumList.tsx` to token-clean table/list aliases and reuse `OverlayBackdrop` for the new-topic modal.
- Updated small UI/media/tool pieces: `components/ui/Avatar.tsx`, `components/ui/Dropdown.tsx`, `components/ui/SearchBar.tsx`, `components/ui/LikeButton.tsx`, `features/media/components/VideoPlayer.tsx`, and `app/tools/subnet-calculator/page.tsx`.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## B Step 3 / A Step 3 — specialized primitive cleanup
- Added `components/ui/FloatingActionButton.tsx` for shared floating action controls.
- Added `components/ui/MediaSelectorCard.tsx` for reusable media/video selector cards.
- Exported the new primitives from `components/ui/index.ts`.
- Updated `features/chat/components/Chatbot.tsx` to use `FloatingActionButton` and tokenized remaining touched text/background aliases.
- Updated `features/media/components/MediaGallery.tsx` to use `MediaSelectorCard` instead of local raw card buttons.
- Updated `components/layout/SidebarShell.tsx` to use shared `Overlay` for the mobile sidebar backdrop.
- Updated `components/layout/SidebarContent.tsx` to use shared `OverlayBackdrop`/`Panel` for the login modal and token-cleaned sidebar search/theme touched aliases.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## B Step 4 — conservative sidebar/control cleanup
- Added `components/ui/ThemeToggleButton.tsx` and exported it from `components/ui/index.ts`.
- Updated `components/layout/SidebarContent.tsx` to use `ThemeToggleButton` for the theme row.
- Updated sidebar logo toggle, expanded search submit, and login row to use shared `Button` where safe without changing sidebar dimensions.
- Removed sidebar nav/account inline active-background/font-size styles in favor of tokenized class names.
- Updated `config/sidebar.config.ts` to replace remaining old foreground/muted aliases with `--tb-*` token classes.
- Updated `config/module-colors.ts` base colors to use `text-[var(--tb-foreground)]`.
- Updated `components/layout/SidebarShell.tsx` to remove hardcoded `drop-shadow-lg` from the draggable mobile FAB while keeping drag/pointer behavior untouched.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## C Step 1 — content/data realism, source JSON expansion
- Expanded `data/blog.json` from 11 to 16 realistic infrastructure/security/network articles.
- Expanded `data/media.json` from 3 to 9 realistic video/podcast/demo items.
- Expanded `data/download.json` from 2 to 10 realistic download-center files across OS, firmware, drivers, monitoring, and utilities.
- Expanded `data/jobs.json` from 4 to 7 realistic team openings.
- Kept entries compatible with existing `ContentItem` shape and existing UI feeds.
- Validation: edited JSON files parse successfully.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## C Step 2 — richer source data variety
- Expanded `data/users.json` from 6 to 10 users/editors with module coverage.
- Expanded `data/comments.json` from 3 to 15 seeded comments/replies across multiple modules.
- Expanded `data/forum.json` from 6 to 10 realistic technical topics.
- Expanded `data/shop.json` from 7 to 10 products for better shop/home feed variety.
- Expanded `data/review.json` from 5 to 8 reviews for better review feed/grid variety.
- Kept data compatible with existing source loaders and UI components.
- Validation: edited JSON files parse successfully.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## C Step 3 — taxonomy/category/tag consistency audit
- Audited taxonomy across `data/blog.json`, `data/news.json`, `data/media.json`, `data/download.json`, `data/forum.json`, `data/review.json`, `data/shop.json`, and `data/tools.json`.
- Added missing `author.avatar` values to content authors/teams so cards/details can render avatars consistently.
- Added paired Persian/English tag aliases such as `network/شبکه`, `security/امنیت`, `storage/ذخیره‌سازی`, `backup/بکاپ`, `virtualization/مجازی‌سازی`, and similar safe aliases for better search/tag coverage.
- Added optional `author_avatar` to `data/comments.json` entries for future comment UI/CMS use; current UI remains compatible.
- Preserved existing categories where useful and module-specific.
- Validation: edited JSON files parse successfully.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## D Step 1 — admin/CMS cleanup, dashboard/login consistency
- Updated `app/admin/page.tsx` so the super-admin user list is rendered from `allUsers` source data instead of hardcoded names.
- Updated `app/admin/page.tsx` to display current user module access and managed users with `ModuleBadge`.
- Updated `app/admin/login/page.tsx` so test users show module badges and are easier to scan.
- Updated `app/admin/posts/page.tsx` to show the current module as a `ModuleBadge` in the page heading.
- Updated `app/admin/roles/page.tsx` so module selector labels use `ModuleBadge`.
- Token-cleaned touched admin text aliases while preserving current localStorage/auth/API fallback behavior.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## D Step 2 — post editor UX cleanup and safer draft/local feedback
- Reworked `app/admin/posts/new/page.tsx` into a two-column CMS editor with a source preview sidebar.
- Added module/edit-state badges, category input with module-specific hints, and a slug generation helper.
- Improved save payload handling so `category` is included when provided.
- Improved local draft fallback stored in `localStorage` with timestamp, Persian timestamp, and API error message.
- Added preview details for route, category, tag count, excerpt length, and content length.
- Added a CMS guidance panel for editors while preserving the existing `/api/posts` and local fallback behavior.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## D Step 3 — admin posts list filters/table UX cleanup
- Reworked `app/admin/posts/page.tsx` with query search and category filtering for the selected module.
- Added module source summary badges and local draft count/latest draft detection from `localStorage`.
- Added stat cards for filtered result count, total views, total likes, and unique tag count.
- Improved the posts table with category badges, responsive tag badges, author/date details, and clearer stats.
- Replaced plain view/edit action links with shared `ButtonLink` actions.
- Added a clearer empty filtered-state with reset filters action.
- Preserved existing JSON source loading, permissions, and admin routing behavior.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## D Step 4 — roles page UX cleanup and local role safeguards
- Reworked `app/admin/roles/page.tsx` with RBAC stats cards, safer local role creation, and clearer module access UI.
- Added protected seed role handling so default roles cannot be deleted.
- Added safeguards for custom role deletion, including confirmation and blocking deletion when users are assigned.
- Added reset-to-default roles action for localStorage recovery.
- Added normalized role-name preview and duplicate role-name validation.
- Added select-all/clear module access helper actions.
- Improved roles table with default/custom status badges and module badges.
- Preserved localStorage role behavior and API/Prisma readiness without schema changes.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## D Step 5 — admin auth/login polish and dashboard final pass
- Updated `app/admin/login/page.tsx` with quick-login buttons generated from `allUsers`, selected-user preview, and clearer role/module badges.
- Updated `app/admin/page.tsx` with source-driven dashboard stats: manageable modules, manageable content count, source views, and local draft count.
- Added local draft summary cards by module on the dashboard when browser drafts exist.
- Improved admin module cards with item count, views, latest source date, and quick management/create actions.
- Kept the super-admin user list source-driven and made it more responsive.
- Preserved demo auth/localStorage behavior and avoided schema/API changes.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.

## Final audit/checklist pass
- Ran final `npx tsc --noEmit --pretty false` and `npx eslint .`; both pass cleanly.
- Confirmed active `<img>` scan is clean.
- Confirmed focused old hardcode alias scan is clean for tracked high-risk categories.
- Confirmed remaining raw buttons are internal UI/behavior primitives or the intentionally preserved draggable mobile sidebar FAB.
- Confirmed all data JSON files parse and summarized current data counts.
- Updated final status/checklist docs.

## React Bits effects + requested UX logic batch
- Added dependencies in `package.json`: `ogl`, `react-icons`.
- Added `components/effects/Aurora.tsx` using OGL/WebGL as a client-safe, pointer-events-none reusable background effect.
- Added `components/effects/GradientText.tsx` for reusable animated gradient text powered by existing Framer Motion.
- Added `components/effects/LogoLoop.tsx` for accessible, reduced-motion-aware logo loops supporting React icons and image logos.
- Added `components/effects/BorderGlow.tsx` for subtle pointer-edge glow effects.
- Added `components/effects/ModuleHeader.tsx` for module headers with Aurora backgrounds synced to module colors.
- Added `lib/get-module-gradient.ts` to derive exactly 3 gradient colors from module color tokens/classes.
- Added brand gradient CSS variables to `design/tokens/colors.css` and LogoLoop animation CSS to `design/foundation/globals.css`.
- Updated `features/home/components/HeroSection.tsx` to use Aurora behind the hero and GradientText for the site title.
- Added `features/home/components/TechLogoLoopSection.tsx` and rendered it on `app/page.tsx` above the footer.
- Updated module listing components to use Aurora module headers: blog, news, media, shop, download, forum, review, tools.
- Updated `features/home/components/HomeModulesSection.tsx` to wrap module feed cards with `BorderGlow` using module gradients.
- Updated `features/news/components/NewsTicker.tsx` to remove ticker background and neutralize ticker tag styling.
- Updated `features/shop/components/ShopGrid.tsx` so search/filter controls are at the top and filters open in a modal.
- Updated `features/download/components/DownloadTable.tsx` so the main download page navigates to version selection instead of showing a direct receive/download button.
- Kept OS/version-specific download buttons in `features/download/components/DownloadDetail.tsx`.
- Updated `components/layout/SidebarContent.tsx` with an admin/super-admin-only sidebar item linking to `/admin`.
- Updated `app/admin/posts/new/page.tsx` so local demo admin users can edit even when the server cookie session is absent, while keeping API/server checks intact.
- Removed the magazine/blog category tag displayed on the image while keeping metadata elsewhere.
- Neutralized tag styles in touched high-impact tag areas so tags do not use colored backgrounds.
- Validation: `npx tsc --noEmit --pretty false` and `npx eslint .` pass cleanly.
