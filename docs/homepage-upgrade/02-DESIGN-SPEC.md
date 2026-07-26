# 02 — DESIGN SPECIFICATION

> Visual contract for all 14 homepage sections.
> Values marked **"source-measured"** were extracted from the live Spiceworks / Tom's Guide HTML+CSS on 2026-07-26. Treat them as exact, not approximate.
>
> Read `00-START-HERE.md` first. Data queries live in `03-DATA-CONTRACTS.md`.

---

## How to read this document

- Code fences describe **intent + exact values**, not literal copy-paste CSS. Translate to Tailwind v4 utilities + the `--hp-*` tokens.
- **RTL:** every `left/right` below is already expressed logically. When you see "inline-start" in RTL that is the **right** edge; "inline-end" is the **left** edge.
- **Every section must render `null`** when its data slice is empty. No skeletons on the homepage.
- Each section lists its **empty-state threshold** — the minimum rows below which it unmounts.

---

## 1. Design Tokens — new, additive, dark-mode-native

**Strategy:** a separate `--hp-*` namespace appended to `design/globals.css`. Nothing existing is renamed or removed, so no other page can regress. Every token is defined once in `:root` and overridden in `.dark`.

Values are semantic pairs, so a single class works in both themes.

```css
/* ══ TechBox Homepage tokens (additive, hp = homepage) ══════════════ */
:root {
  /* Brand — chromatic identity per D1: blue + orange + red */
  --hp-brand:        #0F4C81;   /* primary blue */
  --hp-brand-hover:  #14639F;
  --hp-brand-ink:    #072944;   /* deepest navy — dark panels, footer */
  --hp-brand-tint:   #E8F0F7;   /* pale wash for inset bands */
  --hp-on-brand:     #FFFFFF;
  --hp-on-brand-mut: rgba(255,255,255,.60);
  --hp-accent:       #E85D04;   /* orange — CTAs, timeline chips, deal accents */

  /* Surfaces */
  --hp-bg:        #F8FAFC;
  --hp-surface:   #FFFFFF;
  --hp-surface-2: #FFFFFF;   /* raised card on tinted band */
  --hp-inset:     #E8F0F7;   /* the "inset band" background */
  --hp-border:    #E2E8F0;
  --hp-border-mut:#EEF2F6;

  /* Text */
  --hp-ink:    #011535;
  --hp-ink-2:  #1E293B;
  --hp-ink-3:  #64748B;

  /* Semantic */
  --hp-deal:   #DC2626;
  --hp-solved: #059669;
  --hp-live:   #E11D48;

  /* Elevation */
  --hp-shadow-card:  0 1px 3px rgba(1,21,53,.06);
  --hp-shadow-hover: 0 8px 24px rgba(1,21,53,.10);

  /* Geometry — Tom's Guide brand constants, verbatim */
  --hp-r-lg: 24px;
  --hp-r-md: 16px;
  --hp-r-sm: 8px;
  --hp-r-finder: 25px;
  --hp-r-pill: 200px;
}

.dark {
  /* Brand lifts for contrast on dark; ink deepens into the page */
  --hp-brand:        #4A9EDE;   /* AA on #0E1621 */
  --hp-brand-hover:  #6BB4EC;
  --hp-brand-ink:    #0B1826;
  --hp-brand-tint:   #16273A;
  --hp-on-brand:     #071019;   /* text ON a brand-filled button flips to dark */
  --hp-on-brand-mut: rgba(255,255,255,.55);
  --hp-accent:       #FF7A29;

  --hp-bg:        #0B1017;
  --hp-surface:   #131C27;
  --hp-surface-2: #18242F;
  --hp-inset:     #101A25;
  --hp-border:    #24313F;
  --hp-border-mut:#1B2631;

  --hp-ink:    #F1F5F9;
  --hp-ink-2:  #DCE3EB;
  --hp-ink-3:  #93A3B5;

  --hp-deal:   #F87171;
  --hp-solved: #34D399;
  --hp-live:   #FB7185;

  --hp-shadow-card:  0 1px 3px rgba(0,0,0,.55);
  --hp-shadow-hover: 0 8px 28px rgba(0,0,0,.65);
}

@theme inline {
  --color-hp-brand:      var(--hp-brand);
  --color-hp-brand-ink:  var(--hp-brand-ink);
  --color-hp-brand-tint: var(--hp-brand-tint);
  --color-hp-accent:     var(--hp-accent);
  --color-hp-bg:         var(--hp-bg);
  --color-hp-surface:    var(--hp-surface);
  --color-hp-inset:      var(--hp-inset);
  --color-hp-border:     var(--hp-border);
  --color-hp-ink:        var(--hp-ink);
  --color-hp-ink-2:      var(--hp-ink-2);
  --color-hp-ink-3:      var(--hp-ink-3);
  --color-hp-deal:       var(--hp-deal);
  --color-hp-solved:     var(--hp-solved);
  --color-hp-live:       var(--hp-live);
  --radius-hp-lg:        var(--hp-r-lg);
  --radius-hp-md:        var(--hp-r-md);
  --radius-hp-sm:        var(--hp-r-sm);
}
```
→ usable as `bg-hp-surface text-hp-ink border-hp-border rounded-hp-md`.

### Colour roles (D1) — blue + orange + red, no overlap

Three chromatic colours is exactly enough to be expressive and few enough to stay disciplined. Each owns a job; they never trade places:

| Colour | Token | Owns | Never used for |
|---|---|---|---|
| **Blue** `#0F4C81` | `--hp-brand` | Structure & identity: section titles, eyebrows, links, Finder panel, About panel, footer, tool icons, active states | Prices, buy buttons |
| **Orange** `#E85D04` | `--hp-accent` | Action & commerce: "افزودن به سبد" / "خرید از فروشگاه", timeline year chips, `new`/`v2` tool badges, the single hero eyebrow on dark | Body text, borders, section titles |
| **Red** `#DC2626` | `--hp-deal` | Urgency only: discount badges, strikethrough old prices, countdown timers, live dot | Anything non-commercial. A red that also means "error" would dilute the deal signal |

Guardrails:
- **One orange CTA per card, maximum.** If a card has two actions, the secondary is a blue text link.
- **Red only appears when there's a real discount** (`discountPercent > 0` and `discountEndsAt` in future). No decorative red.
- **Orange and red never touch** — a deal badge (red) and a buy button (orange) sit at opposite ends of the card, separated by the price block.
- Contrast: orange on white is 3.9:1 — **fails AA for body text**, passes for large/bold. So orange is only ever used at ≥14px bold, or as a background with white text (`#E85D04` + white = 4.1:1, AA large). Blue `#0F4C81` on white is 8.6:1, safe everywhere.
- Dark mode lifts orange to `#FF7A29` (4.8:1 on `#131C27`) and red to `#F87171`.

---

### Dark-mode rules for the copied designs

The sources are light-only. These four decisions define how each translates:

| Element | Light | Dark |
|---|---|---|
| **Inset band** (TG `flw-area-inset`) | `--hp-inset` #E8F0F7 pale blue | `#101A25` — *darker* than page bg, recessed rather than raised |
| **Brand-filled panel** (Finder §4, TG hero panel §11, About §12) | solid `#0F4C81` | `#16273A` desaturated navy + `1px` `rgba(255,255,255,.08)` hairline so the edge stays legible |
| **Timeline band** (§5) | already dark `#072944` | `#080F17` + accent glow reduced to 40% |
| **Glass cards** `rgba(255,255,255,.06)` | fine as-is | raise to `rgba(255,255,255,.04)` over the darker base, border `rgba(255,255,255,.10)` |

Additional dark rules:
- **Images get a slight knock-down:** `.dark .hp-card img { filter: brightness(.92) }` — prevents white product shots from glaring.
- **Gradient-clipped text** (Finder title) needs a dark variant: `linear-gradient(#fff,#fff,#ffffff99)` → `linear-gradient(#F1F5F9,#F1F5F9,#93A3B5)`.
- **Deal red** must not vibrate on dark → `#DC2626` → `#F87171`.
- **The 56px carousel arrow** `#1B1B1BD9` stays in both themes; in light it reads as a deliberate dark chip (that's TG's own choice), in dark the border switches to `--hp-brand`.

### 1.5 · Floating main sidebar (D3) — the layout change

**Your proposal works, and the codebase already proves it.** The news sidebar is `position: fixed` with `z-40`, sitting entirely outside the document flow — opening it does not reflow content by one pixel. The main sidebar behaves differently today: `TechboxAppSidebar` renders inside a `flex` row next to `SidebarInset`, so it **consumes ~14rem of layout width**.

At 1280px that meant: `1280 − 224 (sidebar) − padding ≈ 1010px` of usable canvas. The Finder's `padding: 20px 45px 70px` and the 3-up Top Picks grid were both designed against a 1280 container. That's the cramping.

**Fix — switch the main sidebar to overlay, matching the news sidebar:**
```
components/ui/sidebar.tsx already ships variant="floating" and collapsible="offcanvas".
Today: <Sidebar side="right" dir="rtl"> → default variant="sidebar", in-flow.
Change: render it fixed/overlay so SidebarInset spans the full viewport width.
```
Concretely:
- `SidebarInset` gets the **full width**; the sidebar floats above content using the existing tokens in `design/z-index.ts` — `zIndex.sidebar` (50) for the panel, `zIndex.sidebarBackdrop` (40) for the scrim. **Do not hardcode z-values.**
- Opening it **overlays** rather than pushes — identical UX to the news sidebar you already have, so the two feel like siblings.
- A scrim (`bg-black/20`, dark: `bg-black/50`) at `zIndex.sidebarBackdrop` appears on open; click-outside closes, same handler pattern as `newsSidebarRef` in `LayoutShell.tsx`.
- The `SidebarRail` grab-strip stays for keyboard/drag affordance.
- **Desktop default: closed** on `/` only. It's a destination page; chrome should get out of the way. Every other route keeps `defaultOpen={true}` so nothing else changes.
- `MobileBottomNav` untouched — mobile already uses a sheet.

**Result:** the homepage gets the full 1280px container in all states, and both sidebars become overlays that never affect width. This is a change to `LayoutShell` + `TechboxAppSidebar`, and it touches every route — so it ships as **its own PR, reviewed and merged before Phase C**, not bundled into a section commit.

⚠️ **Regression watch:** every page currently renders inside a narrower `SidebarInset`. Widening it site-wide may expose layouts that assumed the narrower canvas (`/shop` grids, `/admin` is exempt). Phase B includes a visual pass over the top 8 routes at 1280/1440 before we merge.

---

### 1.6 · Numerals & formatting (D9)

Two helpers, used everywhere. No ad-hoc `toLocaleString` calls.

⚠️ **Most of these already exist. Do NOT create `lib/format-fa.ts` — you would be forking working code.**

| Need | Already exists | Where |
|---|---|---|
| Persian digits | `toFa(n)` | `lib/date-format.ts` |
| Relative date | `formatRelativeDate(d)` → "۳ روز پیش" | `lib/date-format.ts` |
| Relative time | `formatRelativeTime(d)` → "۲ ساعت پیش" | `lib/date-format.ts` |
| Absolute Jalali date | `getJalaliDateStringPersian(d)` | `lib/jalali.ts` |
| Post date | `formatPostDateFa(d)` | `lib/post-date.ts` |
| Final product price (Toman) | `calculateFinalPriceForPost(post)` | `lib/currency.ts` |

**Only one new helper is needed** — presentation-layer price formatting:
```ts
// lib/format-price.ts   ← THE ONLY NEW FORMATTER FILE
import { toFa } from "@/lib/date-format";

/** "۱۲٬۴۰۰٬۰۰۰ تومان" — long form ALWAYS (D9). U+066C Arabic thousands separator. */
export function faPrice(toman: number): string {
  return `${toFa(Math.round(toman))} تومان`;   // Intl fa-IR already emits ٬
}

/** "۲۴ نظر" style counters. */
export function faCount(n: number, unit: string): string {
  return `${toFa(n)} ${unit}`;
}
```
`toFa` uses `new Intl.NumberFormat("fa-IR")`, which already produces Persian digits **and** the U+066C separator — no manual digit mapping.

**Stays Latin — never converted:**
| Case | Example |
|---|---|
| Product names & models | `DS923+`, `PowerEdge R750`, `UPS 3000VA` |
| RAID levels | `RAID 5`, `RAID 10`, `SHR-2` |
| Technical specs | `10GbE`, `ATSC 3.0`, `IPv4`, `2.5"` |
| SKUs / part numbers | `SKU-4417` |

**Becomes Persian:** prices, dates, view/like/comment counts, ratings (`۴٫۵ از ۵`), countdown timers, year chips.

**Implementation guard:** a `<Num>` component wraps values that must stay Latin (`<Num latin>{model}</Num>`), so a future global find-replace can't accidentally Persianise a model number. Prices use `tabular-nums` + `font-variant-numeric` so countdowns don't jitter.

> Note: `faPrice` long form is wordy on a dense card (`۱۲٬۴۰۰٬۰۰۰ تومان` ≈ 16 chars). Card price rows get `white-space: nowrap` and the title clamp tightens by one line on `< 400px` so the price never wraps mid-number.

---

### Typography — Kalameh

TG's Inter scale, retuned for Persian. Kalameh runs slightly larger on the x-height, so headings drop ~2px vs. the source and line-heights rise.

| Role | Size / LH | Weight |
|---|---|---|
| Section title | 28px / 40px | 700 |
| Section desc | 15px / 28px | 400 · `--hp-ink-3` |
| Hero card title | 24px / 38px | 700 |
| Card title | 17px / 28px | 700 |
| Strapline | 14px / 26px | 400 |
| Byline name | 13px / 22px | 700 |
| Byline meta | 12px / 20px | 400 |
| Eyebrow | 12px / 18px | 800 · `letter-spacing: 1.5px` |

> **Persian eyebrow note:** TG uses `letter-spacing: 2.5px` + `uppercase`. Persian has no uppercase and letter-spacing *breaks* Arabic-script joining. So eyebrows use **weight 800 + 1.5px spacing + `--hp-brand` colour** to get the same "kicker" read without mangling the script. Latin-only eyebrows (`RAID`, `NAS`) keep the full 2.5px.

**RTL:** logical props only (`ps-/pe-`, `ms-/me-`, `border-s/border-e`, `start-/end-`); all `→` become `←`; carousels flip scroll sign; accent rails on the right via `border-inline-start`.

---

## 2. Section-by-Section

### 0 · Announcement Bar — Spiceworks
Spiceworks renders a single centered sentence with a bolded lead and an inline link ending in `»`.

```
Height 44px · bg var(--hp-brand-ink) · text #FFF 14px/44px, weight 400
Bold lead span: font-weight 700
Inline CTA link: color #FFF, underline, ends with "«" (RTL mirror of »)
Dismiss ×: 16px, inset-inline-end 16px, opacity .7 → 1
Persists dismissal in localStorage (key: tb_ann_v{n})
```
**Data + admin (D7 — campaign/event only).** `SiteSetting` `key='home.announcement'`:
```jsonc
{
  "enabled": false,            // ← DEFAULT. Zero-height, renders null, no DOM node at all.
  "version": 3,                // bump = re-show to users who dismissed v2
  "textFa": "نمایشگاه الکامپ ۱۴۰۵ — تکباکس غرفه B12",
  "boldLeadFa": "الکامپ ۱۴۰۵",  // rendered 700 before the rest, Spiceworks pattern
  "ctaLabelFa": "ثبت‌نام کنید «",
  "href": "/landing/elecomp-1405",
  "startsAt": "2026-08-01T00:00:00Z",   // optional auto-window
  "endsAt":   "2026-08-09T00:00:00Z",   // auto-hides, no manual cleanup
  "tone": "brand"              // brand | accent | deal
}
```
**Admin screen** at `/admin/appearance/announcement`:
- Toggle + live preview rendering the real bar in both light and dark.
- Optional schedule window; outside it the bar hides itself, so a campaign can't be left up by accident.
- `version` bump button — re-shows to everyone who previously dismissed.
- 3 tone presets mapping to `--hp-brand` / `--hp-accent` / `--hp-deal`.
- Writes through the existing `SiteSetting` + `revalidateTag("home-data")` path, so it goes live without a deploy.

Renders `null` when `enabled:false` or outside the window — **no placeholder, no reserved height, no layout shift.** Since it's off by default, the homepage normally starts at the tick bar exactly as it does today.

---

### 1 · Magazine — **Spiceworks "Articles"** layout
This is the exact Spiceworks pattern: one large lead article on one side, a stacked list of 4 compact items on the other. Each item is `[category link] → [headline] → [date]`. Note Spiceworks image ratios: lead is **578×325**, list thumbs are **~143×95**.

```
Section header:
  h2 "مجله تکباکس"  30/38 700 var(--hp-ink)
  "مشاهده همه مقالات ←"  ← inline-start of header row, 12px/900/ls .1em/UPPERCASE-equivalent,
                            color var(--hp-brand)
  desc: "اخبار، تحلیل و منابع فناوری اطلاعات برای آماده ماندن در برابر هر چالشی."
        15/26, var(--hp-ink-3), max-w 720px

Grid: [lead 578fr] [list 1fr] on ≥1024px  ·  gap 40px
      RTL → lead sits RIGHT, list sits LEFT
```

**Lead card (Spiceworks lead):**
```
img  aspect 578/325, radius 0 (Spiceworks uses square corners here) → we use radius-tb-sm 8px
category eyebrow  12px/900/ls 2.5px  color var(--hp-brand)  mb 8px
h3 headline       28px/38px 700  var(--hp-ink)   hover: color var(--hp-brand)
excerpt           15px/26px var(--hp-ink-3), clamp 3 lines, ends with "…"
date              13px/20px var(--hp-ink-3), Persian numerals: "۳ مرداد ۱۴۰۵"
NO author avatar on lead — Spiceworks omits it here. Keep it omitted.
```

**List item (×4):**
```
Row, gap 16px, py 20px, border-block-end 1px var(--hp-border), last:none
thumb  143×95 fixed, object-cover, radius 6px, flex-none
col:
  category eyebrow 11px/900/ls 2px var(--hp-brand)
  title 16px/24px 700, clamp 2
  date  12px/18px var(--hp-ink-3)
hover: title → var(--hp-brand); row bg → var(--hp-bg)
```

**Query:**
```ts
prisma.post.findMany({
  where: { module: "blog", published: true, deletedAt: null, date: publicPostDateWhere() },
  orderBy: { date: "desc" }, take: 5, select: cardSelect
})
// [0] → lead, [1..4] → list
```
Reuses existing `cardSelect` + `normalizeCard` from `lib/home-server.ts`. **Bump cache key** `home-data-v5` → `home-data-v6`.
Empty state: if `< 5` posts, list renders however many exist; if `0`, whole section unmounts.

---

### 2 · Video Hub — **Tom's Guide "Quick takes"**
TG uses a Firework `<fw-embed-feed mode="row">` — a horizontal rail of **9:16 vertical** video cards that open a bottom-right floating player. Since we own our HLS player, we replicate the visual, not the vendor.

```
Section header: h2 "ویدیوهای تکباکس" + desc "نگاه‌های کوتاه؛ در ۶۰ ثانیه به‌روز شو."
Rail: display flex, gap 12px, overflow-x auto, scroll-snap-type x mandatory,
      scroll-padding-inline-start 16px, scrollbar hidden
      RTL: first card pinned right
```
**Video card (TG Firework row card, measured):**
```
w 172px (mobile) / 200px (≥900px) · aspect-ratio 9/16 · radius 12px · flex-none · snap-start
poster: object-cover, full bleed
overlay gradient: linear-gradient(to top, rgba(1,21,53,.85) 0%, transparent 55%)
title: absolute bottom 12px, inline 12px, 14px/20px 700 #FFF, clamp 2
duration pill: absolute top 8px inset-inline-end 8px,
               bg rgba(1,21,53,.75), backdrop-blur 4px, #FFF 11px/700, px 6 py 2, radius 4px
play glyph: 28px circle, bg rgba(255,255,255,.92), centered, opacity 0 → 1 on hover
hover: transform scale(1.03), transition 200ms ease
```
Nav arrows (TG `wdn-listv2-action` — copy verbatim): **56×56px circle**, `bg #1B1B1BD9`, `border 1px var(--hp-brand)`, white chevron, hidden < 900px, `previous` on the right in RTL.

**Query:** `module:'media'`, `videoUrl != null`, `orderBy date desc`, `take: 10`. Uses existing `videoDuration` field for the pill. Clicking opens the existing HLS.js player (no new player).

---

### 3 · Latest Insights + Newsletter — **Tom's Guide `live-blog` + `newsletter-sidebar`**
TG's layout here is a 2-column widget area: live feed spans left 2/3, newsletter card sits right 1/3.

```
Grid ≥900px: [2fr] [1fr] gap 20px  ·  RTL → feed RIGHT, newsletter LEFT
Whole band sits on an inset panel: bg var(--hp-inset), radius 24px, p 32px
   (TG: flw-area-inset / flw-inset-bg-1)
```

**Feed column (TG `wcp-item-content`):** exactly **2 news items**, most recent first.
```
h2 "آخرین بینش‌ها" 30/38 700
"به‌روزرسانی ⟳" button: top-inline-start, 13px, bg #FFF, border 1px var(--hp-border),
                        radius 999px, px 14 py 6
Per item:
  <time> 12px/18px var(--hp-ink-3), Persian relative: "۲ ساعت پیش"
  h3 headline 22px/32px 700 var(--hp-ink)
  16:9 image, radius 8px, full width of column
  lead paragraph 15px/28px, clamp 3
  bullet CTA: "خواندن کامل خبر: **{title}**" — bold link, var(--hp-brand)
  divider between the two items: 1px var(--hp-border), my 28px
Live dot: 8px circle var(--hp-live) beside the h2, CSS pulse 2s infinite
```

**Newsletter card (TG `newsletter-sidebar`, RTL):**
```
bg var(--hp-brand) · radius 24px · p 32px · color #FFF · sticky top 96px
title 22px/30px 600
sub  14px/22px var(--hp-on-brand-mut)
email input: bg #FFF, radius 12px, h 48px, ps 16px, placeholder color #64748B
submit: 40×40 square-ish inside the field at inline-end, shows "←"
2 checkboxes (TG has 2): 13px/20px — "دریافت خبرنامه هفتگی" / "اطلاع از تخفیف‌های فروشگاه"
footer legal: 11px/18px var(--hp-on-brand-mut) with links to /terms
```
**Data:** POST → existing `app/api/newsletter/subscribe/route.ts` → `NewsletterSubscriber`. Success state swaps card content to a checkmark + "عضویت شما ثبت شد". Duplicate email → friendly "قبلاً عضو شده‌اید".

**Query (feed) — engagement-ranked (D5).** The floating news sidebar shows *recent* news; if Insights also showed recent news the same headline would appear twice, ~200px apart. So Insights curates from the **whole archive** by engagement:

```ts
// Score = views + (likes × 8) + (comments × 15); recency is a tiebreaker, not the driver.
// Window: last 180 days, so "insights" stay relevant without being merely "newest".
const insights = await prisma.post.findMany({
  where: { module: "news", published: true, deletedAt: null,
           date: { gte: subDays(new Date(), 180), ...publicPostDateWhere() } },
  orderBy: [{ views: "desc" }, { likes: "desc" }, { date: "desc" }],
  take: 12, select: cardSelect,
});
// then in-memory: weighted score, exclude any slug currently in the news sidebar's top 5,
// take the best 2.
```
Exclusion list comes free from `getLayoutHomeData().modules.news` (already fetched for the sidebar) — **no extra query**. If exclusion would leave fewer than 2 items, we allow the overlap rather than hide the section; a repeated headline beats an empty band.

---

### 4 · Global Finder — **Tom's Guide `product-finder-1`** ("Find your next TV")
Your favorite. Here is TG's actual CSS, which we mirror 1:1:

```css
.help__widget { background: var(--flexi-brand-color-1); color: #ffffff99; border-radius: 25px; }
@media (min-width:900px){ .help__widget--custom-md-padding { padding: 20px 45px 70px; } }
.help__title { font-weight:500; letter-spacing:.4px;
  background:-webkit-linear-gradient(#fff,#fff,#ffffff99);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.help__search { background:#fff; border-radius:1rem; padding:.5rem; margin-bottom:25px; }
.help__input::placeholder { color:#64748b; }
.help__links { display:flex; flex-wrap:wrap; gap:8px; }
.help__link { padding:8px 24px; border:2px solid #fff; border-radius:200px;
  background:transparent; font-size:1rem; transition:all .2s ease; white-space:nowrap; }
.help__link:hover { transform: translateY(-2px); }
.help__submit { width:40px; height:40px; }
.help__decorative-disk-1 { width:230px; height:230px; transform:translate(50%,70%); }
.help__decorative-disk-2 { width:130px; height:130px; transform:translate(-25%,75%); }
```

**TechBox version:**
```
Panel: bg var(--hp-brand), radius 25px, padding 20px 45px 70px (≥900px)
       overflow hidden, position relative
Decorative disks: rgba(255,255,255,.08) circles — disk-1 230px translate(-50%,70%) [RTL flip],
                  disk-2 130px translate(25%,75%) [RTL flip]
Search glyph watermark: 88px, opacity .12, absolute top 15px inset-inline-start 15px [RTL flip]
Logo mark: TechBox wordmark in white, 32px tall, centered
h2 "دنبال چی می‌گردی؟"  text-2xl / md:text-3xl, weight 500, ls .4px,
   gradient text: linear-gradient(#fff, #fff, #ffffff99), background-clip:text
Search field: white, radius 16px, p 8px, h 56px, mb 25px
  input placeholder: "بهترین سرور برای مجازی‌سازی" (rotates every 4s through the 3 chips)
  submit 40×40, shows "←"
Chips row: grid-cols-2 on mobile / flex on ≥900px, gap 8px (TG uses gap-6 on the outer, 8px inner)
Chip: px 24 py 8, border 2px solid #fff, radius 200px, transparent bg, 16px #FFF
      hover: translateY(-2px)
```
**The 3 chips** (your spec, translated to TechBox reality — mapped to real categories that exist in the DB):
| Chip label (fa) | Query |
|---|---|
| «سرورهای آماده‌به‌کار» | `/search?q=سرور&category=shop` |
| «بهترین برای مجازی‌سازی» | `/search?q=مجازی‌سازی` |
| «دارای گارانتی رسمی» | `/search?q=گارانتی&module=shop` |

**D8 — gradient text safety.** `-webkit-background-clip: text` + `-webkit-text-fill-color: transparent` renders the title **fully invisible** if either property fails. Shipping with a guard so the failure mode is "solid white text" rather than "no heading":
```css
.hp-finder__title { color: var(--hp-on-brand); }        /* always-valid fallback */
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .hp-finder__title {
    background: linear-gradient(180deg, #fff, #fff, var(--hp-on-brand-mut));
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
  }
}
.dark .hp-finder__title { /* gradient retuned for dark, see §1 */
  background: linear-gradient(180deg, #F1F5F9, #F1F5F9, #93A3B5);
}
```
Also forced-colors safe: `@media (forced-colors: active) { -webkit-text-fill-color: currentColor }`.

Form `action="/search"` `method="GET"` — hits the **existing** `app/search/page.tsx` + `lib/search.ts`. Every submit writes a `SearchLog` row via existing `lib/search-log.ts`, so admin `/admin/search-analytics` gets richer data for free. Chip labels come from `SiteSetting` key `home.finder.chips` so you can retune them without a deploy.

---

### 5 · Our Top Picks — **Tom's Guide `best-picks--tabbed-`** (product reviews)
TG's card is `flw-listing-large-items`: **3 across on ≥900px**, gap 20px, and — the distinctive bit — a **"Short List Includes"** mini-list inside the card body plus a **byline block with a circular author avatar**.

**Required backend change (this is the real work):**
1. Re-enable the `review` module: `SiteSetting` `modules.config` → `review.enabled = true`, `showOnHome = true`.
2. Constrain reviews to products. Add to `Post`:
   ```prisma
   /// A review post MUST point at a real shop product.
   reviewedProductId String?
   reviewedProduct   Post?  @relation("ProductReviews", fields:[reviewedProductId], references:[id], onDelete: SetNull)
   productReviews    Post[] @relation("ProductReviews")
   @@index([reviewedProductId], name: "post_reviewed_product_idx")
   ```
   Migration: `20260726000001_review_product_link`.
3. Admin editor: when `module === 'review'`, the form shows a **required** async product picker (searches `module:'shop'`, `published:true`) and blocks save without it. Server-side guard in the review create/update route — not just client validation.
4. Verdict fields reuse existing columns: `rating` (Float 0–5) + `ratingCount`. No new price fields — price is read live from the linked product so it can never go stale.

**Card spec (TG exact):**
```
Header: h2 "انتخاب‌های برتر ما" 30/38 700
        desc "کارشناسان ما هر سال ده‌ها محصول را تست می‌کنند. این‌ها قهرمانان فعلی دسته‌بندی خود هستند."
Grid: --gridX: 1.4 (mobile, peeking next card) / 3 (≥900px); gap 10px / 20px  ← TG values verbatim
Card: bg #FFF, radius 16px, border 1px var(--hp-border), overflow hidden,
      display flex column, height stretch
  image: aspect 450/253 (TG serves -450-80.jpg), object-cover
  body p 20px, flex 1, display flex column:
    title 20px/28px 700 var(--hp-ink), clamp 3
    strapline 14px/22px var(--hp-ink-3), clamp 2
    ── verdict block (our substitute for TG "Short List Includes") ──
      label "امتیاز تکباکس" 12px/900/ls 2.5px var(--hp-brand)
      stars: 5× 16px, filled var(--hp-accent) — from Post.rating
      score "۴٫۵ از ۵" 14px 700 · "(۲۴ رأی)" 12px var(--hp-ink-3) ← Post.ratingCount
      ul, 3 lines max, 13px/22px, marker "•" var(--hp-brand):
        li "قیمت: ۱۲٬۴۰۰٬۰۰۰ تومان"        ← LIVE from reviewedProduct.priceAmount
        li "گارانتی: ۳۶ ماهه"                ← reviewedProduct.warranty
        li.more "و ۴ مورد دیگر…" 12px var(--hp-ink-3)
    ── byline (margin-top auto, TG pins it to the bottom) ──
      avatar 40px circle · name "نوشتهٔ {author.name}" 13px 700
      role {author.roleFa || author.job} 12px var(--hp-ink-3)
      "آخرین بروزرسانی ۴ مرداد ۱۴۰۵" 12px var(--hp-ink-3)
  footer strip (TechBox addition — our checkout advantage, absent from TG):
      bg var(--hp-brand-tint), py 12px, px 20px, flex justify-between
      price 17px 700 var(--hp-ink) · "خرید از فروشگاه ←" button,
      bg var(--hp-accent), #FFF, radius 8px, px 16 py 8, 13px 700
      → links straight to /shop/{reviewedProduct.slug} — content→commerce in one hop
```
**Query:**
```ts
prisma.post.findMany({
  where: { module:"review", published:true, deletedAt:null,
           reviewedProductId: { not: null }, date: publicPostDateWhere() },
  orderBy: [{ rating: "desc" }, { date: "desc" }],
  take: 3,
  include: { reviewedProduct: { select: {
    slug:true, priceAmount:true, discountPercent:true, warranty:true, availability:true, image:true }}}
})
```
If fewer than 3 qualifying reviews exist → **render only what exists** (1 or 2 cards, grid re-flows). If 0 → section unmounts. No placeholders, ever.

**D2 — Reviews become product-only. Full policy.**
You've decided reviews may only be written about products you sell. That's now a **system invariant**, enforced at four layers so it can't be violated later:

| Layer | Enforcement |
|---|---|
| **Schema** | `reviewedProductId` — nullable in migration 1 (for backfill), promoted to **`NOT NULL`** in migration 5 once every row is linked |
| **API** | Review create/update routes reject a missing/invalid `reviewedProductId` with 422. Server-side — not client validation |
| **Admin UI** | Product picker is a required field; Save is disabled until a real published `module:'shop'` post is selected |
| **Read path** | §5 additionally skips reviews whose product is unpublished, soft-deleted, or `availability = 'ناموجود'` |

**Migrating the reviews you already have.** They're currently unlinked and may cover hardware not in the catalogue. Four outcomes, decided per review by an audit I run first:

1. **Auto-link (score ≥ 80)** — product clearly exists in the shop. Scored match:
   | Signal | Weight |
   |---|---|
   | `review.sku == product.sku` | 100 |
   | `brand` + `model` both match | 80 |
   | `brand` match + ≥2 title tokens shared | 50 |
   | `pg_trgm` title similarity ≥ 0.45 | 30 |
2. **Manual triage (30–79)** — admin screen `/admin/reviews/link-products`: two-column list, top-3 suggestions with scores, one click to confirm. Never auto-guessed; a wrong link would put a wrong live price on a card.
3. **Product doesn't exist but should** — the review is of hardware you *do* sell but haven't listed. Output: a "create product from review" action that pre-fills `brand`/`model`/`sku`/`image` from the review. Turns a content gap into a catalogue entry.
4. **Genuinely off-catalogue** — hardware you don't and won't sell. Options, your pick per item: **(a)** convert to `module:'blog'` (it's really an article), **(b)** keep as a review but unlinked and excluded from §5, or **(c)** unpublish. My default recommendation is **(a)** — the writing keeps its value, it just lives in the magazine where it belongs, and `SlugRedirect` preserves the old URL and SEO.

**Nothing is deleted.** Every path preserves the content and its comments/likes; only its module or linkage changes.

**Audit first.** Before any write, I produce a read-only report: total reviews, how many auto-link at ≥80, how many need triage, how many are off-catalogue, and the shop-catalogue size. You approve the bucket counts, then I run the migration. That report is Phase B's first deliverable.

**Card spec (TG exact):**
```
Header: h2 "انتخاب‌های برتر ما" 30/38 700
        desc "کارشناسان ما هر سال ده‌ها محصول را تست می‌کنند. این‌ها قهرمانان فعلی دسته‌بندی خود هستند."
Grid: --gridX: 1.4 (mobile, peeking next card) / 3 (≥900px); gap 10px / 20px  ← TG values verbatim
Card: bg #FFF, radius 16px, border 1px var(--hp-border), overflow hidden,
      display flex column, height stretch
  image: aspect 450/253 (TG serves -450-80.jpg), object-cover
  body p 20px, flex 1, display flex column:
    title 20px/28px 700 var(--hp-ink), clamp 3
    strapline 14px/22px var(--hp-ink-3), clamp 2
    ── verdict block (our substitute for TG "Short List Includes") ──
      label "امتیاز تکباکس" 12px/900/ls 2.5px var(--hp-brand)
      stars: 5× 16px, filled var(--hp-accent) — from Post.rating
      score "۴٫۵ از ۵" 14px 700 · "(۲۴ رأی)" 12px var(--hp-ink-3) ← Post.ratingCount
      ul, 3 lines max, 13px/22px, marker "•" var(--hp-brand):
        li "قیمت: ۱۲٬۴۰۰٬۰۰۰ تومان"        ← LIVE from reviewedProduct.priceAmount
        li "گارانتی: ۳۶ ماهه"                ← reviewedProduct.warranty
        li.more "و ۴ مورد دیگر…" 12px var(--hp-ink-3)
    ── byline (margin-top auto, TG pins it to the bottom) ──
      avatar 40px circle · name "نوشتهٔ {author.name}" 13px 700
      role {author.roleFa || author.job} 12px var(--hp-ink-3)
      "آخرین بروزرسانی ۴ مرداد ۱۴۰۵" 12px var(--hp-ink-3)
  footer strip (TechBox addition — our checkout advantage, absent from TG):
      bg var(--hp-brand-tint), py 12px, px 20px, flex justify-between
      price 17px 700 var(--hp-ink) · "خرید از فروشگاه ←" button,
      bg var(--hp-accent), #FFF, radius 8px, px 16 py 8, 13px 700
      → links straight to /shop/{reviewedProduct.slug} — content→commerce in one hop
```
**Query:**
```ts
prisma.post.findMany({
  where: { module:"review", published:true, deletedAt:null,
           reviewedProductId: { not: null }, date: publicPostDateWhere() },
  orderBy: [{ rating: "desc" }, { date: "desc" }],
  take: 3,
  include: { reviewedProduct: { select: {
    slug:true, priceAmount:true, discountPercent:true, warranty:true, availability:true, image:true }}}
})
```
If fewer than 3 qualifying reviews exist → **render only what exists** (1 or 2 cards, grid re-flows). If 0 → section unmounts. No placeholders, ever.

**Backfilling the reviews that already exist.** (Owner confirmed there are rows.)
Existing `module:'review'` rows have `reviewedProductId = NULL`, so on day one they'd all be filtered out and the section would render nothing. The fix is a three-step migration, not a schema change alone:

1. **Add the column nullable** — zero downtime, nothing breaks.
2. **Auto-match** each review to a shop product with a scored SQL pass, best match wins:
   | Signal | Weight | Note |
   |---|---|---|
   | `review.sku == product.sku` | 100 | exact, trust completely |
   | `brand` + `model` both match | 80 | very high confidence |
   | `brand` matches + title token overlap ≥ 2 | 50 | probable |
   | title trigram similarity (`pg_trgm`) ≥ 0.45 | 30 | fuzzy fallback |

   Auto-link at **score ≥ 80**. Anything scoring 30–79 goes to a review queue rather than being guessed.
3. **Admin triage screen** at `/admin/reviews/link-products` — a two-column list of unlinked reviews with the top-3 suggested products and their scores, one click to confirm. Anything still unlinked simply doesn't appear in §6; the review itself stays fully published and reachable at `/review/{slug}`.

I'll run a read-only audit first and report: how many reviews exist, how many auto-link at ≥80, how many need manual triage. If the auto-match rate is poor, we widen the shop catalogue rather than lower the threshold — a wrong product link would put a wrong live price on a review card, which is worse than an empty section.

**Guard:** `onDelete: SetNull` means deleting a product doesn't delete the review — it just drops out of Top Picks until relinked. The card also skips any review whose product is unpublished or `availability = 'ناموجود'`, so we never advertise something unbuyable.

---

### 6 · Timeline — TechBox original (the "hobby")
Deliberately *not* copied from either source. This is the section that makes the homepage feel like TechBox and not a clone. A horizontal year rail.

```
Band: bg var(--hp-brand-ink), full-bleed, py 64px, color #FFF
  subtle grid texture overlay, opacity .04
h2 "گاه‌شمار تکنولوژی" #FFF  ·  desc var(--hp-on-brand-mut)
Rail: horizontal scroll, snap-x, RTL (oldest at the RIGHT, newest scrolling LEFT)
  a 2px horizontal line at 50% height, rgba(255,255,255,.2), spanning the rail
Event card (alternating above/below the line — the classic timeline zigzag):
  w 260px, flex-none, snap-center
  year chip: 32px circle on the line, bg var(--hp-accent), #FFF 13px 700 (Persian year)
  connector: 1px vertical, rgba(255,255,255,.3), 28px
  card: bg rgba(255,255,255,.06), backdrop-blur 8px, border 1px rgba(255,255,255,.12),
        radius 16px, p 16px
    thumb 16:9 radius 8px (if TimelineEvent.image)
    title 15px/22px 700 #FFF, clamp 2
    description 13px/20px var(--hp-on-brand-mut), clamp 2
    dateFa 12px var(--hp-on-brand-mut)
    ♥ likes count (from TimelineLike) 12px
  importance ≥ 8 → card gets border-color var(--hp-accent) + a soft accent glow
"ورود به گاه‌شمار کامل ←" centered under the rail, outline button, #FFF border
```
**Query:** `TimelineEvent` where `published:true`, `orderBy: { dateGr: 'asc' }`, `take: 12`, with `_count: { likes: true }`.

---

### 7 · Shop — **Tom's Guide `deals`** widget
TG's deals widget is deliberately the *plainest* card on the page: image + title, **no strapline, no byline**. 4-up on desktop, 2-up mobile, on a tinted inset. That restraint is the look.

```
Band: inset panel, bg var(--hp-inset), radius 24px, py 40px, px 32px
h2 "بهترین پیشنهادهای امروز"
desc "تخفیف‌های امروز را از دست ندهید. بهترین کاهش قیمت‌ها روی سخت‌افزار سازمانی."
Grid: --gridX 2 / 4 (≥900px), gap 10px / 20px  ← TG verbatim
Card: bg #FFF, radius 12px, overflow hidden, border 1px transparent
  image aspect 450/253 object-cover
  body p 16px:
    title 16px/24px 700, clamp 3
    ── TechBox commerce block (we have real prices; TG does not) ──
      price row, mt 12px, flex align-baseline gap 8px:
        current  18px 700 var(--hp-ink)  "۹٬۸۵۰٬۰۰۰ تومان"
        old      13px var(--hp-ink-3) line-through
        badge    "٪۱۵" bg var(--hp-deal) #FFF 12px 700 radius 4px px 6 py 2
      countdown (only when discountEndsAt is in the future):
        12px 700 var(--hp-deal), tabular-nums, "۰۴:۲۳:۱۵ تا پایان تخفیف"
      availability chip: "موجود" var(--hp-solved) / "ناموجود" var(--hp-ink-3), 11px
  hover: shadow 0 8px 24px rgba(1,21,53,.10), translateY(-2px)
Footer link: "مشاهده همه تخفیف‌ها ←" — TG renders this as a `widget-see-all` under the grid,
             13px 700 var(--hp-brand)
Nav arrows: same 56px #1B1B1BD9 circles as §2
```
**Query:** `module:'shop'`, `published`, prefer `discountPercent > 0` ordered by `discountPercent desc`; if fewer than 8 discounted products exist, backfill with newest shop posts so the rail is never half-empty — still 100% real rows. Prices always come from `priceAmount` server-side (your existing server-side-pricing rule is preserved; the client never computes a price).

---

### 8 · Tools — **Spiceworks "Tools & Apps"**
Spiceworks uses flat **colored SVG illustrations** (not line icons) above a **two-line, center-aligned** name, five across, with **no card chrome at all** — the tiles float on the section background. That restraint plus the deliberate two-line break (`Cloud\nHelp Desk`) is the whole look.

**5 tools (D4).** Four exist: `raid-calculator`, `nas-selector`, `nvr-selector`, `subnet-calculator`. You approved a **5th: the UPS / rack-power calculator** — so we get Spiceworks' true 5-up row with zero filler.

```
Band: bg var(--hp-bg), full-bleed, py 64px
h2 "ابزارها و اپلیکیشن‌ها"
desc "ابزارهای آنلاین و آسان IT. محاسبه ظرفیت، انتخاب سخت‌افزار و زیرشبکه — بدون نصب."
"مشاهده همه ابزارها ←" inline-start of the header row
Grid: 5 cols ≥1024px · 3 cols ≥640px · 2 cols mobile · gap 24px   ← Spiceworks 5-up
Tile: bg transparent, no border, no shadow   ← Spiceworks has zero chrome; keep it
      text-align center, py 32px px 16px, radius var(--hp-r-md)
  icon:  72×72 flat duotone SVG
  name:  18px/28px 700 var(--hp-ink), mt 16px
         text-wrap: balance; min-height: 56px   ← forces the 2-line Spiceworks break
  desc:  13px/22px var(--hp-ink-3), clamp 2, mt 4px   ← from toolRoutes.descriptionFa
  badge: "v2" / "جدید" — 11px 700, absolute top 8px inset-inline-end 8px,
         bg var(--hp-accent), color #FFF, radius 4px, px 6 py 2
  hover: bg var(--hp-surface), shadow var(--hp-shadow-card), icon scale(1.06), 200ms
  dark:  hover bg var(--hp-surface-2); icons keep their own colours (they are
         authored with a mid-tone palette that reads on both themes)
```

**Data — registry already exists, no new file.** `config/modules.config.ts → toolRoutes` is already typed and already carries everything the card needs:
```ts
{ slug, key, titleFa, title, href, descriptionFa, icon, color, version?, new? }
```
The section maps `toolRoutes` directly, so a tool appears here the moment its route ships and vanishes if removed. Order/visibility overridable via `SiteSetting` `home.tools.featured` (array of slugs). `app/tools/page.tsx` already consumes the same array for its JSON-LD, so the homepage and the tools index can never drift apart.

**Icons — authored for TechBox (D-decision: generate, don't commission).** 5 flat duotone SVGs, 72×72:

| Tool | Icon concept | Duotone fill |
|---|---|---|
| محاسبه فضای ذخیره‌ساز (RAID) | stacked disk platters, one highlighted as parity | `#0F4C81` base + `#E85D04` parity disk |
| انتخاب ذخیره‌ساز شبکه (NAS) | 4-bay chassis, front bays, activity LED | `#0F4C81` + `#4A9EDE` bays, `#E85D04` LED |
| انتخاب ذخیره‌ساز دوربین (NVR) | camera body + recording arc | `#0F4C81` + `#E85D04` rec dot |
| محاسبه زیرشبکه (Subnet) | node tree splitting into two branches | `#0F4C81` trunk + `#4A9EDE` branches |
| محاسبه توان UPS (new) | rack silhouette + battery/bolt | `#0F4C81` rack + `#E85D04` bolt |

Authored with **mid-tone fills only** (no pure white, no near-black), so a single asset works on both light and dark without a second set. Delivered as inline React SVG components in `design/icons/tools/`, `currentColor`-free so they stay stable regardless of theme. They match Spiceworks' illustration weight — flat fills, no strokes, no gradients.

**New tool — محاسبه توان UPS (`/tools/ups-calculator`).** Genuinely useful for your audience, and it feeds the shop.
```
Inputs:  server count + rated watts each · switch/NVR/misc load ·
         desired runtime (minutes) · rack PF (default 0.9) · redundancy (N / N+1)
Outputs: total load (W & VA) · recommended UPS VA rating ·
         estimated runtime curve · battery pack count for target runtime
Commerce hook: results link to matching `module:'shop'` products by VA range —
               same content→commerce move as Top Picks
```
Registry entry appended to `config/modules.config.ts → toolRoutes`:
```ts
{ slug:"ups-calculator", key:"ups-calculator",
  titleFa:"محاسبه توان UPS", title:"UPS Calculator",
  href:"/tools/ups-calculator",
  descriptionFa:"محاسبه توان و زمان پشتیبانی UPS بر اساس بار رک",
  icon:"ups" as const, color:"var(--ups)", new:true }
```
Needs a new `ups` icon in `design/icons` and a `--ups` colour var alongside the existing `--raid` / `--nas` / `--nvr` / `--subnet`. Built in Phase D with the rest of the tools work.

### 9 · Community — **Spiceworks "Community"**
Spiceworks stacks: intro copy → an embedded welcome video → a **compact 5-row topic list** where each row is `[Category] / [Title] / [Author][Age]` on three lines with no avatar and no excerpt. Very dense. That density is the signature.

```
h2 "انجمن تکباکس"  ·  "ورود به انجمن ←"
desc "به هزاران متخصص IT بپیوندید: بپرسید، پیشنهاد بدهید، و تجربه‌تان را به اشتراک بگذارید."

Layout ≥1024px: [featured 1fr] [topics 1fr] gap 40px   ·  RTL → featured RIGHT

Featured block (Spiceworks' video slot → our best-answer showcase):
  the single most-recent SOLVED topic (solved=true, acceptedCommentId != null)
  16:9 cover (Post.image) radius 12px
  title 20px/28px 700
  excerpt clamp 3, 15px/26px var(--hp-ink-3)
  accepted-answer strip: bg rgba(16,185,129,.08), border-inline-start 3px var(--hp-solved),
    radius 8px, p 12px:
      ✓ "پاسخ برتر" 12px 700 var(--hp-solved)
      answer text clamp 2, 14px/24px
      answerer avatar 24px + name 13px
  "کاوش در انجمن ←" link

Topic list (Spiceworks compact rows, ×5):
  row: py 14px, border-block-end 1px var(--hp-border), last:none
    line 1 — category 12px/900/ls 2px var(--hp-brand)   e.g. «امنیت»
    line 2 — title 16px/24px 700 var(--hp-ink), clamp 2
    line 3 — "{author}"  +  "{age}"  13px/20px var(--hp-ink-3), gap 8px
             age in Persian relative form: «۳ روز» / «۱ ماه»
    end-aligned stat cluster: 💬{comments} 👁{views}, 12px, var(--hp-ink-3)
    solved rows get a ✓ badge, 11px, var(--hp-solved), before the title
  hover: bg var(--hp-bg), title → var(--hp-brand)
```
**Query:** `module:'forum'`, `take: 6` — index 0 filtered to the newest solved one for the featured slot, the rest for the list. Comment counts + accepted-answer preview already exist in `findPosts()` in `lib/home-server.ts` — **no new query needed**, just consume `acceptedAnswer`.

---

### 10 · TechBox Family Comments — **Spiceworks "See what our community has to say"**
Your addition. Spiceworks' testimonial card is: a **large decorative quote-mark image inline before the text**, then the quote as plain running text, then a **circular avatar above** the handle, then "Member since {year}". Three across. No card border — they float on the section background.

```
Band: bg var(--hp-bg), py 64px
h3 "بعضی از نظرات خانوادهٔ تکباکس"  24px/32px 700, centered  ← Spiceworks uses h3, not h2
Grid: 3 cols ≥1024px · 1 col mobile (scroll-snap) · gap 40px
Item (chrome-less, exactly like Spiceworks):
  quote glyph: 44px » mark, var(--hp-brand) at 22% opacity,
               float inline-start, me 8px, translate-y -4px
  quote text: 15px/28px, var(--hp-ink-2), clamp 5 lines, no italics
              (Spiceworks does NOT italicize — keep it upright)
  avatar: 64px circle, mt 24px, block, mx auto? → NO: Spiceworks left-aligns it.
          RTL → align to the inline-start (right edge)
  handle: 16px/24px 700 var(--hp-ink), mt 12px      ← "#### Ethan6123" in the source
  meta:   13px/20px var(--hp-ink-3)                 ← "عضو از ۱۳۹۸"
  origin chip (TechBox addition, needed since we pull from many modules):
          11px, bg var(--hp-brand-tint), color var(--hp-brand), radius 4px, px 6 py 2
          «از انجمن» / «از مجله» / «از فروشگاه» / «از گاه‌شمار»
  whole item links to the parent post at the comment anchor: /{module}/{slug}#comment-{id}
```
**Query — random, real, and safe:**
```ts
// Pool: approved, non-deleted, substantive comments on live posts, from registered users
const pool = await prisma.comment.findMany({
  where: {
    status: "approved", deletedAt: null,
    authorId: { not: null },
    text: { not: "" },
    post: { published: true, deletedAt: null },
  },
  orderBy: { likes: "desc" },   // quality bias: liked comments first
  take: 60,
  select: { id:true, text:true, createdAt:true, likes:true,
    author:{ select:{ name:true, username:true, avatar:true, createdAt:true, verifiedType:true }},
    post:{ select:{ module:true, slug:true, title:true }}}
});
// + TimelineComment (separate table) merged into the same pool
// Filter: 80 ≤ text.length ≤ 400  → avoids "👍" and avoids walls of text
// Pick 3 with the same hourly seed used in §11, so SSR and hydration agree
```
Safety: only `status:'approved'`, only comments whose parent post is still published, author must be a registered non-banned user. Add an admin kill-switch `SiteSetting` `home.familyComments.blocklist` (array of comment IDs) so you can nuke a specific quote instantly without touching moderation.
`«عضو از {year}»` derives from `author.createdAt` — **note:** `User` has no `createdAt` column today. Small migration needed: `createdAt DateTime @default(now())` on `User`, backfilled from each user's earliest post date.

---

### 11 · More to Explore — **Tom's Guide `remnant--tabbed-`**
TG's structure here is precise: **1 landscape hero item spanning full width, then a 4-up row beneath it** (`--gridX: 4` on ≥900px, `2` on mobile). The hero has a **colored content panel** overlapping the image bottom.

Your mix, mapped:
| Slot | Content | Query |
|---|---|---|
| Hero | random news from the archive | `module:'news'`, random offset over the full archive (not just recent) |
| Card 1 | oldest video | `module:'media'`, `videoUrl != null`, `orderBy date asc`, `take 1` |
| Card 2 | oldest magazine article | `module:'blog'`, `orderBy date asc`, `take 1` |
| Card 3 | oldest forum topic *(filler so the 4-up row is complete)* | `module:'forum'`, `orderBy date asc` |
| Card 4 | oldest timeline event | `TimelineEvent`, `orderBy dateGr asc` |

```
Band: inset, bg var(--hp-inset), radius 24px, p 32px
h2 "بیشتر کاوش کنید"
Hero (TG landscape-hero):
  full-width 99vw-ish image, aspect 1200/500
  content panel overlaps the image bottom by 24px:
    bg var(--hp-brand), color #FFF, radius 16px, p 24px, mx 32px, position relative
    title 24px/32px 700
    strapline 15px/26px, color var(--hp-on-brand-mut), clamp 2
    byline: avatar 40px circle · "نوشتهٔ {name}" 13px 700 · role 12px · date 12px
  module eyebrow above the title: "اخبار" 12px/900/ls 2.5px, color #01FE9E-equivalent
       → TechBox uses var(--hp-accent) for legibility on primary
Row of 4: gap 20px
  card: image aspect 450/253 radius 8px
        module eyebrow 11px/900/ls 2px var(--hp-brand)
        title 16px/24px 700 clamp 3
        byline compact: 28px avatar + name 12px + date 12px
```
**Randomness without fakery:** pick the hero with a seeded random offset —
```ts
const total = await prisma.post.count({ where: { module:"news", published:true, deletedAt:null }});
const seed  = Math.floor(Date.now() / 3_600_000);        // rotates hourly
const skip  = total ? (seed * 2654435761) % total : 0;   // deterministic per hour
prisma.post.findMany({ where: {...}, skip, take: 1 });
```
Hourly rotation keeps it fresh, stays deterministic within the ISR window, and never fights the `unstable_cache` layer.

---

### 12 · About + Authors — **Tom's Guide `about-1`**
This is one widget in TG with two stacked halves. Here is TG's own CSS for the second half:
```css
#about-1 .bg-authors-dark      { background-color: var(--brand-color-1); }
#about-1 .bg-authors-carousel  { background-color: #e7f0ff; }
#about-1 .text-authors-heading { color: #011535; }
#about-1 .text-authors-card-primary   { color: #1e293b; }
#about-1 .text-authors-card-secondary { color: #64748b; }
#about-1 .experts-carousel-item__image-wrapper img { min-width:160px; min-height:160px; } /* 116px < 700px */
#about-1 .experts-carousel-item { min-width: 240px; }
```

**Half A — the manifesto (dark panel):**
```
bg var(--hp-brand) · radius 24px · py 80px · overflow hidden · color #FFF
EST badge: "تأسیس ۱۴۰۲" — 12px 700 ls 1.2px, border 2px solid rgba(255,255,255,.9),
           radius 999px, px 16 py 4, centered, mb 32px
Headline: 26px mobile / 60px desktop, weight 500, line-height 32/60, centered, max-w 4xl
  «مرجع روزانهٔ شما در فناوری اطلاعات.»
Divider: h 2px, mb 12px, gradient white→transparent
Body: 20px / 24px desktop, weight 300, line-height 32, centered, #FFF
  «تکباکس یک جامعهٔ آنلاین و بازارگاه است که در آن متخصصان فناوری اطلاعات
   می‌توانند مشاوره بگیرند، شبکه‌های خود را مدیریت کنند، و محصولات و خدمات IT را
   کشف و خریداری کنند.»
   ← your requested Spiceworks-style positioning line, in Persian
3 feature cards: grid md:grid-cols-3, gap 32px, max-w 3xl centered, mb 64px
  card: border 1px solid #FFF, radius 16px, p 24px, bg transparent, backdrop-blur
    title 18px/28px 700 · body 14px/20px
    ① «مستقل»  — «بدون جانب‌داری، بدون رانت»
    ② «آزمایش‌شده» — «توصیه‌های ما بر پایهٔ تست واقعی سخت‌افزار است»
    ③ «انسانی»  — «نوشتهٔ کارشناسان، نه الگوریتم‌ها»
```

**Half B — "سازندگان تکباکس" (light carousel):**
```
bg var(--hp-inset) · px 24/48px · (sits inside the same rounded container)
label: p 32px, 16px mobile / 30px desktop, weight 600, color var(--hp-ink)
       «سازندگان تکباکس این‌ها هستند»
Carousel: display flex, gap 20px, overflow-x auto, snap-x mandatory, scroll-smooth, pb 8px
Author card:
  min-width 240px, flex column, radius 16px, my 32px, px 32px, text-center, no-underline
  avatar: 116px mobile / 160px desktop, circle, object-cover, mb 24px
  name  20px/28px 700 var(--hp-ink-2)
  role  12px/16px 700 uppercase-equivalent, mb 16px   ← User.roleFa
  bio   14px/20px var(--hp-ink-2), mb 16px, clamp 2   ← User.bio || User.job
  verified tick beside the name when User.verifiedType is set
       (content=blue / org=purple / user=gold), tooltip = User.verifiedLabel
  "بیشتر بخوانید" — mt auto, 12px/16px 700, var(--hp-brand)
  hover: translateY(-4px), 300ms; name → var(--hp-accent)
  → links to /author/{username}  (route already exists)
```
**Query:**
```ts
prisma.user.findMany({
  where: { status:"active", posts: { some: { published:true, deletedAt:null } } },
  orderBy: { posts: { _count: "desc" } },
  take: 12,
  select: { name:true, username:true, roleFa:true, role:true, job:true, bio:true,
            avatar:true, verifiedType:true, verifiedLabel:true, _count:{ select:{ posts:true }}}
})
```
Only users who have actually published something appear — the list can't contain a ghost author. `TeamMember`/`TeamSection` stays reserved for the About page; the homepage uses real authors.

---

### 13 · Footer — Spiceworks
Multi-column dark, unchanged from v1 of this spec: 4 link columns + brand column, `bg var(--hp-brand-ink)`, 13px links at `#ffffff99` → `#FFF` on hover, legal strip with 1px `rgba(255,255,255,.12)` divider.
## 3. Responsive Matrix

| Section | < 640 | 640–899 | ≥ 900 | ≥ 1280 |
|---|---|---|---|---|
| Magazine | lead + list stacked | same | 578fr / 1fr split | same, container 1280 |
| Video rail | 172px cards, no arrows | 172px | 200px + 56px arrows | 200px |
| Insights + Newsletter | stacked, newsletter last | stacked | 2fr / 1fr | 2fr / 1fr |
| Finder | chips grid-cols-2, p 24px | 2 cols | flex row, p 20/45/70 | same |
| Top Picks | gridX 1.4 (peek) | 1.4 | 3 | 3 |
| Timeline | rail, 260px cards | rail | rail | rail |
| Deals | gridX 2 | 2 | 4 | 4 |
| Tools | 2 cols | 3 cols | 5 cols | 5 cols |
| Community | stacked | stacked | 1fr / 1fr | 1fr / 1fr |
| Family Comments | 1 col snap | 2 cols | 3 cols | 3 cols |
| More to Explore | hero + gridX 2 | 2 | hero + 4 | hero + 4 |
| Authors | 116px avatars, scroll | 116px | 160px, scroll | 160px |

**Container:** `max-width: 1280px`, `padding-inline: 16px / 24px / 32px`. Full-bleed bands (Timeline §6, Tools §8, Footer §13) break out to `100vw` with an inner 1280 container. Post-D3 the sidebar no longer steals width, so 1280 is real at 1280.

---


---

## 4. Empty-state thresholds (Rule 1 enforcement)

Every section component checks its slice **before rendering anything**. Below threshold → `return null`. No skeleton, no placeholder, no reserved height.

| § | Section | Minimum to render | Degraded behaviour above minimum |
|---|---|---|---|
| 0 | Announcement | `enabled === true` AND inside schedule window | — (binary) |
| 1 | Magazine | **1** blog post | 1 post → lead only, no list. 2–4 → lead + short list. 5+ → full |
| 2 | Video | **3** media posts w/ `videoUrl` | rail just has fewer cards; arrows hide < 4 |
| 3 | Insights | **1** news post | 1 → single item, no divider. Newsletter card always renders (it needs no data) |
| 4 | Finder | always renders | chips come from `SiteSetting`; falls back to 3 hardcoded real category queries |
| 5 | Top Picks | **1** linked review w/ published product | 1–2 cards, grid re-flows. 0 → unmount |
| 6 | Timeline | **4** `TimelineEvent` | fewer cards in the rail |
| 7 | Deals | **4** shop posts | if < 4 discounted, backfill w/ newest shop posts (still real) |
| 8 | Tools | **1** entry in `toolRoutes` | grid re-flows; always ≥ 4 in practice |
| 9 | Community | **3** forum posts | featured slot needs 1 solved post; if none, falls back to most-commented |
| 10 | Family Comments | **3** qualifying comments | < 3 → unmount (a 1-testimonial row looks broken) |
| 11 | More to Explore | **1** hero + **2** cards | row re-flows; hero required |
| 12 | Authors | **4** users w/ published posts | carousel needs 4 to feel like a carousel |
| 13 | Footer | always renders | static |

**Implementation pattern — use this exact shape in every section:**
```tsx
export function MagazineSection({ posts }: { posts: HomeCard[] }) {
  if (!posts?.length) return null;              // Rule 1: no data → no section
  const [lead, ...list] = posts;
  return ( /* ... */ );
}
```

**Do NOT** render a section wrapper, heading, or `<section>` element before the guard. The guard is the first statement.

---

## 5. Accessibility requirements

Non-optional. Checked in Phase G.

| Area | Requirement |
|---|---|
| Landmarks | One `<main id="main-content">`. Each section is `<section aria-labelledby="...">` pointing at its `<h2>`. |
| Heading order | `h1` (visually hidden, site name) → `h2` per section → `h3` per card. Never skip a level. |
| Contrast | Body text ≥ 4.5:1. Large/bold ≥ 3:1. **Orange `#E85D04` on white is 3.9:1 — bold ≥14px only, never body text.** Blue `#0F4C81` on white is 8.6:1 (safe). |
| Carousels | Native scroll + `scroll-snap`. Arrow buttons have `aria-label`. Keyboard reachable. Never `overflow: hidden` without a scroll mechanism. |
| Motion | Wrap all transforms/animations in `@media (prefers-reduced-motion: no-preference)`. The ticker, carousel auto-scroll, and pulse dot must fully stop under `reduce`. |
| Focus | Visible focus ring on every interactive element; `:focus-visible`, never `outline: none` without a replacement. |
| Images | Real `alt` from `Post.title`. Decorative disks in the Finder get `aria-hidden="true"`. |
| Forced colors | Gradient-clipped text falls back via `@media (forced-colors: active)`. |
| Language | Page is `lang="fa"`. Latin-script runs (model numbers) get `<span lang="en">` so screen readers switch voice. |

---

## 6. Performance budget

| Metric | Target | Why it's at risk here |
|---|---|---|
| **CLS** | < 0.05 | 14 sections with images. **Every `<img>` needs explicit `width`/`height` or `aspect-ratio`.** |
| **LCP** | < 2.5s | LCP element is the §1 Magazine lead image. Give it `priority` / `loading="eager"`; every other image is `loading="lazy"`. |
| **First-paint JS** | no increase | All sections are **Server Components** by default. Only these are `"use client"`: Finder (form state), Video rail (player), Announcement (dismiss), Newsletter (submit), carousel arrows. |
| **DB queries** | 1 cached fetch | Everything goes through `getHomeData()`. Zero per-section fetching. Zero client fetching on first paint. |
| **Fonts** | no new fonts | Kalameh is already loaded. Do not add a font. |

**Image rules:** use `next/image` with `sizes` matching the responsive matrix. Source aspect ratios are recorded per section (SW lead = 578×325, SW thumb = 143×95, TG card = 450×253).
