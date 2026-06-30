# TechBox refactor TODO

## Step 0 — Project access / baseline
- [x] Get the real project files into the workspace from uploaded codes.txt.
- [ ] Run install/build/typecheck to capture current errors.
- [x] Fix pasted/markdown artifacts only if they exist in real files. Real uploaded code did not include the markdown-link artifacts in active code.

## Step 1 — News ticker scrolling
- [x] Make ticker animate slowly toward the right in RTL.
- [x] Centralize ticker animation in design/foundation/globals.css using token-based durations/easing where CSS variables exist.
- [ ] Verify home page ticker works smoothly and does not overflow incorrectly.

## Step 2 — Sidebar date/time relocation
- [x] Move date/time from sidebar bottom to sidebar header.
- [x] Keep collapsed sidebar tooltip behavior.
- [x] Remove duplicate/unused iconRail date/time code.

## Step 3 — Sidebar calculator colors
- [x] Add centralized color tokens for RAID Calculator and Subnet Calculator.
- [x] Update module color config to expose those colors like other module colors.
- [x] Update sidebar config to consume the centralized colors.

## Step 4 — VIP consultation cleanup
- [x] Remove duplicate VIP item below Subnet Calculator.
- [x] Keep only the prominent VIP consultation CTA.
- [x] Refactor VIP CTA styles to use design tokens / shared primitive class.

## Step 5 — Z-index centralization
- [x] Add centralized z-index tokens.
- [x] Replace magic z-index values for notifications, cart drawer, chatbot, modals, mobile sidebar, tooltips where active.
- [x] Raise notification and cart overlays so they render above desktop sidebar/content correctly.

## Step 6 — Centralized UI components
- [x] Identify repeated primitive UI usage: buttons, inputs, cards, badges, modals, tooltip, etc.
- [x] Replace safe cases with components/ui primitives/tokens and avoid risky broad rewrites.
- [x] Avoid over-refactoring layout-specific elements if it would reduce clarity.

## Step 7 — Design-token sync
- [x] Search for hard-coded colors, shadows, radii, durations, blur, z-index.
- [x] Move reusable values into design tokens/config.
- [x] Replace scattered inline styles with tokens/classes where safe.
- [x] Second pass: removed remaining Tailwind palette colors / hex colors from active app/components/features/config code.

## Step 8 — Validation
- [x] Run typecheck. `npx tsc --noEmit --pretty false` passes in reconstructed workspace.
- [ ] Run full production build. Attempted, but uploaded codes.txt does not include real binary public fonts/assets and original package config; local reconstructed build cannot be considered authoritative.
- [ ] Fix errors.
- [ ] Provide summary of files changed and remaining recommendations.

---

## Final A/B/C/D completion summary
- [x] A — UI primitives: ButtonLink, CloseButton, ChipButton, IconRailButton, Overlay, Panel, ModuleBadge, FloatingActionButton, MediaSelectorCard, ThemeToggleButton.
- [x] B — Design cleanup: tokens, z-index, overlays, sidebar/ticker/feed/button cleanup, old focused hardcode scan clean.
- [x] C — Source data realism: expanded blog/news/media/download/forum/review/shop/jobs/users/comments and normalized avatars/tags.
- [x] D — Admin/CMS cleanup: dashboard, login, posts list, post editor, roles page improved while preserving local/API behavior.
- [x] Final validation: typecheck and lint pass in reconstructed workspace.
- [ ] Final local browser QA with real assets remains required.
