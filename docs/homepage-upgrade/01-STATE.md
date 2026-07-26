# 01 — LIVE STATE LEDGER

> **This file is the single source of truth for "what is done" and "what is next".**
> Update it before you stop working, every time. An agent resuming after you reads this first.

**Last updated:** 2026-07-26
**Updated by:** Implementation agent
**Current phase:** A ✅ complete · B partially done (B1–B4 ✅)
**Next action:** B5 (floating sidebar PR) → then Phase C (first sections)

---

## Status at a glance

| Phase | Description | Status |
|---|---|---|
| **A** | Foundations: tokens, formatters, icons, primitives | ✅ Done |
| **B** | DB audit, migrations 1+3, floating sidebar | 🔄 In progress (B1–B4 ✅, B5–B7 pending) |
| **C** | Sections 1, 2, 3, 6, 9 (first visible pixels) | ⬜ Not started |
| **D** | Sections 4, 7, 8 (+ build UPS calculator) | ⬜ Not started |
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
| B5 | **Floating sidebar** | ⬜ | `LayoutShell.tsx`, `techbox-app-sidebar.tsx` | 🚦 **GATE: separate PR, owner review** |
| B6 | 8-route regression pass @1280/1440 | ⬜ | — | After B5 |
| B7 | Extend `lib/home-server.ts` data layer | ⬜ | `lib/home-server.ts` | Bump cache key to `home-data-v6`, revalidate 3600 |

### Phase C — First sections
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| C1 | §1 Magazine (SW Articles) | ⬜ | `features/home/components/sections/MagazineSection.tsx` | |
| C2 | §2 Video Hub (TG Quick takes) | ⬜ | `.../VideoSection.tsx` | |
| C3 | §3 Insights + Newsletter | ⬜ | `.../InsightsSection.tsx` | Engagement-ranked |
| C4 | §6 Timeline | ⬜ | `.../TimelineSection.tsx` | |
| C5 | §9 Community (SW) | ⬜ | `.../CommunitySection.tsx` | |
| C6 | Wire `app/page.tsx` | ⬜ | `app/page.tsx` | Respect module config order/visibility |

### Phase D — Finder, Tools, Deals
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| D1 | §4 Global Finder | ⬜ | `.../FinderSection.tsx` | `@supports` guard on gradient text |
| D2 | Build UPS calculator tool | ⬜ | `app/tools/ups-calculator/`, `features/tools/...` | New route + logic + unit tests |
| D3 | Register UPS in `toolRoutes` | ⬜ | `config/modules.config.ts`, `design/icons.tsx` | Add `ups` icon + `--ups` colour |
| D4 | §8 Tools (SW 5-up) | ⬜ | `.../ToolsSection.tsx` | |
| D5 | §7 Deals (TG) | ⬜ | `.../DealsSection.tsx` | Server-side pricing only |

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
