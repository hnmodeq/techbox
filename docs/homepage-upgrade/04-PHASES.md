# 04 — PHASES & TASKS

> Task-level execution plan. Each task has **acceptance criteria** — do not mark a task done in `01-STATE.md` until every box is provably true.
> 🚦 = owner gate. **Stop and ask. Do not proceed on assumption.**

---

## Dependency graph

```
A (foundations) ──┬─→ C (sections 1,2,3,6,9) ──┐
                  │                             │
B (data+layout) ──┼─→ D (sections 4,7,8)  ──────┼─→ G (0,13,cleanup,tests)
                  │                             │
                  ├─→ E (reviews → section 5) ──┤
                  └─→ F (sections 10,11,12) ────┘
```
**A and B can run in parallel.** C needs both. D needs A. E needs B. F needs B.

---

## PHASE A — Foundations

*No dependencies. Start here.*

### A1 · Design tokens
**File:** `design/globals.css`

Append the `--hp-*` block from `02-DESIGN-SPEC.md` §1 — `:root` values, `.dark` overrides, and the `@theme inline` mappings.

- [ ] All `--hp-*` tokens defined in `:root`
- [ ] Every token has a `.dark` override
- [ ] `@theme inline` maps them so `bg-hp-surface`, `text-hp-ink`, `rounded-hp-md` compile
- [ ] **No existing variable renamed, removed, or changed**
- [ ] `pnpm build` succeeds
- [ ] Toggling theme changes the values (verify in DevTools on any page)

> Append at the end of the file. Do not edit the existing `:root`/`.dark` blocks.

---

### A2 · Price formatter + `<Num>`
**Files:** `lib/format-price.ts` (new), `components/ui/num.tsx` (new)

⚠️ **Do not create `lib/format-fa.ts`.** `toFa`, `formatRelativeDate`, `formatRelativeTime`, `getJalaliDateStringPersian`, `formatPostDateFa` all already exist. Only price formatting is missing.

- [ ] `faPrice(toman)` → `"۱۲٬۴۰۰٬۰۰۰ تومان"` (long form always, D9)
- [ ] `faCount(n, unit)` → `"۲۴ نظر"`
- [ ] Both delegate to existing `toFa` from `lib/date-format.ts`
- [ ] `<Num latin>` renders Latin digits + `lang="en"` for models/RAID/specs
- [ ] `<Num>` default renders Persian digits
- [ ] Unit tests in `tests/unit/format-price.test.ts` covering: zero, negative, very large, decimal rounding
- [ ] `pnpm test` passes

---

### A3 · Tool icons
**Files:** `design/icons/tools/*.tsx`, register in `design/icons.tsx`

5 flat duotone SVGs, 72×72, per the table in `02-DESIGN-SPEC.md` §8.

- [ ] `raid`, `nas`, `nvr`, `subnet`, `ups` authored as inline React SVG components
- [ ] **Mid-tone fills only** — no pure white, no near-black — so one asset works in both themes
- [ ] No `currentColor` (they are intentionally polychrome)
- [ ] Flat fills, no strokes, no gradients (matches Spiceworks illustration weight)
- [ ] `ups` added to the `icons` map and `IconName` union in `design/icons.tsx`
- [ ] Render correctly at 72px and 48px

---

### A4 · Shared primitives
**Dir:** `features/home/components/primitives/`

| Component | Responsibility |
|---|---|
| `SectionHeader` | h2 + optional desc + optional "see all ←" link, RTL-correct |
| `Eyebrow` | category kicker, weight 800 + 1.5px spacing (Persian-safe) |
| `Byline` | avatar + name + role + date, two sizes |
| `InsetBand` | full-width tinted panel, `--hp-inset`, radius 24px |
| `ScrollRail` | horizontal snap scroller + 56px TG arrows, RTL-aware |
| `CardShell` | surface + border + radius + hover elevation |

- [ ] All are **Server Components** except `ScrollRail` (needs scroll state)
- [ ] Logical CSS properties only — no `pl-`/`pr-`/`left-`/`right-`
- [ ] Correct in both themes
- [ ] `ScrollRail` arrows: 56×56, `#1B1B1BD9`, `1px` `--hp-brand` border, `aria-label`, hidden < 900px, RTL scroll direction correct
- [ ] `prefers-reduced-motion` respected

---

### A5 · Verify Kalameh weights
- [ ] Check which weights `--font-kalameh` actually ships
- [ ] If no true **900**, change every `900` in `02-DESIGN-SPEC.md` to `800` and note it in `01-STATE.md`
- [ ] Confirm `font-synthesis-weight: none` (already set in `design/globals.css`) isn't producing invisible weight steps

---

## PHASE B — Data & layout groundwork

### B1 · DB audit 🚦 GATE
**File:** `scripts/checks/homepage-audit.ts` (follows the existing `scripts/checks/*` pattern)

**Read-only. No writes of any kind.**

Report:
- [ ] Row count per module (`blog`, `news`, `media`, `shop`, `forum`, `review`, `download`) — published, non-deleted
- [ ] `media` posts with a non-null `videoUrl`
- [ ] `shop` posts with `discountPercent > 0`
- [ ] `forum` posts with `solved = true` AND `acceptedCommentId` non-null
- [ ] `TimelineEvent` published count
- [ ] `Comment` count passing §10 filters (approved, registered author, 80–400 chars, active author)
- [ ] `User` count with ≥1 published post
- [ ] **Review analysis:** total reviews · how many would auto-link at ≥80 · how many land 30–79 · how many find no candidate · total shop products
- [ ] Output as a markdown table printed to stdout
- [ ] 🚦 **Show the owner. Get approval before B2/B4.**

---

### B2 · Migration 1 — `reviewedProductId`
- [ ] Schema updated per `03-DATA-CONTRACTS.md` §3
- [ ] `pnpm db:migrate` generates the migration
- [ ] `pnpm prisma:generate` regenerates the client
- [ ] `pnpm typecheck` passes
- [ ] Column is **nullable**; no existing row breaks
- [ ] Verify: `SELECT COUNT(*) FROM "Post"` unchanged before/after

---

### B3 · Migration 3 — `User.createdAt`
- [ ] Column added with `@default(now())` + index
- [ ] Backfill SQL run (earliest post date per user)
- [ ] Spot-check 5 long-standing users show a plausible year, not today
- [ ] `pnpm typecheck` passes

---

### B4 · Review auto-match dry-run
**File:** `scripts/reviews/match-products.ts`

- [ ] Implements the scoring table from `03-DATA-CONTRACTS.md` §3 Migration 2
- [ ] `--dry-run` is the **default**; writing requires an explicit `--apply` flag
- [ ] Outputs: review title → best candidate → score → decision bucket
- [ ] Handles `pg_trgm` being unavailable (skip the fuzzy tier, warn, continue)
- [ ] **No writes in this task.** Applying happens in E4.

---

### B5 · Floating main sidebar 🚦 GATE — SEPARATE PR
**Files:** `components/layout/LayoutShell.tsx`, `components/layout/techbox-app-sidebar.tsx`

The main sidebar currently sits **in flex flow** and consumes ~14rem of width. Make it overlay, mirroring the already-working news sidebar.

- [ ] `SidebarInset` spans the full viewport width
- [ ] Sidebar panel uses `zIndex.sidebar` (50) from `design/z-index.ts`
- [ ] Scrim uses `zIndex.sidebarBackdrop` (40)
- [ ] **Never hardcode z-index values**
- [ ] Click-outside closes (mirror the `newsSidebarRef` handler)
- [ ] `Escape` closes
- [ ] Focus trapped while open; focus returns to the trigger on close
- [ ] Desktop default **closed on `/` only**; all other routes keep `defaultOpen={true}`
- [ ] `MobileBottomNav` untouched
- [ ] News sidebar still works and still sits above the main sidebar
- [ ] 🚦 **Separate PR. Owner reviews before merge.**

---

### B6 · Regression pass
After B5, at **1280px and 1440px**, in **both themes**:
- [ ] `/` · `/blog` · `/shop` · `/forum` · `/media` · `/news` · `/tools` · `/timeline`
- [ ] No horizontal overflow
- [ ] No content hidden behind the sidebar
- [ ] `/admin` unaffected (it bypasses `LayoutShell`)
- [ ] `pnpm test:e2e` passes

---

### B7 · Extend the data layer
**File:** `lib/home-server.ts`

- [ ] `moduleTakes` updated: `{ blog:5, media:10, shop:8, forum:6, review:3, news:2, download:0 }`
- [ ] New blocks added **sequentially** (see the P2024 warning in `03-DATA-CONTRACTS.md` §1)
- [ ] Each new block wrapped in try/catch → empty array on failure, never a thrown error
- [ ] Cache key `home-data-v5` → `home-data-v6`
- [ ] `revalidate` `86400` → `3600`
- [ ] `HomeData` type extended
- [ ] `seededIndex()` helper added
- [ ] Homepage still renders if the DB is unreachable (empty payload, all sections null)

---

## PHASE C — First visible sections

*Needs A + B7. This is when the page becomes real.*

Shared criteria for **every** section in C–F:
- [ ] Server Component unless it genuinely needs interactivity
- [ ] First statement is the empty-state guard → `return null`
- [ ] Logical CSS properties only
- [ ] Correct in light **and** dark
- [ ] Matches the measured values in `02-DESIGN-SPEC.md`
- [ ] All images have explicit dimensions or `aspect-ratio` (CLS)
- [ ] `<section aria-labelledby>` pointing at its `<h2>`
- [ ] No hardcoded strings that should come from the DB
- [ ] `pnpm typecheck && pnpm lint` pass

| Task | Section | Spec | Extra criteria |
|---|---|---|---|
| **C1** | §1 Magazine | `02` §1 | Lead 578×325, thumbs 143×95. Degrades: 1 post → lead only |
| **C2** | §2 Video | `02` §2 | 9:16 cards, duration pill hidden when null, opens existing HLS player — **do not write a new player** |
| **C3** | §3 Insights + Newsletter | `02` §3 | Engagement-ranked, sidebar-dedup, newsletter POSTs to existing `/api/newsletter/subscribe`, duplicate email → friendly message |
| **C4** | §6 Timeline | `02` §6 | RTL rail (oldest right), `importance>=8` accent, dark band in both themes |
| **C5** | §9 Community | `02` §9 | Best-answer strip; falls back to most-commented when nothing is solved |
| **C6** | Wire `app/page.tsx` | — | See below |

### C6 detail
- [ ] Renders the sections built so far, in `02-DESIGN-SPEC.md` §0 order
- [ ] Honours `config[slug].enabled && showOnHome` and `homeOrder` from `getModuleConfig()`
- [ ] `<main id="main-content">` preserved (the skip-link target in `app/layout.tsx` depends on it)
- [ ] Wrapped in `HomeDataProvider`
- [ ] Old dead row components **not** imported
- [ ] Page renders with an empty DB payload without crashing

---

## PHASE D — Finder, Tools, Deals

### D1 · §4 Global Finder
- [ ] Panel: radius 25px, padding `20px 45px 70px` ≥900px (source-measured)
- [ ] Chips: `padding 8px 24px`, `border 2px solid`, `border-radius 200px`, hover `translateY(-2px)`
- [ ] Decorative disks RTL-mirrored, `aria-hidden`
- [ ] Gradient title behind `@supports`, solid fallback, dark variant, forced-colors safe
- [ ] Form `GET /search`; `SearchLog` row written per submit
- [ ] Chips from `SiteSetting`, fallback to 3 validated real queries
- [ ] Keyboard: Enter submits, chips are real links

### D2 · Build the UPS calculator
**New:** `app/tools/ups-calculator/page.tsx`, `features/tools/components/ups-calculator/`, `lib/ups.ts`
- [ ] Inputs: server count + watts, aux load, target runtime, power factor (default 0.9), redundancy N/N+1
- [ ] Outputs: total W & VA, recommended UPS VA, runtime estimate, battery pack count
- [ ] Pure logic in `lib/ups.ts` with unit tests (mirror `lib/raid.ts` / `tests/unit/raid.test.ts`)
- [ ] Results link to matching `module:"shop"` products by VA range
- [ ] Follows existing `ToolPageHeader` layout
- [ ] RTL + dark correct

### D3 · Register the tool
- [ ] `toolRoutes` entry appended in `config/modules.config.ts`
- [ ] `ups` added to `design/icons.tsx`
- [ ] `--ups` colour var added alongside `--raid`/`--nas`/`--nvr`/`--subnet`
- [ ] Appears on `/tools` automatically (that page maps the same registry)

### D4 · §8 Tools
- [ ] 5-up ≥1024px, 3-up ≥640px, 2-up mobile
- [ ] **No card chrome** — transparent until hover (Spiceworks has none)
- [ ] `text-wrap: balance; min-height: 56px` for the 2-line name break
- [ ] `new`/`v2` badges from the registry
- [ ] Maps `toolRoutes` — no hardcoded tool list

### D5 · §7 Deals
- [ ] TG deals card: image + title, **no strapline, no byline** (that restraint is the design)
- [ ] Price block via `calculateFinalPriceForPost()` — **server-side only**
- [ ] Countdown only when `discountEndsAt > now`; `tabular-nums`
- [ ] Backfills with newest shop posts when fewer than 8 discounted
- [ ] Red used **only** for real discounts

---

## PHASE E — Reviews

### E1 · Admin product picker
- [ ] Appears on the post editor when `module === "review"`
- [ ] Async search over `module:"shop"`, published only
- [ ] **Required** — Save disabled until set
- [ ] Shows product title + image + current price in the picker
- [ ] Editing an existing review preserves the current link

### E2 · API guard
- [ ] Review create/update rejects missing/invalid `reviewedProductId` → **422** with a Persian message
- [ ] Validates the target is `module:"shop"`, published, not soft-deleted
- [ ] **Server-side.** Client validation alone fails this task.
- [ ] Unit test covering the rejection path

### E3 · Triage screen
**New:** `app/admin/reviews/link-products/page.tsx`
- [ ] Lists unlinked reviews with top-3 suggestions + scores
- [ ] One-click confirm
- [ ] "Create product from review" action pre-filling `brand`/`model`/`sku`/`image`
- [ ] "Convert to blog article" action → changes module + writes `SlugRedirect`
- [ ] Progress counter (`۱۲ از ۴۰ لینک شده`)
- [ ] RBAC-protected like other admin routes

### E4 · Run the backfill 🚦
- [ ] 🚦 Owner has approved the B1 bucket counts
- [ ] `--apply` run; auto-links only at ≥80
- [ ] Before/after counts logged to `01-STATE.md`
- [ ] Spot-check 5 auto-links are genuinely correct

### E5 · Enable the review module
- [ ] `SiteSetting modules.config` → `review.enabled = true`, `showOnHome = true`
- [ ] `/review` routes work
- [ ] `revalidateTag("home-data")` fired

### E6 · §5 Our Top Picks
- [ ] Grid `--gridX: 1.4` mobile (deliberate peek) / `3` ≥900px — source-measured
- [ ] Verdict block: stars from `rating`, hidden when null
- [ ] Byline pinned bottom via `margin-top: auto`
- [ ] Footer strip: live price + "خرید از فروشگاه ←" → `/shop/{product.slug}`
- [ ] Skips unpublished / `ناموجود` products
- [ ] 1–2 results re-flow the grid; 0 unmounts

### E7 · Migration 5 🚦 GATED
- [ ] Verified `SELECT COUNT(*) ... WHERE reviewedProductId IS NULL` returns **0**
- [ ] If not 0 → **skip this task**, leave nullable, note it in `01-STATE.md`
- [ ] 🚦 Owner confirms triage complete

---

## PHASE F — Community & about

### F1 · §10 Family Comments
- [ ] Merges `Comment` + `TimelineComment`
- [ ] All 4 filters applied (length, active author, blocklist, dedupe by author)
- [ ] Hourly-seeded sample — no `Math.random()`
- [ ] Spiceworks style: quote glyph inline, **upright not italic**, avatar inline-start
- [ ] "عضو از ۱۳۹۸" from `User.createdAt`
- [ ] Origin chip per module
- [ ] Links to `/{module}/{slug}#comment-{id}`
- [ ] < 3 qualifying → unmounts

### F2 · §11 More to Explore
- [ ] Landscape hero + 4-up row (TG structure)
- [ ] Hero content panel overlaps image bottom by 24px
- [ ] Seeded random hero, distinct salt from §10
- [ ] Oldest-per-module for the 4 cards
- [ ] No hydration mismatch (verify in console)

### F3 · §12 About + Authors
- [ ] Half A: `EST. ۱۴۰۲` pill, headline, 3 bordered feature cards, on `--hp-brand`
- [ ] Persian positioning paragraph (see `02-DESIGN-SPEC.md` §12)
- [ ] Half B: carousel on `--hp-inset`, avatars 116px → 160px ≥700px
- [ ] Verified ticks with `verifiedLabel` tooltip
- [ ] Only users with ≥1 published post
- [ ] Links to `/author/{username}`

---

## PHASE G — Finish

### G1 · §0 Announcement bar
- [ ] Reads `SiteSetting home.announcement`
- [ ] **Default `enabled: false` → renders `null`**, zero height, no layout shift
- [ ] Respects `startsAt`/`endsAt` window
- [ ] Dismissal persists in `localStorage` keyed by `version`
- [ ] 3 tone presets → `--hp-brand` / `--hp-accent` / `--hp-deal`
- [ ] Bold lead span + inline CTA (Spiceworks pattern)

### G2 · Admin announcement screen
**New:** `app/admin/appearance/announcement/page.tsx`
- [ ] Toggle, text fields, CTA, href, schedule, tone
- [ ] Live preview in **both** themes
- [ ] `version` bump button (re-shows to users who dismissed)
- [ ] Writes via `SiteSetting` + `revalidateTag("home-data")`
- [ ] RBAC-protected

### G3 · §13 Footer
- [ ] Spiceworks multi-column dark on `--hp-brand-ink`
- [ ] Links `#ffffff99` → `#FFF` on hover
- [ ] Legal strip with `rgba(255,255,255,.12)` divider
- [ ] Correct in both themes

### G4 · Delete dead code
Remove (only after the new page is signed off):
`HeroSection` · `CtaSection` · `WhyTechBox` · `ToolsShowcase` · `MagazineRow` · `VideoReelsRow` · `ShopRow` · `ForumRow` · `ReviewRow` · `HomeTimelineRow` · `DownloadRow` · `HomeRowConfig.ts` · `HomeRowSkeletons.tsx`
- [ ] Confirm zero imports remain (`grep -r` each name)
- [ ] `pnpm build` succeeds
- [ ] One dedicated commit

### G5 · E2E tests
**New:** `tests/e2e/homepage.spec.ts`
- [ ] Every section renders with real data
- [ ] Dark mode: toggle, verify tokens applied, no invisible text
- [ ] RTL: `dir="rtl"`, no horizontal overflow at 375/768/1280/1440
- [ ] Empty state: with an empty payload the page renders without error and shows no empty shells
- [ ] Finder submits and reaches `/search`
- [ ] Newsletter submits successfully
- [ ] Keyboard: tab through the page, focus always visible
- [ ] `pnpm test:e2e` green

### G6 · Performance
- [ ] Lighthouse ≥ 90 performance, ≥ 95 a11y (desktop + mobile)
- [ ] **CLS < 0.05**
- [ ] LCP < 2.5s; the §1 lead image is `priority`, everything else lazy
- [ ] No hydration warnings in console
- [ ] Verify only one DB fetch per cache window

---

## Definition of Done (whole project)

- [ ] All 14 sections live, DB-backed, zero fake data
- [ ] Light + dark both correct
- [ ] RTL correct at every breakpoint
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` all green
- [ ] Lighthouse targets met
- [ ] Dead code deleted
- [ ] `01-STATE.md` fully updated
- [ ] Owner sign-off
