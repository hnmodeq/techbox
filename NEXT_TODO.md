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
