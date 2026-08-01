# Homepage §3 — "آخرین خبر امروز" + Newsletter · work order

Handoff spec for the next agent. Everything below was verified against the
repo at commit `121e117`; where a request rested on a wrong assumption that
is called out explicitly rather than silently reinterpreted.

---

## 1. Files in scope

| Path | Role |
|---|---|
| `features/home/components/sections/InsightsSection.tsx` | The section. Story card, comment rail, newsletter slot. |
| `features/home/components/sections/NewsletterCard.tsx` | Newsletter panel (right column). |
| `lib/home-sections.ts` → `getLatestInsights()` | Server query that picks the story and its comments. |
| `features/home/components/primitives/SectionHeader.tsx` | Shared header. Hiding the action = omit `href`. |
| `components/layout/LayoutShell.tsx` | Owns news-sidebar open state (`newsOpen`). |
| `components/layout/techbox-news-sidebar.tsx` | The sidebar. Already 24h-scoped. |
| `components/layout/news-sidebar-card.tsx` | Sidebar card. **Not** clickable — see §7. |
| `app/admin/posts/new/page.tsx` | Post editor. Excerpt zod rule at line ~118. |
| `app/terms/page.tsx` | Terms. Content lives in `SiteSetting["terms.content"]` as HTML. |
| `features/comment/components/CommentSection.tsx` | Reusable comment UI. |

Existing helpers to reuse — do not reinvent:

- `components/ui/relative-date.tsx` → `<RelativeDate date label />`. Renders
  the relative ladder ("۳ ساعت پیش") and puts the absolute Jalali date in a
  tooltip. Covers every "make it relative + add a tooltip" item below.
- `components/ui/remote-image.tsx` → `<RemoteImage src alt sizes priority />`.
- `components/ui/tooltip.tsx` → base-ui `Tooltip` / `TooltipTrigger render={…}`.
- `components/ui/dialog.tsx` for the terms modal.

---

## 2. Corrections to the brief — read before starting

### 2.1 News DO have slugs

> "news have no slugs so the news card can't be clickable"

Not the case. The database dump contains `news-01` … `news-11`,
`Post.slug` is a required column, and `app/news/[slug]/page.tsx` exists.
`InsightsSection` **already** wraps the image and title in
`<Link href={`/${story.module}/${story.slug}`}>`.

The real defect is the *affordance*: only the `<h3>` reacts to hover, so the
image and excerpt read as dead. Fix that (§7), not the routing.

Separately, `components/layout/news-sidebar-card.tsx` genuinely has **no
`<Link>` at all** — that card really is unclickable. Different component,
still worth fixing.

### 2.2 The sidebar is already 24h-scoped

Confirmed: `techbox-news-sidebar.tsx` filters on
`now - date <= TWENTY_FOUR_HOURS`. The button label
"اخبار ۲۴ ساعت گذشته" will be accurate. No query change needed.

### 2.3 "Latest news" conflicts with the comment rail — decision required

`getLatestInsights()` currently picks the **most-commented** story of the
past week, falling back to the newest.

Switching to strictly-newest, at ~4 posts/hour, means the featured story
will almost always have **zero comments**. The comment rail, the new
"all comments" link and the new comment box would then be empty in the
common case — immediately after being built.

Two options; **the owner has not yet chosen**:

- **A — strictly newest.** Matches "آخرین خبر امروز" literally. Comment rail
  usually empty. Consider hiding the rail when `comments.length === 0` so the
  layout does not collapse.
- **B — newest among today's stories that have ≥1 approved comment, else
  newest overall.** Title stays honest, section stays populated.

**Recommendation: B.** Implement A only if the owner confirms they want a
usually-empty discussion area.

Whichever is chosen, also update the section `description`, which currently
claims selection is by comment count.

---

## 3. Newsletter panel

Backend is **untouched**. `POST /api/newsletter/subscribe` already handles
validation, rate limiting, duplicates, reactivation and the welcome email,
and returns Persian `message` strings that the card surfaces verbatim. No
schema change. No checkboxes.

1. **Background → news module colour.**
   `NewsletterCard` hardcodes `bg-[color:var(--hp-brand-ink)]`. The section
   already sets `--insights-accent` from the news module colour. Use that,
   falling back to `--hp-brand-ink` when module colours are disabled.
   Check contrast for the white input and `--hp-on-brand` text against the
   accent in **both** themes.

2. **Terms as a modal, not a page navigation.**
   The card's footer links to `/terms`. Replace with a `Dialog` showing the
   **full** terms.

   - Source of truth is `SiteSetting["terms.content"]` (HTML), read today by
     `app/terms/page.tsx`.
   - Build one shared component, e.g. `features/legal/TermsDialog.tsx`,
     taking the HTML as a prop, and use it in **both** places: the newsletter
     card and `/terms` (the owner wants the same modal available on the page).
   - `NewsletterCard` is a client component; the terms HTML must be fetched
     server-side and passed down, or loaded on first open. Prefer **load on
     first open** — do not add a query to every homepage render.
   - The existing page renders with `dangerouslySetInnerHTML`. Keep that
     consistent, but note the content is admin-authored HTML; if it is ever
     user-supplied, sanitise (`rehype-sanitize` is already a dependency).

---

## 4. Story card

1. **Dates → `<RelativeDate>`.** Replaces the raw `story.date_fa`. Tooltip
   with the real Jalali date comes free.
2. **Comment counter tooltip** — e.g. "تعداد دیدگاه‌ها".
3. **Excerpt: 5 lines max, 2 lines min.** Currently `line-clamp-3`. See §6
   for the character budget that backs this.
4. **Hover affordance** — see §7.

---

## 5. Comment rail

1. **Scoping is already correct.** `getLatestInsights()` queries
   `postId: featured.id`, so the comments do belong to the story shown. No
   change needed. (Listed as item 1 in the brief; verified, nothing to do.)
2. **Dates → `<RelativeDate>`.**
3. **Avatar + name clickable** → `/author/{username}`, tooltip
   `بازدید از حساب کاربری {name}` with the name interpolated, never hardcoded.
   **Guest comments have no `username`** (`author.username` is
   `string | null`) — render those as plain text, not a dead link.
4. **Scrollable** past ~4 rows: fixed `max-h` + `overflow-y-auto`. Keep the
   rail keyboard-reachable (`tabIndex={0}` + an `aria-label`), as
   `ScrollRail` does.
5. **"همه دیدگاه‌ها"** → `/news/{slug}#comments`.
6. **Inline comment box, below the rail.**
   Reuse `CommentSection` with `module="news" slug={story.slug} compact`.

   ⚠️ **Performance.** `CommentSection` fetches on mount via
   `getCommentsAction`. Mounting it eagerly adds a query to *every* homepage
   load. This codebase has already had P2024 pool exhaustion from exactly
   this kind of accumulation (see `docs/dev-reload-loop.md` and commit
   `915cae8`), and `/api/notifications` was moved to lazy-load for the same
   reason.

   **Render it collapsed behind a "دیدگاه خود را بنویسید" button and mount
   on click.** Same pattern as `NotificationsButton` in
   `components/layout/site-header.tsx` (`hasLoaded` ref).

---

## 6. Excerpt limits — measured, not guessed

Lead column at `lg`: 1280 container − 64 (`px-8`) = 1216; minus the 40px
gap, split `1.35fr / 0.8fr` → **≈738px**.

Excerpt style is `text-[15px] leading-[28px]`. Persian at 15px averages
~8px/char including spaces → **≈92 characters per line**.

| Target | Characters |
|---|---|
| 2 lines (minimum) | ~185 |
| 5 lines (maximum) | ~460 |

**Proposed rule: `min 180`, `max 450`.**

- Current zod rule: `excerpt: z.string().max(500).optional()` — line ~118 of
  `app/admin/posts/new/page.tsx`.
- Tighten to `.min(180).max(450)` **for the news module only**. Other
  modules render the excerpt in different-width slots, so a global change
  would be wrong.
- Add a live character counter in the editor with the valid range, and a
  Persian validation message.
- **Existing rows will violate the new minimum.** Enforce on the client for
  new/edited posts; do not add a database constraint, and make sure the
  editor can still *load and save* an existing short excerpt without
  trapping the author. Verify against real data before shipping — the dump
  shows Persian text fields ranging from ~321 to ~3907 characters.

These numbers assume the current column widths. If the layout changes,
re-measure rather than carrying the constants forward.

---

## 7. Clickability and hover

**Story card** — make the whole card one hover target:

- Image scales (`group-hover:scale-[1.02]`) — already present.
- Title changes to `--insights-accent` — already present.
- Both should fire from a single `group` on the `<article>`, so hovering the
  image also highlights the title.
- Do **not** nest the excerpt inside the `<Link>` if it will contain links.
- Keep one visible focus ring for keyboard users; avoid two separate
  focusable links to the same destination where practical (image + title
  both linking is acceptable if the image link is `aria-hidden`/`tabIndex={-1}`).

**Sidebar card** (`news-sidebar-card.tsx`) — currently has no link at all.
Wrap in `<Link href={`/news/${news.slug}`}>`, but note it already contains
interactive children (`LikeButton`, a comments toggle, `CommentSection`), so
**do not** wrap the whole thing in an anchor — that nests interactive
elements. Link the title and image only.

---

## 8. Section header

- Title → **"آخرین خبر امروز"**.
- **Hide "همه خبرها"**: omit the `href` prop on `SectionHeader`. The
  component already hides the action when `href` is undefined — no edit to
  the primitive.
- Update `description`, which still describes comment-count selection (§2.3).

---

## 9. The two buttons

Place inside the section, near the header.

1. **"اخبار ۲۴ ساعت گذشته"** → opens the news sidebar.

   The sidebar's `newsOpen` state is **local React state in `LayoutShell`**
   with no external trigger — only the header button can open it today.

   Add a global `CustomEvent`, mirroring the existing
   `tb_open_notifications` pattern:

   ```ts
   // LayoutShell.tsx
   React.useEffect(() => {
     const open = () => setNewsOpen(true);
     window.addEventListener("tb_open_news_sidebar", open);
     return () => window.removeEventListener("tb_open_news_sidebar", open);
   }, []);
   ```

   ```ts
   // the button
   window.dispatchEvent(new CustomEvent("tb_open_news_sidebar"));
   ```

   **Cost: zero.** No network, no database, no polling — one listener and a
   synchronous dispatch. This satisfies the owner's "only if performance and
   the database are unaffected" condition.

   The sidebar's data comes from `useHomeModule("news")`, which is already
   loaded by the layout. Opening it triggers no new query.

2. **"بایگانی خبرهای قدیمی‌تر"** → `<Link href="/news">`. Plain navigation.

Note `/news` is the full archive, not strictly "older than 24 hours". Either
accept that, or filter the archive — but do not let the label overpromise.

---

## 10. Constraints for whoever picks this up

- **RTL.** Use logical properties (`ps-*`, `me-*`, `start-*`), never
  `left`/`right`. In RTL the first grid column renders on the right.
- **Section backgrounds are owned by `app/page.tsx`**, which alternates
  `--hp-band-a`/`--hp-band-b` by rendered index. Do **not** add a background
  to this section; it will break the stripe.
- **Empty states hide, never fake.** Every section returns `null` rather than
  rendering placeholder content. Keep that.
- **Dates** go through `RelativeDate`. Do not add another date formatter —
  there are already two (`formatRelativeDate`, `formatRelativeTime`) plus
  this one, and a fourth would make it worse.
- **Verify before shipping:** `pnpm typecheck`, `pnpm lint`, `pnpm test`
  (227 tests green at `121e117`). Several existing tests assert this
  section's markup — see `tests/unit/homepage-video-latest.test.ts`
  ("lets the page own the section background") and
  `tests/unit/homepage-bands-and-images.test.ts`. Update them deliberately
  when behaviour changes; do not weaken an assertion to make it pass.
- **Dev server:** `pnpm dev`. If anything looks stale, `pnpm dev:clean` plus
  DevTools → Application → Storage → Clear site data.

---

## 11. Open decisions

| # | Decision | Status |
|---|---|---|
| 1 | Story selection: **A** strictly-newest, or **B** newest-with-comments | **Owner input needed** (§2.3) |
| 2 | Comment box collapsed-until-clicked | Recommended; assumed yes unless told otherwise (§5.6) |
| 3 | Excerpt `min 180 / max 450`, news module only | Proposed from measurement (§6) |
| 4 | Fix the sidebar card's missing link | Suggested, not requested (§7) |
| 5 | `/news` archive is not 24h-filtered | Flagged (§9) |
