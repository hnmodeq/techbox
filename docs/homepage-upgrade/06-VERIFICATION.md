# 06 — VERIFICATION

> How to prove work is correct before marking a task ✅ in `01-STATE.md`.
> "It renders" is not done. Everything below is checkable.

---

## 1. Gate: run before every commit

```bash
pnpm typecheck     # next typegen && tsc --noEmit --pretty false
pnpm lint          # eslint .
pnpm test          # vitest run
```
All three must be clean. No `@ts-ignore` to get past typecheck. No disabled lint rules without a comment explaining why.

Before a PR:
```bash
pnpm build         # catches Server/Client Component boundary errors typecheck misses
pnpm test:e2e      # playwright
```

---

## 2. Rule 1 audit — "no fake data"

The single most important check. Run it on every section you build.

```bash
# 1. Hunt for literal placeholder content
grep -rniE "lorem|ipsum|placeholder|dummy|sample text|foo bar|test product|TODO: replace" \
  features/home/ app/page.tsx

# 2. Hunt for hardcoded Persian content that should come from the DB
grep -rnE "عنوان نمونه|محصول تست|کاربر نمونه|متن آزمایشی" features/home/

# 3. Hunt for hardcoded prices/ratings
grep -rnE "priceAmount\s*[:=]\s*[0-9]|rating\s*[:=]\s*[0-9]" features/home/components/sections/
```
All three must return **nothing**.

**Manual checks per section:**
- [ ] Every visible string is either from the DB, a section label (`"مجله تکباکس"`), or a `SiteSetting`
- [ ] No array literal of card objects anywhere in the component
- [ ] With an empty data slice, the section renders **nothing at all** — not a heading, not a wrapper, not a 1px div

**Proving the empty state:**
```tsx
// temporarily in the section file
return <MagazineSection posts={[]} />;
// Expected: absolutely no DOM output. Verify in the Elements panel.
```

---

## 3. RTL verification

```bash
# Physical properties are a bug in this codebase. This must return nothing:
grep -rnE 'class(Name)?="[^"]*\b(pl-|pr-|ml-|mr-|left-|right-|text-left|text-right|border-l|border-r)[0-9a-z]' \
  features/home/components/
```
Allowed exceptions: `left-1/2` for centering transforms, and `right-`/`left-` inside a `rtl:`/`ltr:` variant.

**Manual, in the browser:**
- [ ] `<html dir="rtl">` present
- [ ] Section headings sit on the **right**; "see all" links on the **left**
- [ ] Card grids fill **right → left**
- [ ] Carousels: first item on the right; the "next" arrow moves content rightward
- [ ] All forward arrows render **←**
- [ ] Accent border rails on the **right** edge
- [ ] No horizontal scrollbar at 375 / 768 / 1280 / 1440

```js
// paste in console — detects overflow culprits
[...document.querySelectorAll('*')]
  .filter(e => e.scrollWidth > document.documentElement.clientWidth)
  .forEach(e => console.log(e.className, e.scrollWidth));
```

---

## 4. Dark mode verification

For **every** section, in both themes:

- [ ] Toggle theme — section remains fully legible
- [ ] No invisible text (esp. the Finder's gradient-clipped heading)
- [ ] No pure-white product images glaring — `.dark img` brightness knock-down applied
- [ ] Borders visible in dark (not black-on-black)
- [ ] Brand-filled panels have the `rgba(255,255,255,.08)` hairline so edges read
- [ ] Shadows are not invisible grey smudges
- [ ] Orange/red lifted to the dark variants (`#FF7A29`, `#F87171`)

```js
// force each theme in console
localStorage.setItem('takbox-theme','dark');  location.reload();
localStorage.setItem('takbox-theme','light'); location.reload();
```

**Contrast spot-checks** (DevTools → Inspect → Accessibility):
| Pair | Min |
|---|---|
| Body text on surface | 4.5:1 |
| Card title on surface | 4.5:1 |
| Muted meta text (`--hp-ink-3`) on surface | 4.5:1 |
| White on `--hp-brand` | 4.5:1 |
| **Orange text on white** | **3:1 — bold ≥14px ONLY** |

---

## 5. Visual fidelity to source

For each section, open the reference and compare side by side.

| § | Reference |
|---|---|
| 0, 1, 8, 9, 10, 13 | `https://www.spiceworks.com/` |
| 2, 3, 4, 5, 7, 11, 12 | `https://www.tomsguide.com/` (needs a browser UA; blocks plain fetch with 403) |

**Checklist per section:**
- [ ] Grid column count matches at each breakpoint
- [ ] Card aspect ratios match (SW lead 578×325, SW thumb 143×95, TG card 450×253)
- [ ] Type scale hierarchy matches — title vs strapline vs byline
- [ ] Spacing rhythm matches (gaps, padding, section separation)
- [ ] Card anatomy matches: which elements exist, in what order
  - TG deals card has **no strapline and no byline** — that restraint is the design
  - SW tool tiles have **no card chrome** until hover
  - SW testimonials are **upright, not italic**
- [ ] Hover behaviour matches
- [ ] Source-measured values used verbatim where recorded in `02-DESIGN-SPEC.md`

---

## 6. Data correctness

- [ ] Every query includes `published: true`, `deletedAt: null`, and `publicPostDateWhere()`
- [ ] No query runs on the client during first paint (Network tab: no XHR/fetch for content on load)
- [ ] Exactly **one** DB fetch per cache window
- [ ] New data blocks are **sequential**, not `Promise.all` (P2024)
- [ ] Every new block is try/caught → empty array, never a thrown error
- [ ] Prices via `calculateFinalPriceForPost()` — server-side only

```bash
# no client-side content fetching in sections
grep -rn "useEffect.*fetch\|useSWR\|useQuery" features/home/components/sections/
# → should return nothing
```

**Hydration check:** open the console on `/`. Zero warnings. Any "Text content did not match" means a random/date value differs between server and client → you used `Math.random()` or raw `Date.now()` instead of `seededIndex()`.

---

## 7. Accessibility

```bash
npx @axe-core/cli http://localhost:3000 --exit
```
Zero violations.

Manual:
- [ ] Tab through the whole page — focus always visible, order is logical (RTL: right → left)
- [ ] `Escape` closes the sidebar; focus returns to the trigger
- [ ] Heading order: one `h1`, then `h2` per section, `h3` per card — no skipped levels
- [ ] Carousel arrows have `aria-label`; rails keyboard-scrollable
- [ ] Decorative elements (Finder disks, quote glyphs) are `aria-hidden="true"`
- [ ] Images have real `alt` from `Post.title`
- [ ] Latin runs wrapped in `<span lang="en">`

```js
// heading order audit
[...document.querySelectorAll('h1,h2,h3,h4')].map(h => h.tagName + ' ' + h.textContent.trim().slice(0,50))
```

**Reduced motion:** DevTools → Rendering → `prefers-reduced-motion: reduce`. Ticker stops, carousels stop auto-scrolling, pulse dot stops, hover transforms disabled.

---

## 8. Performance

```bash
pnpm build && pnpm start
npx lighthouse http://localhost:3000 --view --preset=desktop
npx lighthouse http://localhost:3000 --view   # mobile
```

| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| **CLS** | **< 0.05** |
| LCP | < 2.5s |

**CLS is the main risk** — 14 sections full of images.
- [ ] Every `<img>` / `next/image` has explicit `width`+`height` or `aspect-ratio`
- [ ] The announcement bar reserves **no** height when disabled
- [ ] Fonts don't cause a visible swap (Kalameh already preloaded)
- [ ] Carousels don't reflow after JS loads

```js
// live CLS logger
new PerformanceObserver(l => l.getEntries()
  .filter(e => !e.hadRecentInput)
  .forEach(e => console.log('CLS', e.value, e.sources))
).observe({type:'layout-shift', buffered:true});
```

**Client bundle:** only these may be `"use client"` — Finder, Video rail, Announcement, Newsletter form, carousel arrows. Everything else is a Server Component.
```bash
grep -rln '"use client"' features/home/components/sections/
```

---

## 9. Regression (Phase B5 floating sidebar)

Highest-risk change. At **1280** and **1440**, both themes:

| Route | Checks |
|---|---|
| `/` | Sidebar closed by default; full-width content |
| `/blog` `/news` `/media` | Sidebar open by default; content not obscured |
| `/shop` | Product grid column count unchanged |
| `/forum` `/timeline` `/tools` | No overflow, no clipped content |
| `/admin` | **Unaffected** — bypasses `LayoutShell` |

- [ ] News sidebar still opens and sits **above** the main sidebar
- [ ] Both sidebars open simultaneously → no z-index conflict
- [ ] Mobile (375px): `MobileBottomNav` unchanged, sidebar is a sheet
- [ ] `pnpm test:e2e` passes

---

## 10. Pre-merge checklist

- [ ] §1 Rule-1 audit clean
- [ ] §3 RTL clean
- [ ] §4 both themes verified
- [ ] §5 compared against the live source
- [ ] §6 data correctness verified
- [ ] §7 axe clean
- [ ] §8 Lighthouse targets met
- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green
- [ ] `01-STATE.md` updated
- [ ] No `.env`, secrets, or PAT in the diff
- [ ] No `console.log` left behind
- [ ] No commented-out code blocks

---

## 11. When something is wrong

**Do not paper over it.**

| Situation | Correct action |
|---|---|
| Section has no data | Let it render `null`. That is the design. Do **not** seed fake rows to make it appear. |
| Query is slow | Add an index. Do **not** parallelise into `Promise.all` (P2024). |
| Design value looks wrong | Re-check the source. `02-DESIGN-SPEC.md` values are measured, not guessed. |
| Spec contradicts the repo | The **repo** wins. Note the discrepancy in `01-STATE.md`. |
| A decision seems wrong | Log an objection in `01-STATE.md`, proceed as written, raise it with the owner. |
| You're out of context | Update `01-STATE.md` **first**, then stop. A clean handoff beats a half-finished task. |
