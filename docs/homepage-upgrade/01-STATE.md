# 01 — LIVE STATE LEDGER

> **This file is the single source of truth for "what is done" and "what is next".**
> Update it before you stop working, every time. An agent resuming after you reads this first.

**Last updated:** 2026-07-26
**Updated by:** Implementation agent
**Current phase:** A–G complete except browser-dependent tasks (B6, G6) and G3 (deliberately skipped)
**Next action:** Fix the owner's local dev environment. Then optionally: E1 admin product picker, E3 triage, E7 NOT NULL.

---

## Status at a glance

| Phase | Description | Status |
|---|---|---|
| **A** | Foundations: tokens, formatters, icons, primitives | ✅ Done |
| **B** | DB audit, migrations 1+3, floating sidebar | ✅ Done (B6 deferred to CI — no browser in sandbox) |
| **C** | Sections 1, 2, 3, 6, 9 (first visible pixels) | ✅ Done |
| **D** | Sections 4, 7, 8 (+ build UPS calculator) | ✅ Done |
| **E** | Review enforcement + Section 5 | 🔄 E2/E5/E6 ✅ · E1/E3 pending (admin UI) · E7 gated |
| **F** | Sections 10, 11, 12 | ✅ Done |
| **G** | Sections 0, 13, cleanup, E2E | ✅ mostly (G3 kept, G6 needs a browser) |

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
| E1 | Admin product-picker | ⬜ | `app/admin/posts/...` | API accepts+validates `reviewedProductId`; the editor UI still needs the picker |
| E2 | API guard | ✅ | `app/api/posts/route.ts` | 422 on create AND patch. `validateReviewedProduct()`. **9 unit tests** |
| E3 | Triage screen | ⬜ | `app/admin/reviews/link-products/` | Not needed yet — 0 unlinked reviews |
| E4 | Run backfill | ✅ | (done in session 2 content pass) | 3 linked at score 100 |
| E5 | Enable review module | ✅ | `SiteSetting modules.enabled` | Gated on 0 unlinked; verified before applying |
| E6 | §5 Our Top Picks | ✅ | `.../TopPicksSection.tsx` | TG gridX 1.4/3, byline pinned, buy-strip |
| E7 | Migration 5 — `NOT NULL` | ⬜ | migration | 🚦 Deferred: safe now (0 unlinked) but blocks any future draft review |

### Phase F — Community & about
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| F1 | §10 Family Comments | ✅ | `.../FamilyCommentsSection.tsx` | Chrome-less SW testimonial, upright not italic, origin chip |
| F2 | §11 More to Explore | ✅ | `.../MoreToExploreSection.tsx` | TG landscape hero w/ overlapping panel + 4-up row |
| F3 | §12 About + Authors | ✅ | `.../AuthorsSection.tsx` | Manifesto panel + contributor carousel, 116→160px avatars |

### Phase G — Finish
| ID | Task | Status | Files touched | Notes |
|---|---|---|---|---|
| G1 | §0 Announcement bar | ✅ | `.../AnnouncementBar.tsx` | Disabled by default; **0 bytes SSR in every state** |
| G2 | Admin announcement screen | ✅ | `app/admin/appearance/announcement/` | Uses the existing settings API; dual-theme live preview |
| G3 | §13 Footer | ⬜ **skipped deliberately** | — | The current footer already carries real business content (company, design credit, socials, newsletter). Replacing it with a Spiceworks clone would destroy working content to match a reference. Flagged for the owner. |
| G4 | Delete dead row components | ✅ | — | 13 files removed after confirming all refs were internal to the cluster |
| G5 | E2E: RTL + dark + empty-state | ✅ | `tests/e2e/homepage.spec.ts` | 14 tests. **Cannot run here — no browser.** Must run in CI |
| G6 | Lighthouse + CLS | ⬜ | — | Needs a browser; owner/CI only |

---

## Blockers

*None.* — P2024 pool exhaustion on `/` fixed 2026-07-26 (session 7).

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

### 2026-07-26 (session 11) — PHASE G
- **G4 dead code deleted.** 13 files (`HeroSection`, `CtaSection`, `WhyTechBox`, `ToolsShowcase`, all six `*Row` components, `DownloadRow`, `HomeRowConfig`, `HomeRowSkeletons`). Checked first that every remaining reference was *internal to the dead cluster* — `HomeRowConfig` showed 7 "external" refs but all 7 were other dead rows importing it. Safe as a unit; typecheck clean after.
- **G1 announcement bar.** Disabled by default per D7. Verified all 6 schedule cases (disabled / no window / before start / after end / inside window / empty text) and confirmed **0 bytes SSR in every state** — it starts dismissed so the server and first client render agree, then reveals after reading localStorage. Rendering-then-hiding would flash the bar on every load for users who already dismissed it.
- **G2 admin screen** at `/admin/appearance/announcement`. Reuses the existing `/api/admin/settings` endpoint rather than adding a route — registered the 4 homepage keys in its whitelist and mapped them to the existing `hero:*` permission. Live preview renders in **both themes**, since a tone can look fine in light and unreadable in dark. Fixed two real API mismatches caught by tsc: `AdminGuard` takes a render function, and `"default"` is not a `ButtonVariant` here (it's `"primary"`).
- **G5 E2E suite** — 14 tests targeting exactly what typecheck and SSR-to-string cannot catch: render loops (`Maximum update depth` / `ResizeObserver loop`), horizontal overflow at 4 widths, invisible text in dark mode (luminance-diff scan), unreserved image dimensions, eager-image count, heading-order skips, orphaned `aria-labelledby`, focus visibility. **Cannot execute here** — no browser in the sandbox.
- **G3 footer: deliberately NOT replaced.** The existing footer already carries real business content — company name, design credit, social links, newsletter. Swapping it for a Spiceworks-style multi-column clone would delete working content purely to match a reference. Raised for the owner rather than done unilaterally.

### 2026-07-26 (session 10) — PHASE F + D1 REVERSED
**Owner rejected the custom palette** after seeing it live: *"i don't like colors, let just use my own tokens."*

- **`--hp-*` rewritten as an alias layer** over the existing shadcn tokens. `--hp-brand → var(--primary)`, `--hp-ink → var(--foreground)`, `--hp-surface → var(--card)`, radii derived from `--radius`. No second palette to maintain; retheming the site now retints the homepage for free. `05-DECISIONS.md` D1 marked superseded with the original reasoning kept.
- **Caught what the swap would have broken.** Under shadcn, `--primary` is near-black in light mode but near-**white** in dark. Eight places hardcoded `text-white` on an accent fill — invisible text in light mode after the swap. Introduced `--hp-on-accent`/`--hp-on-brand` pairs and repointed every filled panel from `--hp-brand` to `--hp-brand-ink` (which resolves to a dark surface in dark mode, since a near-white filled panel would be blinding).
- Swept every hardcoded colour out of the homepage components: stale navy `rgba(1,21,53,…)` scrims → `black/85`, `#0F4C81` play glyph → `currentColor`, `#fff` grid texture → `currentColor`, `#64748B` placeholders → `slate-500`. **Zero hex/rgba left** in sections or primitives.
- Contrast checked in both themes: body 16.3/12.6, on-panel 12.6/9.6, accent-on-fill 12.6/11.0 — all pass. Muted text is 3.23 in light, but that is the pre-existing site `--muted-foreground`, not a regression from this change.
- **F1/F2/F3 built** and verified against live data: 3 family comments (3 distinct authors), MTE hero + 4 cards spanning media/blog/forum/shop, 10 authors all with bios. 19 images, all dimensioned, 0 eager, 0 physical CSS props, 0 right-arrows, empty state 0 bytes.
- **11 of 14 sections now live.** 120 tests passing.

### 2026-07-26 (session 9) — PHASE E (mostly) · verified against the live deployment
**First actual sighting of the rendered homepage** — owner pointed me at https://hnmodeq-techbox.vercel.app/. Fetched it and confirmed all 8 shipped sections render server-side with real data: 32 Persian prices, 16 discount badges, 5 tool tiles, 23 images. The ScrollRail loop fix is live and the page is stable.

- **E2 API guard.** `validateReviewedProduct()` in `app/api/posts/route.ts` rejects a review with no product, a missing/soft-deleted product, a non-shop post, or an unpublished product — **422** with a Persian message, on **both** create and patch. Server-side, so a direct API call cannot bypass it. 9 unit tests lock the decision table down (the fn itself can't be imported — it pulls the Next request stack — so the tests reproduce the rules against a fake catalogue).
- **E5 review module enabled**, gated: the script refuses to flip the flag while any unlinked review exists. Verified 3 linked / 0 unlinked first.
- **E6 §5 Top Picks** built to TG's measured grid (gridX 1.4 mobile with the deliberate next-card peek, 3-up ≥900px, byline pinned with `mt-auto`). Verdict block replaces TG's "Short List Includes". Rating hidden entirely when null rather than defaulting to 5. Footer strip carries the live price + buy link — content→commerce in one hop, which neither source can do.
- Audit: 0 physical CSS props · 0 right-arrows · 3 card images all with `aspect-ratio`, 3 avatars with explicit `width`/`height` (no CLS gap) · 3 buy links · Latin model numbers tagged `lang="en"`.
- **E1/E3 intentionally not built.** The API accepts and validates `reviewedProductId`, but the admin editor has no picker widget yet and the triage screen has nothing to triage (0 unlinked). Both are logged as remaining work rather than silently skipped.
- **E7 deferred.** `NOT NULL` would pass today but would block creating a review draft before its product is chosen. Worth doing only alongside the E1 picker.
- 120 tests passing (was 111).

### 2026-07-26 (session 8) — HOTFIX 2: infinite render loop in ScrollRail
Session 7's pool fix was real but was **not** the cause of the endless refresh. Owner reported `/` still blank and reloading.

**Root cause: a ResizeObserver → setState → layout → ResizeObserver feedback loop in `ScrollRail`.**
`sync()` called `setOverflows/setAtStart/setAtEnd` unconditionally. Mounting or unmounting the 56px arrows changes layout, which re-fires the observer, which sets state again — a loop that never settles, pinning the main thread and starving the render. Three rails on the page (video, timeline, deals) each ran their own.

Fixes:
- `sync()` now writes state **only when a value actually changes** (functional updater comparing against previous).
- The `ResizeObserver` callback is **coalesced to one measurement per animation frame**, so a single layout pass can't schedule several renders.
- `CountdownBadge` got the same treatment: skips the write when the formatted string is unchanged, and **clears its own interval** once the deal expires. Eight of these on the deals grid were re-rendering every second forever.
- Caught and fixed an operator-precedence bug in my own first attempt (`v === max > 4` parses as `(v === max) > 4`).

Simulated the loop: 50 identical observer callbacks now produce **1** state write and settle.

⚠️ **Sandbox limitation confirmed:** `pnpm dev` cannot compile pages here — `/blog`, which contains none of this project's code, also hangs on "Compiling". So runtime behaviour of the homepage **cannot be verified in this environment at all**; only static analysis, unit tests and SSR-to-string checks are possible. Browser verification must happen on the owner's machine.

### 2026-07-26 (session 7) — HOTFIX: P2024 pool exhaustion on the homepage
Owner reported `/` rendering empty and reloading endlessly, with repeated
`Timed out fetching a new connection from the connection pool (limit: 1)`.

**Three compounding causes, all now fixed:**
1. **Rates lookup inside a loop (my bug).** `getDeals` and `getTopPicks` called `calculateFinalPriceForPost` per product, and that helper fetches currency rates itself — 8 products meant 8 extra round-trips. Rates are identical for every row in a render, so they are now read **once** via `getCurrencyRates()` and passed to a new pure `priceFromRates()`. Removed ~11 queries.
2. **`getMoreToExplore` made 6 sequential queries** (count + findFirst + 4× oldest-per-module). The four are collapsed into **one** `findMany` with an `OR` across modules, picking the first per module in memory. 6 → 3.
3. **`connection_limit=1` is wrong for local dev.** It is correct for serverless (many isolated instances), but dev is one long-lived process with Turbopack re-renders and Strict Mode double-invocation. `lib/db.ts` now uses **5 connections / 30s timeout in dev**, unchanged 1/15s in production. Override with `PRISMA_CONNECTION_LIMIT`.

**Why the page stayed empty rather than recovering:** the module loop swallowed every error into `[]`, so a total DB failure produced a *successful* empty result — which `unstable_cache` then stored for the full hour. Now, if **every** module query fails, `getHomeDataUncached` throws. A rejected promise is never cached, so the next request retries. `getHomeData` still degrades to an empty page instead of a 500, but now logs loudly.

Net: ~30 queries per uncached render → ~16.

**Verified after fix:** getDeals 8 products with correct prices · getTopPicks 3 · getMoreToExplore hero + 4 cards across all modules. tsc/lint/test clean, 111 passing.

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
