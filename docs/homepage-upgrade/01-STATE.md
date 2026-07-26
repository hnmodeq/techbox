# 01 — LIVE STATE LEDGER

> **This file is the single source of truth for "what is done" and "what is next".**
> Update it before you stop working, every time. An agent resuming after you reads this first.

**Last updated:** 2026-07-26
**Updated by:** Implementation agent
**Current phase:** A ✅ · B ✅ (B6 deferred) · C ✅ · D ✅
**Next action:** Phase E — review enforcement (admin picker, API guard, triage) → §5 Top Picks

---

## Status at a glance

| Phase | Description | Status |
|---|---|---|
| **A** | Foundations: tokens, formatters, icons, primitives | ✅ Done |
| **B** | DB audit, migrations 1+3, floating sidebar | ✅ Done (B6 deferred to CI — no browser in sandbox) |
| **C** | Sections 1, 2, 3, 6, 9 (first visible pixels) | ✅ Done |
| **D** | Sections 4, 7, 8 (+ build UPS calculator) | ✅ Done |
| **E** | Review enforcement + Section 5 | ⬜ Not started |
| **F** | Sections 10, 11, 12 | ⬜ Not started |
| **G** | Sections 0, 13, cleanup, E2E, Lighthouse | ⬜ Not started |

**Legend:** ⬜ not started · 🔄 in progress · ⏸️ blocked (see Blockers) · ✅ done · ❌ failed/reverted

---

## Task ledger

Full task definitions with acceptance criteria are in `04-PHASES.md`. This table tracks state only.

### Phase A — Foundations
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| A1 | Add `--hp-*` tokens (light + dark) | ✅ | `design/globals.css` (+222 lines, appended) | Also added `.hp-eyebrow`, `.hp-gradient-text` (@supports-guarded), `.hp-rail`, `.hp-live-dot`, `.hp-numeric`, dark image knock-down |
| A2 | Add `faPrice()` + `<Num>` | ✅ | `lib/format-price.ts`, `components/ui/num.tsx` | Reuses existing `toFa`. 29 unit tests. Also `faDiscountedPrice`, `faCountdown`, `faRating`, `isDiscountLive` |
| A3 | Author 5 tool SVG icons | ✅ | `design/icons/tools.tsx` | raid/nas/nvr/subnet/**ups**. Visually verified in both themes |
| A4 | Shared primitives | ✅ | `features/home/components/primitives/*` | SectionHeader, Eyebrow, Byline, InsetBand+SectionShell, ScrollRail, CardShell+CardMedia |
| A5 | Verify Kalameh available weights | ✅ | — | **All 9 weights ship incl. true 900** (`lib/fonts.ts`). No synthesis risk; spec's 800 stands |

### Phase B — Data & layout groundwork
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| B1 | **DB audit report** (read-only) | ✅ | `scripts/checks/homepage-audit.ts` | Gate passed — owner approved 2026-07-26 |
| B2 | Migration 1 — `Post.reviewedProductId` | ✅ | `prisma/schema.prisma`, `20260726000016_*` | Applied to prod. Nullable + FK SetNull |
| B3 | Migration 3 — `User.createdAt` | ✅ | same migration | Backfilled from earliest post |
| B4 | Review auto-match | ✅ | `scripts/content/homepage-content-pass.ts` | Superseded by content pass — 3 linked at score 100 |
| B4b | **Content pass** (owner-authorised) | ✅ | `scripts/content/homepage-content-pass.ts` | Reviews/bios/discounts/comments/timeline made real |
| B5 | **Floating sidebar** | ✅ | `components/ui/sidebar.tsx`, `techbox-app-sidebar.tsx`, `LayoutShell.tsx` | Additive `overlay` prop — admin sidebar untouched (defaults false) |
| B6 | 8-route regression pass @1280/1440 | ⏸️ | — | **Cannot run locally** — Playwright needs libnspr4.so, unavailable in sandbox. Must run in CI or by owner |
| B7 | Extend data layer | ✅ | `lib/home-sections.ts` (new), `lib/home-server.ts`, `features/home/lib/home-types.ts` (new), `home-data.tsx` | Cache `home-data-v6`, revalidate 3600. All 6 slices verified against live DB |

### Phase C — First sections
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| C1 | §1 Magazine (SW Articles) | ✅ | `.../sections/MagazineSection.tsx` | 578×325 lead + 4× 143×95 rows. Holds the single eager LCP image |
| C2 | §2 Video Hub (TG Quick takes) | ✅ | `.../VideoSection.tsx` | 9:16 rail, duration pill hidden when null. Links to existing HLS route |
| C3 | §3 Insights + Newsletter | ✅ | `.../InsightsSection.tsx`, `.../NewsletterCard.tsx` | Engagement-ranked; newsletter posts to existing API and echoes its Persian message |
| C4 | §6 Timeline | ✅ | `.../TimelineSection.tsx` | Dark full-bleed zigzag rail, RTL oldest-first |
| C5 | §9 Community (SW) | ✅ | `.../CommunitySection.tsx` | Best-answer showcase, falls back to most-discussed when nothing solved |
| C6 | Wire `app/page.tsx` | ✅ | `app/page.tsx` | Honours enabled/showOnHome/homeOrder + title & label overrides |

### Phase D — Finder, Tools, Deals
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| D1 | §4 Global Finder | ✅ | `.../FinderSection.tsx` | TG measured CSS verified in output. Server Component — plain GET form, no JS |
| D2 | Build UPS calculator | ✅ | `lib/ups.ts`, `features/tools/components/ups-calculator/`, `app/tools/ups-calculator/` | **24 unit tests** |
| D3 | Register UPS | ✅ | `config/modules.config.ts`, `config/module-colors.ts` | `ups` icon already added in A3 |
| D4 | §8 Tools (SW 5-up) | ✅ | `.../ToolsSection.tsx` | Maps `toolRoutes` — 5 tiles, no hardcoded list |
| D5 | §7 Deals (TG) | ✅ | `.../DealsSection.tsx`, `.../CountdownBadge.tsx`, `getDeals` | Prices via currency pipeline; red only when discount is live |

### Phase E — Reviews
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| E1 | Admin product-picker on review editor | ⬜ | `app/admin/posts/...` | Required field, server-guarded |
| E2 | API guard: reject review w/o product | ⬜ | review create/update routes | 422 |
| E3 | Triage screen | ⬜ | `app/admin/reviews/link-products/` | |
| E4 | Run backfill (migration 2) | ⬜ | `scripts/reviews/...` | After owner approves buckets |
| E5 | Migration 4 — enable review module | ⬜ | `SiteSetting` data | |
| E6 | §5 Our Top Picks | ⬜ | `.../TopPicksSection.tsx` | |
| E7 | Migration 5 — `NOT NULL` | ⬜ | migration | 🚦 **GATE: only when triage is 100%** |

### Phase F — Community & about
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| F1 | §10 Family Comments | ⬜ | `.../FamilyCommentsSection.tsx` | Needs `User.createdAt` (B3) |
| F2 | §11 More to Explore | ⬜ | `.../MoreToExploreSection.tsx` | Hourly-seeded random |
| F3 | §12 About + Authors | ⬜ | `.../AuthorsSection.tsx` | |

### Phase G — Finish
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| G1 | §0 Announcement bar | ⬜ | `.../AnnouncementBar.tsx` | Default disabled |
| G2 | Admin announcement screen | ⬜ | `app/admin/appearance/announcement/` | |
| G3 | §13 Footer | ⬜ | `components/layout/Footer.tsx` | |
| G4 | Delete dead row components | ⬜ | `features/home/components/*` | See list in `00-START-HERE.md` §3.5 |
| G5 | E2E: RTL + dark + empty-state | ⬜ | `tests/e2e/homepage.spec.ts` | |
| G6 | Lighthouse + CLS pass | ⬜ | — | |

---

## Blockers

*None.*

> Format when adding: `**[TASK-ID]** — what is blocked, why, what would unblock it, who owns it.`

---

## Open questions

**Q: `bio` for 10 authors was written by the agent, not the people.** They are accurate to each user's `roleFa` and posting history, but the owner may want to edit them for voice. Not blocking.

**Q: Forum has only 3 topics, 2 solved.** §9 renders at exactly its minimum. One more solved topic would make the section comfortable rather than borderline.

**Q: `media` has exactly 6 videos.** §2 renders fine, but the rail is short — a 10-video rail would look closer to Tom's Guide's "Quick takes".

> Log here instead of guessing. Format: `**Q:** question · **Context:** why it matters · **Assumption made:** what you did in the meantime.`

---

## Decision changes since planning

*None yet.*

> If the owner changes a locked decision mid-build, record it here AND update `05-DECISIONS.md`.

---

## Session log

Append one entry per working session. Newest at top.

### 2026-07-26 (session 6) — Implementation agent · PHASE D COMPLETE
- **D2 UPS calculator.** `lib/ups.ts` is pure and unit-tested (24 tests), mirroring `lib/raid.ts`. Models design headroom (80% ceiling), power factor, growth margin, N+1, battery blocks, runtime, BTU/hr and annual kWh. Every result carries the assumptions it was derived under — a sizing tool that hides its model invites over-trust. Results link into the real catalogue by VA range.
- **D3** registered in `toolRoutes` + `module-colors`. Note: `ModuleColorApplier` is a no-op site-wide, so `--raid`/`--nas`/`--ups` are all undefined by design; no CSS needed.
- **D1 Finder** is a Server Component — a plain GET form to the existing `/search` needs no JS. Verified TG's measured values survive into the output: radius 25px, pills at 200px with 2px white border, 40px submit, both decorative disks, gradient heading.
- **D4 Tools** maps `toolRoutes`, so the new UPS tile appeared automatically. 5-up grid, no card chrome until hover (Spiceworks has none).
- **D5 Deals** added `getDeals()`, which resolves every price through `calculateFinalPriceForPost` — all 106 shop rows store a USD source price, so reading `priceAmount` directly would show a stale figure. `CountdownBadge` is a tiny client island that renders nothing before hydration, avoiding a guaranteed timestamp mismatch.
- **Bug caught while verifying:** Postgres orders NULLs FIRST on `DESC`, so a naive `discountPercent: "desc"` ranks the 97 non-discounted rows above the 9 real deals. `getDeals` is safe because `gt: 0` excludes nulls, and the backfill query sorts by date only — now documented in the code so nobody "simplifies" the filter away.
- Markup audit on live data: 3 aria-labelledby ✓ · 0 physical CSS props ✓ · 0 right-arrows ✓ · 8 images / 8 aspect-ratio reservations ✓ · 0 eager (LCP stays with the Magazine lead) ✓ · 5 tool tiles ✓ · empty state renders **0 bytes** ✓.
- `tsc --noEmit` ✅ · `lint` ✅ · `test` ✅ **111 passing** (was 87).

### 2026-07-26 (session 5) — Implementation agent · PHASE C COMPLETE
- Built the first five sections + wired `app/page.tsx`, which had been rendering an empty `<main>`.
- **Verification approach:** Playwright cannot launch in this sandbox and `pnpm build` times out, so I rendered the sections to static HTML with `renderToStaticMarkup` against **live DB rows** and audited the markup programmatically. That is what caught the defects below.
- **Audit results:** heading order h2→h3 with no skips ✓ · all 5 `aria-labelledby` targets resolve ✓ · 14 images, **14 aspect-ratio reservations** (CLS) ✓ · 0 missing alt ✓ · 0 right-arrows ✓ · 17 `--hp-*` tokens in use ✓.
- **Empty-state proof: passing `[]` to all five sections renders exactly 0 bytes.** Rule 1 verified mechanically, not by eye.
- **Three defects found and fixed by the audit:**
  1. Two images were `loading="eager"` — the Insights hero was competing with the Magazine lead for LCP priority. Now exactly one eager image on the page.
  2. Video play button used `left-1/2` (physical property). Switched to `inset-0 m-auto`.
  3. The `✓` solved badge sat inside the `<h3>` with no separator, so screen readers read "حل شدهبرای شبکه…". Split into an `aria-hidden` glyph plus an `sr-only` label.
- `app/page.tsx` keeps full admin control: `enabled`, `showOnHome`, `homeOrder`, and the per-module title/more-label overrides all still apply. Added the required `sr-only` `<h1>`.
- `tsc --noEmit` ✅ · `lint` ✅ · `test` ✅ 87 passing. No build run (times out — owner instruction).

### 2026-07-26 (session 4) — Implementation agent · B5 + B7
- **B5 floating sidebar.** Added an **additive `overlay` prop** to the shared `Sidebar` primitive (defaults `false`), so the admin sidebar — the only other consumer — is untouched. When on: `sidebar-gap` collapses to `w-0`, panel goes `z-50`, dismiss scrim `z-40` (matching `design/z-index.ts`), click-scrim and Escape both close. Escape is bound only while open+overlaying so it doesn't swallow Escape for modals. Sidebar now starts **closed on `/` only**.
- **B7 data layer.** New `lib/home-sections.ts` with all six section queries + `seededIndex()`. New `features/home/lib/home-types.ts`. `HomeData` extended and the client merge in `home-data.tsx` updated to preserve the new slices. Cache key → `home-data-v6`, revalidate 24h → 1h. All new blocks are **sequential and individually try/caught** — one failing section hides itself, it can't take down the page.
- **Verified every slice against the live DB.** insights 2 (0 overlap with sidebar ✓), topPicks 3 (all موجود, real prices), timeline 20, familyComments 3 (3 unique authors), moreToExplore hero+4, authors 10 (10 with bios).
- **Two bugs caught by running it**, not by typecheck:
  1. `toFa()` applies Intl thousands grouping, so "عضو از ۱۴۰۵" rendered as **"۱٬۴۰۵"**. Added a `faYear()` helper that maps digits without grouping.
  2. Timeline `take: 12` truncated the 20-event history **at 1999**, silently dropping AWS, Docker, Kubernetes and everything modern. Raised to 24.
- ⚠️ **Harness limit discovered:** `unstable_cache` throws `Invariant: incrementalCache missing` outside a Next request context, so `getHomeData()` cannot be called from a plain `tsx` script. Exported `getHomeDataUncached` for test harnesses; verification scripts call the section functions directly.
- `tsc --noEmit` ✅ · `lint` ✅ · `test` ✅ 87 passing. **`pnpm build` deliberately not run — it times out in this sandbox (owner instruction).**

### 2026-07-26 (session 3) — Implementation agent · PHASE A COMPLETE
- **A1 tokens**: appended a 222-line `--hp-*` block to `design/globals.css`. Nothing existing renamed. Full `:root` + `.dark` pairs, `@theme inline` mappings so `bg-hp-surface` / `text-hp-ink` / `rounded-hp-md` compile.
- **A2 formatters**: created `lib/format-price.ts`. Confirmed `toFa` already emits Persian digits AND U+066C separators, so no digit mapping was reimplemented. Long-form prices only (D9). Added `faDiscountedPrice`, `faPercent`, `faCount`, `faRating`, `faCountdown`, `isDiscountLive`. `<Num latin>` guards model numbers with `lang="en"`. **29 unit tests, all passing.**
- **A3 icons**: `design/icons/tools.tsx` — 5 flat duotone SVGs, mid-tone fills only so one asset works in both themes. **Rendered to PNG and visually inspected**; fixed two defects found that way: NVR arcs read as a smiley face (redrawn as a wall-mount camera with signal waves) and Subnet leaf nodes overlapped (respaced to 3 clean columns). Registered `ups: BatteryCharging` in `design/icons.tsx` and exported from `design/index.ts`.
- **A4 primitives**: 6 components. Only `ScrollRail` is `"use client"`. It handles the RTL `scrollLeft`-is-negative quirk via `scrollBy` with a sign flip, and uses TG's exact 56px `#1B1B1BD9` arrow chip.
- **A5**: Kalameh ships **all 9 weights including a true 900** — no synthesis risk, spec unchanged.
- `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅ **87 tests passing**.

### 2026-07-26 (session 2) — Implementation agent
- Environment: pnpm 10.12.1, deps installed, Prisma client generated, prod DB connected.
- **B1 audit** built + run. Found: 0/12 reviews linkable (all `brand`/`model`/`sku` null; catalogue is 106 QNAP NAS, reviews were generic topics); Family Comments starved (145/148 comments < 80 chars); only 5 discounts, 3 on out-of-stock items; all bios null; timeline was world history, not IT.
- Owner confirmed all of it was placeholder scaffolding, authorised rewriting in DB.
- **B2 + B3 migration** `20260726000016_homepage_review_product_link` applied to production: `Post.reviewedProductId` (nullable, FK SetNull, indexed) + `User.createdAt` (backfilled from earliest post — users now date 2026-07-09 onward).
- **Content pass** applied:
  - 3 reviews rewritten as genuine QNAP product reviews (TS-1264U-RP, TBS-h574TX, TS-1655), linked via `reviewedProductId`, with real specs pulled from the product rows. Full Persian editorial bodies (~2.5k chars each).
  - 9 topic reviews converted to `module:"blog"` as buying guides, with `SlugRedirect` rows preserving old URLs.
  - 10 author bios written.
  - Discounts: cleared 4 on out-of-stock items, applied 8 real ones (10–20%) to in-stock products, 21-day window (ends 2026-08-16).
  - 16 comments rewritten as substantive Persian discussion, **each text used exactly once** (no duplicated testimonials).
  - Timeline replaced with **20 IT/computing milestones** (1837 Babbage → 2024 AI datacenter pressure), including transistor, RAMAC, ARPANET, Ethernet, TCP/IP, RAID paper, Linux/WWW, VMware, AWS, Docker, Kubernetes, WannaCry.
- **Post-pass audit: all 8 measurable sections ✅ OK.** Reviews now auto-match at score 100.
- `pnpm typecheck` clean.
- **Next: Phase A (tokens/formatters/icons/primitives), then B5 floating sidebar.**

### 2026-07-26 (session 1) — Planning agent
- Analysed Spiceworks + Tom's Guide source HTML/CSS; extracted real measured values.
- Read `hnmodeq/techbox` `main`: schema (37 models), `lib/home-server.ts`, `lib/module-config.ts`, `LayoutShell.tsx`, `design/globals.css`, `config/modules.config.ts`, `package.json`.
- Produced this document set. **No code written. No repo changes made.**
- Key discoveries recorded in `00-START-HERE.md` §3 (font is Kalameh; CSS at `design/globals.css`; dark mode already wired; `app/page.tsx` renders empty `<main>`; 4 tools not 6; formatting helpers already exist; `design/z-index.ts` exists).
- **Next agent starts at Task A1.**
