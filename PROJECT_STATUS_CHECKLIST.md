# TechBox status checklist

## Already done

### Project intake / safety
- [x] Extracted uploaded `codes.txt` into a working project tree.
- [x] Confirmed the pasted Markdown-link artifacts like `[team.map](http://team.map)` were not present in the extracted real code.
- [x] Added `.env.example` instead of storing real secrets.
- [x] Did not include `.env.local` or the exposed Vercel token in the patch archive.

### Build / typecheck
- [x] Your real local `pnpm build` passes with Next.js 16.2.9 / Turbopack.
- [x] Your real local `pnpm typecheck` passes.
- [x] Workspace `tsc --noEmit --pretty false` passes.

### Ticker
- [x] Made the news ticker scroll slowly to the right.
- [x] Added pause-on-hover.
- [x] Added reduced-motion support.
- [x] Centralized ticker animation in `design/foundation/globals.css`.

### Sidebar date/time
- [x] Moved Tehran date/time from sidebar bottom to sidebar header.
- [x] Kept collapsed sidebar clock tooltip behavior.
- [x] Removed old unused date/time rail logic.

### Sidebar colors / modules
- [x] Added centralized design tokens for RAID Calculator.
- [x] Added centralized design tokens for Subnet Calculator.
- [x] Added centralized design token for VIP consultation.
- [x] Updated `moduleColors` to use CSS variables instead of hardcoded Tailwind colors.
- [x] Updated sidebar config to consume centralized module colors.

### VIP consultation
- [x] Removed duplicate VIP item below Subnet Calculator.
- [x] Kept one prominent VIP CTA.
- [x] Moved VIP CTA visual style into design primitives using tokens.

### Z-index
- [x] Added `design/tokens/z-index.ts`.
- [x] Exported z-index tokens from `design/index.ts`.
- [x] Updated notifications, cart drawer, modals, tooltips, chatbot, mobile FAB, and forum modal to use centralized z-index tokens.
- [x] Raised notification/cart overlays so they appear above the desktop content/sidebar layers.

### Design-token sync
- [x] Added semantic color tokens: success, danger, warning, info.
- [x] Replaced hardcoded module palette classes in active code with `var(--tb-...)` tokens.
- [x] Replaced remaining hardcoded Tailwind palette/hex colors in active app/components/features/config/providers code.
- [x] Kept token compatibility aliases like `--background`, `--foreground`, `--muted`, etc. for older components.

### Cart
- [x] Cart drawer now uses centralized z-index.
- [x] Cart drawer now uses tokenized blur/shadow/card colors.
- [x] Checkout button now links to `/shop/checkout` instead of being a dead button.

### Next/ESLint compatibility
- [x] Added `eslint.config.mjs` for Next 16 / ESLint flat config.
- [x] Changed lint script to `eslint .`.
- [x] Fixed API route variable name `module` -> `postModule` for Next lint compatibility.
- [x] Fixed checkout redirect lint issue using `window.location.assign(...)`.
- [x] Replaced internal `<a href="/blog/...">` with Next `<Link>` in RAID page.
- [x] Identified your lint failure as an ESLint 10 / eslint-plugin-react compatibility issue.
- [x] Updated package recommendation to pin ESLint 9 via `devDependencies` and `pnpm.overrides`.

### Patch archive
- [x] Created downloadable `techbox-updated-code.tar.gz`.
- [x] Added `UPDATED_FILES.md` with apply instructions.
- [x] Rebuilt archive after config/lint fixes.

## Left / recommended next tasks

### Must do locally
- [ ] Apply latest `techbox-updated-code.tar.gz` to your real project.
- [ ] Run `pnpm install`.
- [ ] Confirm ESLint version with `pnpm exec eslint --version`.
- [ ] If it still shows ESLint 10, run `pnpm up eslint@^9.39.1` or clean reinstall.
- [ ] Run `pnpm lint` again.

### Visual QA
- [ ] Check home ticker direction/speed in browser.
- [ ] Check sidebar expanded/collapsed on desktop.
- [ ] Check sidebar mobile drawer and draggable logo FAB.
- [ ] Check notification popover z-index on desktop.
- [ ] Check cart drawer z-index and checkout link.
- [ ] Check VIP CTA appearance in light/dark mode.
- [ ] Check RAID/Subnet icon colors in active/inactive sidebar states.

### Optional quality improvements
- [ ] Gradually migrate repeated `<img>` usages to `next/image` where dimensions are known.
- [ ] Consider merging duplicate cart provider implementation in `features/shop/hooks/useCart.tsx` and `providers/cart.provider.tsx` if the duplicate file is truly unused.
- [ ] Replace more old inline `style={{ color: "var(...)" }}` with utility classes where safe.
- [ ] Add smoke tests for sidebar/cart/ticker if you want long-term stability.
- [ ] Rotate/revoke the pasted Vercel OIDC token from `.env.local` if there is any chance it is still active.

## Current known status
- Build: passing in your real project.
- Typecheck: passing in your real project.
- Lint: blocked only by ESLint 10 compatibility until ESLint is pinned/downgraded to ESLint 9.
