# TechBox Homepage Upgrade — Agent Handoff & Execution Manual

> **If you are an AI agent picking this up mid-flight: read this file top to bottom before touching anything.**
> Then open `01-STATE.md` to find out what is already done and what to do next.

---

## Document set

| File | Purpose | Read when |
|---|---|---|
| **`00-START-HERE.md`** ← you are here | Orientation, rules, environment, repo facts | First, always |
| **`01-STATE.md`** | Live progress ledger. **Single source of truth for "what's next".** | Every session, before + after work |
| **`02-DESIGN-SPEC.md`** | Full visual spec for all 14 sections | When building any section |
| **`03-DATA-CONTRACTS.md`** | Every Prisma query, type, migration, seeding rule | When touching data |
| **`04-PHASES.md`** | Task-level breakdown A→G with acceptance criteria | To pick up the next task |
| **`05-DECISIONS.md`** | Locked decisions + rationale + rejected options | Before proposing a change |
| **`06-VERIFICATION.md`** | How to prove work is correct before marking done | End of every task |

---

## 1. What this project is

**TechBox (تکباکس)** is a Persian, RTL technology platform for IT professionals — infrastructure, networking, servers, storage, security. It is not a blog. It is a content + community + commerce hub with a native checkout.

**The upgrade:** rebuild the homepage (`app/page.tsx`, currently rendering an empty `<main>`) as 14 sections whose visual design is closely modelled on **Spiceworks** and **Tom's Guide**, adapted to Persian RTL, backed 100% by live database content.

**Who decided what:** the site owner. All decisions are locked in `05-DECISIONS.md`. Do not relitigate them; if you believe a decision is wrong, write your objection into `01-STATE.md` under **Open Questions** and continue with the decision as written.

---

## 2. Non-negotiable rules

These are owner mandates. Violating any of them means the work gets rejected.

1. **NO FAKE DATA. EVER.**
   No lorem ipsum. No placeholder products. No invented prices, names, ratings, or comments. Every card on the page renders a real row from the production database. If a section has insufficient data, **the section renders `null` and disappears** — it never renders a skeleton, a "coming soon", or dummy content.

2. **NO HERO SECTION.** The owner explicitly removed it. Do not add one back under any name ("banner", "featured", "masthead").

3. **Visual fidelity to the source is the point.** The owner said cards must look "similar or EXACTLY like" Spiceworks / Tom's Guide cards. Real measured CSS values from those sites are recorded in `02-DESIGN-SPEC.md`. Use them. Do not "improve" the design or substitute your own taste.
   *Copy:* layout, spacing, type scale, card anatomy, interaction.
   *Do not copy:* their images, their icons, their marketing copy. Those are made fresh for TechBox.

4. **RTL is the default, not an afterthought.** `dir="rtl"` is set on `<html>`. Use **logical CSS properties only** — `ps-*`/`pe-*`, `ms-*`/`me-*`, `border-s`/`border-e`, `start-*`/`end-*`. Never `pl-*`, `pr-*`, `left-*`, `right-*` for layout. All arrows point **←** (left) for "forward". Carousels scroll right-to-left.

5. **Light AND dark mode both ship.** Dark is not a stretch goal. Every token has a `.dark` value. Every section is checked in both.

6. **Additive only.** The `--hp-*` token namespace is new and appended. Do not rename, remove, or repurpose an existing CSS variable, component, or export. 575+ files depend on them.

7. **Persian numerals for prices/dates/counts. Latin for models/RAID/specs.** See `05-DECISIONS.md` D9. Long-form prices only (`۱۲٬۴۰۰٬۰۰۰ تومان`), never `۱۲.۴ میلیون`.

8. **Update `01-STATE.md` before you stop.** If you run out of context, crash, or finish a task, the ledger must reflect reality. An agent after you depends on it.

---

## 3. Repository facts (verified against `main`)

Do not assume — these were read from the actual repo. Where a previous version of this plan was wrong, the correction is marked ⚠️.

### Stack
| Thing | Value |
|---|---|
| Framework | Next.js **16.2.10** (App Router) |
| React | **19.2.7** |
| TypeScript | **6.0.3** |
| Styling | Tailwind CSS **v4** (CSS-first config, `@theme inline`) |
| UI kit | shadcn/ui (55 components in `components/ui/`) |
| ORM | Prisma **6.19.3** → Neon PostgreSQL |
| Theme | `next-themes` 0.4.6 |
| Video | `hls.js` 1.6.16 |
| Icons | `lucide-react` 1.23.0, wrapped in `design/icons.tsx` |
| Validation | `zod` 3.25.76 |
| Package manager | **pnpm 10.12.1** |
| Repo | `https://github.com/hnmodeq/techbox` |

### ⚠️ Corrections to earlier assumptions
1. **Font is Kalameh, NOT Vazirmatn.** `--font-kalameh-stack: var(--font-kalameh), "KalamehWebFaNum", Vazirmatn, system-ui, Tahoma, sans-serif`. Vazirmatn is only a 3rd-level fallback.
2. **Global CSS is `design/globals.css`**, not `app/globals.css`. The latter does not exist.
3. **Dark mode already works.** `providers/theme.provider.tsx` → `next-themes`, `attribute="class"`, `storageKey="takbox-theme"`, `defaultTheme="system"`, `enableSystem`. `design/globals.css` has `@custom-variant dark (&:is(.dark *))` and a complete `.dark {}` block. **Hook into it. Do not rebuild it.**
4. **The live palette is fully achromatic** — `oklch(0.205 0 0)`, zero chroma everywhere. The blue `#0F4C81` has never shipped. This upgrade introduces the site's first chromatic identity.
5. **`app/page.tsx` renders an empty `<main>`.** It computes `ROW_COMPONENTS` and `visibleRows`, then returns a `<main>` with no children. All existing row components (`MagazineRow`, `ShopRow`, `ForumRow`, `ReviewRow`, `VideoReelsRow`, `HomeTimelineRow`, `HeroSection`, `CtaSection`, `WhyTechBox`, `ToolsShowcase`, `DownloadRow`) are **dead code**. Clean slate.
6. **There are 4 tools, not 6.** A typed registry already exists at `config/modules.config.ts → toolRoutes`. A 5th (UPS calculator) is being added by this project.
7. **A z-index token system exists** at `design/z-index.ts`. Use it. Relevant: `sidebarBackdrop: 40`, `sidebar: 50`, `sticky: 30`, `modal: 900`.
8. **Formatting helpers already exist** — do NOT create duplicates:
   - `lib/date-format.ts` → `toFa(n)`, `formatRelativeDate(d)`, `formatRelativeTime(d)`
   - `lib/jalali.ts` → `gregorianToJalali`, `getJalaliDateStringPersian`, `getPersianMonthName`, +13 more
   - `lib/post-date.ts` → `formatPostDateFa`, `publicPostDateWhere`
   - `lib/currency.ts` → `calculateFinalPriceForPost`, `getCurrencyRates`, `calculateFinalTomanPrice`
   - **Only `faPrice()` is genuinely missing.** Add it to `lib/date-format.ts`'s sibling, do not fork the others.

### Directory map (what matters here)
```
app/
  page.tsx                    ← THE TARGET. Currently empty <main>.
  layout.tsx                  ← RootLayout, dir="rtl" lang="fa", renders <LayoutShell>
  admin/                      ← 33 admin sections; add 2 new ones (announcement, review-linking)
  tools/                      ← raid-calculator, nas-selector, nvr-selector, subnet-calculator
                                 (+ ups-calculator to be built)
  search/                     ← existing search page; Finder section (§4) submits here
  api/
    home/route.ts
    search/route.ts
    newsletter/subscribe/route.ts
    comments/route.ts
components/
  layout/
    LayoutShell.tsx           ← ⚠️ MODIFIED IN PHASE B (floating sidebar)
    techbox-app-sidebar.tsx   ← ⚠️ MODIFIED IN PHASE B
    techbox-news-sidebar.tsx  ← reference implementation for "floating" pattern
    Footer.tsx
    site-header.tsx
  ui/                         ← 55 shadcn components incl. sidebar.tsx (has variant="floating")
config/
  modules.config.ts           ← toolRoutes registry (add ups-calculator here)
  sidebar.config.ts
design/
  globals.css                 ← ⚠️ ADD --hp-* TOKENS HERE (Phase A)
  icons.tsx                   ← central icon map; IconName type
  z-index.ts                  ← use these tokens, don't hardcode z-values
features/
  home/
    components/               ← all dead code; delete in Phase G
    lib/home-data.tsx         ← HomeDataProvider, useHomeModule, useHomeTicker
  <module>/components/        ← blog, forum, media, news, review, shop, timeline, tools...
lib/
  home-server.ts              ← ⚠️ PRIMARY DATA FILE. Extend here, not elsewhere.
  module-config.ts            ← getModuleConfig, ModuleSlug, enable/order/visibility
  date-format.ts jalali.ts post-date.ts currency.ts   ← reuse, don't duplicate
  search.ts search-log.ts newsletter.ts settings.ts
prisma/
  schema.prisma               ← 37 models
  migrations/
tests/
  e2e/{smoke,auth,checkout}.spec.ts
  unit/*.test.ts
```

### Commands
```bash
pnpm install
pnpm dev                  # next dev
pnpm build                # next build
pnpm lint                 # eslint .
pnpm typecheck            # next typegen && tsc --noEmit --pretty false
pnpm test                 # vitest run
pnpm test:e2e             # playwright test
pnpm test:smoke           # playwright test tests/e2e/smoke.spec.ts
pnpm db:migrate           # prisma migrate dev
pnpm db:migrate:deploy    # prisma migrate deploy
pnpm prisma:generate
pnpm check:all            # tsx scripts/checks/all.ts  (content + storage + db health)
```

**Before marking any task done:** `pnpm typecheck && pnpm lint && pnpm test`.

---

## 4. The 14 sections, in final order

| # | Key | Persian | Visual source | Phase |
|---|---|---|---|---|
| 0 | `announcement` | نوار اطلاعیه | Spiceworks announcement strip | G |
| 1 | `magazine` | مجله تکباکس | **Spiceworks "Articles"** | C |
| 2 | `video` | ویدیوهای تکباکس | **TG "Quick takes"** | C |
| 3 | `insights` | آخرین بینش‌ها | **TG `live-blog` + `newsletter-sidebar`** | C |
| 4 | `finder` | دنبال چی می‌گردی؟ | **TG `product-finder-1`** | D |
| 5 | `top-picks` | انتخاب‌های برتر ما | **TG `best-picks--tabbed-`** | E |
| 6 | `timeline` | گاه‌شمار تکنولوژی | **TechBox original** | C |
| 7 | `deals` | بهترین پیشنهادهای امروز | **TG `deals`** | D |
| 8 | `tools` | ابزارها و اپلیکیشن‌ها | **Spiceworks "Tools & Apps"** | D |
| 9 | `community` | انجمن تکباکس | **Spiceworks "Community"** | C |
| 10 | `family-comments` | نظرات خانوادهٔ تکباکس | **Spiceworks testimonials** | F |
| 11 | `more-to-explore` | بیشتر کاوش کنید | **TG `remnant--tabbed-`** | F |
| 12 | `authors` | سازندگان تکباکس | **TG `about-1`** | F |
| 13 | `footer` | فوتر | Spiceworks dark multi-column | G |

Global chrome (top bar, tick bar, news sidebar) stays in `LayoutShell`. The **main sidebar becomes floating** in Phase B.

---

## 5. How to work on this

### Session start checklist
1. Read `01-STATE.md` → find the first task not marked ✅.
2. Read that task's entry in `04-PHASES.md` → acceptance criteria.
3. Read the relevant section of `02-DESIGN-SPEC.md` and `03-DATA-CONTRACTS.md`.
4. Confirm any gate listed in the task is satisfied (some tasks need owner approval first — **do not proceed past a gate without it**).

### Session end checklist
1. Run `pnpm typecheck && pnpm lint && pnpm test`.
2. Update `01-STATE.md`: mark the task, record files touched, note anything surprising.
3. If you hit something ambiguous, log it under **Open Questions** in `01-STATE.md` rather than guessing.

### Git
- One PR per phase. Branch naming: `feat/homepage-phase-a`, `feat/homepage-phase-b`, …
- **Two PRs need separate owner review** because they affect the whole site, not just `/`:
  - **Phase B — floating sidebar** (touches every route)
  - **Phase E — review module enforcement** (touches admin + API)
- Never force-push to `main`. Never commit `.env`.

### Owner gates — STOP and ask
| Gate | Where |
|---|---|
| DB audit report approved | Phase B, before any data migration |
| Floating-sidebar PR reviewed | Phase B, before merge |
| Review triage 100% complete | Phase E, before `NOT NULL` migration |
| Content seeding plan approved | Phase B, before creating any content |

---

## 6. Credentials & environment

The owner supplied a GitHub PAT for read access to `hnmodeq/techbox`. **It is not stored in these files.** If you need it, ask the owner — do not reconstruct it from conversation history, and never write it into a file, commit, or log.

Environment variables the app needs (in `.env`, never committed): `DATABASE_URL`, `DIRECT_URL`, Supabase storage keys, Upstash Redis, Sentry DSN, Zarinpal merchant ID, JWT secret. If you cannot reach the DB, **stop and report** — do not scaffold with mock data to "unblock" yourself. That violates Rule 1.

---

## 7. Glossary

| Term | Meaning |
|---|---|
| **TG** | Tom's Guide (tomsguide.com) |
| **SW** | Spiceworks (spiceworks.com) |
| **Module** | A content type: `blog`, `news`, `media`, `shop`, `forum`, `review`, `download`, `tools`, `timeline`. All except `tools`/`timeline` live in the universal `Post` table. |
| **Inset band** | TG's `flw-area-inset` — a full-width tinted panel with rounded corners containing a section |
| **Eyebrow / kicker** | The small uppercase category label above a headline |
| **`--hp-*`** | The new homepage token namespace introduced by this project |
| **Section renders null** | The React component returns `null` when data is insufficient — no DOM, no height, no layout shift |
| **Gate** | A checkpoint requiring owner approval before proceeding |
