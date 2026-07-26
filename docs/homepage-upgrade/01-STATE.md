# 01 — LIVE STATE LEDGER

> **This file is the single source of truth for "what is done" and "what is next".**
> Update it before you stop working, every time. An agent resuming after you reads this first.

**Last updated:** 2026-07-26
**Updated by:** Planning agent (pre-implementation)
**Current phase:** — (nothing started)
**Next action:** Phase A · Task A1

---

## Status at a glance

| Phase | Description | Status |
|---|---|---|
| **A** | Foundations: tokens, formatters, icons, primitives | ⬜ Not started |
| **B** | DB audit, migrations 1+3, floating sidebar | ⬜ Not started |
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
| A1 | Add `--hp-*` tokens (light + dark) | ⬜ | `design/globals.css` | |
| A2 | Add `faPrice()` + `<Num>` component | ⬜ | `lib/format-price.ts`, `components/ui/num.tsx` | Reuse existing `toFa`; do NOT duplicate date helpers |
| A3 | Author 5 tool SVG icons | ⬜ | `design/icons/tools/*` | incl. new `ups` icon |
| A4 | Shared primitives | ⬜ | `features/home/components/primitives/*` | SectionHeader, Eyebrow, Byline, InsetBand, ScrollRail, CardShell |
| A5 | Verify Kalameh available weights | ⬜ | — | If no true 900, fall back to 800 globally in spec |

### Phase B — Data & layout groundwork
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| B1 | **DB audit report** (read-only) | ⬜ | `scripts/checks/homepage-audit.ts` | 🚦 **GATE: owner must approve output** |
| B2 | Migration 1 — `Post.reviewedProductId` | ⬜ | `prisma/schema.prisma`, migration | Nullable |
| B3 | Migration 3 — `User.createdAt` | ⬜ | `prisma/schema.prisma`, migration | Backfill from earliest post |
| B4 | Review auto-match dry-run | ⬜ | `scripts/reviews/match-products.ts` | Report only, no writes |
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

*None yet.*

> Format when adding: `**[TASK-ID]** — what is blocked, why, what would unblock it, who owns it.`

---

## Open questions

*None yet.*

> Log here instead of guessing. Format: `**Q:** question · **Context:** why it matters · **Assumption made:** what you did in the meantime.`

---

## Decision changes since planning

*None yet.*

> If the owner changes a locked decision mid-build, record it here AND update `05-DECISIONS.md`.

---

## Session log

Append one entry per working session. Newest at top.

### 2026-07-26 — Planning agent
- Analysed Spiceworks + Tom's Guide source HTML/CSS; extracted real measured values.
- Read `hnmodeq/techbox` `main`: schema (37 models), `lib/home-server.ts`, `lib/module-config.ts`, `LayoutShell.tsx`, `design/globals.css`, `config/modules.config.ts`, `package.json`.
- Produced this document set. **No code written. No repo changes made.**
- Key discoveries recorded in `00-START-HERE.md` §3 (font is Kalameh; CSS at `design/globals.css`; dark mode already wired; `app/page.tsx` renders empty `<main>`; 4 tools not 6; formatting helpers already exist; `design/z-index.ts` exists).
- **Next agent starts at Task A1.**
