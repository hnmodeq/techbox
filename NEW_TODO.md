# New TechBox TODO

## 1 — Ticker reliability
- [x] Rewrite ticker so it is visible immediately.
- [x] Remove flicker/disappearing behavior.
- [x] Keep continuous slow rightward scroll.
- [x] Use latest news + magazine/blog data from the same content sources.
- [x] Keep every ticker item clickable to its real route.

## 2 — Notification popover
- [x] Fix desktop clipping/overflow issue.
- [x] Make notification popover render outside sidebar bounds with React portal.
- [x] Keep mobile positioning safe.
- [x] Keep z-index centralized.

## 3 — Centralized UI/look
- [ ] Add/extend shared primitive classes for CTA/icon buttons where safe.
- [ ] Sync VIP button and Chatbot button styling through design primitives/tokens.
- [ ] Avoid risky mass rewrites where components need special layout.

## 4 — Remove hardcoded visual styles
- [ ] Add missing design tokens for borders/drop shadows if needed.
- [ ] Replace obvious hardcoded shadows/drop-shadows/borders/durations with tokens.
- [ ] Keep Tailwind layout utilities, but centralize visual decisions.

## 5 — Sidebar tools cleanup
- [x] Remove generic Tools nav item from sidebar.
- [x] Keep RAID Calculator and Subnet Calculator.

## 6 — Sidebar hover icon colors
- [x] Ensure sidebar item icon uses active/module color on hover.
- [x] Preserve active color behavior.

## 7 — Sidebar tooltip colors
- [x] Tooltip text color should match the item icon/module color.
- [x] Tooltip color should be centralized from moduleColors.

## 8 — Sidebar open/close stability
- [x] Prevent icons/items from moving vertically when sidebar opens/closes.
- [x] Keep icon rail positions stable in both states.
- [x] Reduce layout shifts in header/search/VIP/date areas with fixed-height header rows.

## 9 — More seed data
- [x] Add more news items.
- [x] Add more blog/magazine items.
- [x] Ensure feeds/scroll areas are visibly testable.

## 10 — Home shop latest feed
- [x] Verify home product feed only uses shop data.
- [x] Fix incorrect product visibility by adding better shop seed data and keeping product variant on shop feed.
- [x] Add/adjust shop items for better testing.

## Validation
- [x] Run typecheck.
- [x] Run lint if dependency version allows. ESLint passes with warnings only.
- [ ] Rebuild patch archive.
