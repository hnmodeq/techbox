# 05 — DECISION LOG

> Locked decisions with rationale, and — importantly — **what was rejected and why**.
> An agent that doesn't know why an option was rejected will eventually re-propose it.
>
> **Do not change a locked decision.** If you believe one is wrong, log an objection under *Open Questions* in `01-STATE.md` and proceed as written.

---

## Source-mapping decisions (owner-specified)

| Section | Source | Owner's words |
|---|---|---|
| Magazine | **Spiceworks Articles** | "spiceworks article as techbox magazine" |
| Hero | **none** | "no hero yet" |
| Announcement | **Spiceworks** | "annoucement from spiceworks" |
| Video Hub | **Tom's Guide** | "videohub from toms guide" |
| Shop | **Tom's Guide** | "shop from toms guide" |
| Tools | **Spiceworks** | "tools from spiceworks" |
| Community | **Spiceworks** | "community from spiceworks" |
| Timeline | **TechBox original** | "timeline is a unique hobby" |
| Latest Insights | **Tom's Guide** | "i like the latest insight... newsletter can be here as tom's guide did" |
| Global Finder | **TG "Find your next TV"** | "we can use it as a global search in different categories" |
| Our Top Picks | **TG "Our top picks"** | "as top 3 reviews on products" |
| More to Explore | **TG** | "a random news... oldest video... oldest article" |
| About | **TG about block** | Spiceworks-style positioning sentence |
| Authors | **TG "who makes Tom's Guide"** | "gonna show our authors" |
| Family Comments | **SW testimonials** | "pick random comments from all of modules" |

---

## D1 · Colour identity → **blue + orange + red**

**Decision:** `#0F4C81` blue (structure) + `#E85D04` orange (action/commerce) + `#DC2626` red (urgency only).

**Context:** the live palette is *fully achromatic* — `oklch(0.205 0 0)`, zero chroma. The blue had never shipped. This is the site's first chromatic identity.

**Rejected:**
- *Keep achromatic + one accent* (my recommendation) — closest to Tom's Guide's actual near-monochrome look. Owner chose richer.
- *TG's `#1F69FF`* — brighter/more consumer; owner preferred the deeper `#0F4C81`.

**Constraints that follow — do not violate:**
- Each colour owns one job; they never swap. Blue never prices, orange never borders, red never appears without a real discount.
- **Orange on white is 3.9:1 → fails AA for body text.** Only ≥14px bold, or as a background with white text.
- Blue on white is 8.6:1 — safe everywhere.
- Dark mode lifts orange to `#FF7A29`, red to `#F87171`.

---

## D2 · Reviews are product-only

**Decision:** a review may only exist for a product TechBox sells. Owner: *"the author have to select a product from our real shop and write a review"* and later *"i decide now the reviews should only get write on products that we sell."*

**Enforcement is 4-layer** (schema → API → admin UI → read path). Client validation alone is explicitly insufficient.

**Existing reviews:** owner confirmed they exist and may not match the catalogue. Four outcomes — auto-link ≥80, manual triage 30–79, create-product-from-review, or convert to blog article. **Nothing is deleted.** Default for off-catalogue is conversion to `module:"blog"` with a `SlugRedirect` so the writing and its SEO survive.

**Rejected:** deleting or unpublishing off-catalogue reviews by default — destroys real editorial work.
**Rejected:** a separate `Review` table — the universal `Post` model already carries `rating`, `ratingCount`, `brand`, `model`, `sku`, plus the comment/like/revision graph. A parallel table forks all of it.

---

## D3 · Main sidebar becomes floating

**Decision:** overlay, like the news sidebar. Owner: *"we can make the main sidebar float (just like the news bar it won't affect on our website width)."*

**Why it was needed:** `TechboxAppSidebar` renders inside a flex row next to `SidebarInset`, consuming ~14rem. At 1280px that left ~1010px — the Finder's `20px 45px 70px` padding and the 3-up Top Picks grid were designed for a full 1280.

**Verified feasible:** `components/ui/sidebar.tsx` already ships `variant="floating"` and `collapsible="offcanvas"`. `techbox-news-sidebar` is a working reference for the fixed-overlay pattern.

**Constraints:** use `design/z-index.ts` tokens (`sidebar: 50`, `sidebarBackdrop: 40`) — never hardcode. Default closed **on `/` only**. Ships as its **own PR** because it affects every route. This is the highest-blast-radius change in the project.

---

## D4 · Fifth tool = UPS calculator

**Decision:** build `/tools/ups-calculator` so the Spiceworks 5-up grid is real, not padded.

Only 4 tools existed (`raid`, `nas`, `nvr`, `subnet`). Owner: *"let's the 5th tool be the UPS calculator."*
Bonus: it has a natural commerce hook — results link to shop products by VA range.

**Rejected:** shipping a 4-up grid (acceptable but less faithful). **Rejected:** a placeholder 5th tile — violates Rule 1.

---

## D5 · Insights ranks by engagement, not recency

**Decision:** §3 pulls from the news archive scored `views + likes×8 + comments×15` over a 180-day window, excluding whatever the news sidebar is showing.

**Problem it solves:** the floating news sidebar already shows recent news. Recency-ranked Insights would show the same headline twice, ~200px apart.

Owner agreed with the recommendation. "Insights" implies curation anyway.

**Fallback:** if exclusion leaves fewer than 2 items, allow the overlap rather than hide the section. A repeated headline beats an empty band.

---

## D6 · Timeline sits at §6 (agent's call)

**Decision:** §6, after Top Picks. Owner delegated: *"do whatever you think is better."*

**Why not §5** (the owner's earlier instinct): it placed Timeline directly after the Finder. Both are large saturated blocks — a solid blue Finder panel followed immediately by a dark navy Timeline band reads as one heavy slab with nowhere for the eye to rest.

Final rhythm: **Finder (blue) → Top Picks (white cards) → Timeline (navy) → Deals (pale inset).** The white row separates the two dark blocks, and it puts the highest-intent commerce section above the hobby section.

---

## D7 · Announcement is campaign-only

**Decision:** `enabled: false` by default; renders `null` with zero height. Owner: *"we gonna have announcement only for when we have a camping or event, which needs to be controllable from our best designed admin panel."*

Full admin screen with live preview in both themes, optional schedule window (auto-hides — a campaign can't be left up by accident), `version` bump to re-show after dismissal, 3 tone presets.

**Consequence:** the homepage normally starts at the tick bar, exactly as today. No stacked thin bars.

---

## D8 · Gradient text ships with a guard (agent's call)

**Decision:** `@supports` guard + solid fallback + dark variant + forced-colors handling.

`-webkit-background-clip: text` with `-webkit-text-fill-color: transparent` renders the heading **completely invisible** if either property fails. The guard makes the failure mode "solid white heading" rather than "no heading". Owner delegated.

---

## D9 · Numerals

**Persian:** prices, dates, counts, ratings, countdowns, year chips.
**Latin:** product names, model numbers (`DS923+`), RAID levels (`RAID 5`), specs (`10GbE`, `ATSC 3.0`), SKUs.

**Prices are long-form always** — `۱۲٬۴۰۰٬۰۰۰ تومان`. Owner explicitly rejected the `۱۲.۴ میلیون` short form.

**Consequence:** prices are wide (~16 chars) in a 3-up card. Handled with `white-space: nowrap` + a tighter title clamp below 400px. If it still looks cramped, **ask the owner** — do not silently switch to short form.

A `<Num latin>` wrapper protects Latin runs from a future global Persianisation, and adds `lang="en"` so screen readers switch voice.

---

## D10 · Fidelity boundary

**Copy:** layout, spacing, type scale, card anatomy, interaction patterns, measured CSS values.
**Do not copy:** their images, icons, photography, or marketing copy — all made fresh for TechBox.

Owner deprioritised this ("idk what is it about, skip it if it's not important") but it remains the operating boundary.

---

## Standing owner mandates

| Mandate | Quote |
|---|---|
| No fake data | *"we don't use any fake data, all of our cards and data needs to be alive and live in database"* |
| Card fidelity | *"we need you to design new cards similar or 'EXACTLY' like spiceworks / tom's guide cards"* |
| DB freedom | *"you have permission to create new tables/rows in database if we need"* |
| Token freedom | *"no need to follow our current tokens. you have permission to create new design tokens"* |
| Dark mode | *"let the dark/light mode work in homepage"* |
| Content seeding | *"create new contents for each module if you think we need"* |

**Seeding limits** (agent-imposed, consistent with Rule 1): never seed `Comment`, `Rating`, `Like`, `Order`, or `User`. Fabricated social proof is a lie to visitors. If §10 has no qualifying comments, it stays hidden.

---

## Rejected globally

| Idea | Why rejected |
|---|---|
| Skeleton loaders on the homepage | Violates Rule 1 — implies content that doesn't exist |
| `Promise.all` over module queries | Causes Prisma **P2024** pool exhaustion on Neon. The sequential loop is deliberate and commented in `lib/home-server.ts` |
| `Math.random()` for random slots | SSR/hydration mismatch. Use `seededIndex()` |
| New font | Kalameh is already loaded; adding one costs LCP |
| Client-side price calculation | Existing security invariant — pricing is server-side only |
| Renaming existing CSS variables | 575+ files depend on them |
| A separate `Review` table | Forks the universal `Post` graph |
| `lib/format-fa.ts` | Would duplicate `toFa`, `formatRelativeDate`, `getJalaliDateStringPersian`, `formatPostDateFa`. Only `faPrice` is missing |
