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
