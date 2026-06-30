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
