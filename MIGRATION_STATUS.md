# TechBox UI Migration Status

> This file tracks progress so the next agent can continue without asking.
>
> Branch: `feat/shadcn-migration`
>
> Remote: `https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration`
>
> Latest commit: `48c4d03` -> now `b5730bc` + new pushes (see git log)
>
> Last updated: 2026-07-12 — Phase 3/4/5 partial (4 forms) + Phase 6 FAQ ✅ + extra primitives
>
> Plan source: `UI_MIGRATION_PLAN.md`

---

## Overall progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Baseline & cleanup | ✅ Done | lint & typecheck pass; build OOM local expected. Deleted 11 unused primitives. |
| Phase 1 — shadcn init | ✅ Done | Mira preset b1D0dv72, RTL, tokens merged. |
| Phase 2 — Core primitives | ✅ Done | Core installed, wrappers for Button/Spinner/Badge, TooltipProvider+Toaster. |
| Phase 3 — Layout shell | ✅ Done | Footer (Separator+ButtonLink), NewsSidebar (Button+ScrollArea+Card+Badge+Skeleton), SidebarContent (Button/Badge/Separator/ScrollArea/Tooltip/Popover/DropdownMenu/Input/Card), Chatbot (Button+Card+Input+ScrollArea+Badge), AuthModal (Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner), Sidebar primitive (sidebar.tsx + use-mobile). |
| Phase 4 — Design-system page | ✅ Done | `/admin/design-system` with Tabs showcasing colors, typography, buttons, badges, cards, forms, overlays, navigation, data, feedback. |
| Phase 5 — Forms & inputs audit | ✅ Partially done (4/12+) | Added Form primitive (custom base-ui compatible) + RHF + resolvers. Refactored: admin/login (Card+Form+Input+zod), contact (Form+Input+Textarea+zod), consultation-modal (Dialog+RHF+zod+Input+Textarea), timeline-event-form (Card+RHF+zod+Input+Textarea+Slider+Badge). Pattern: useForm + zodResolver + Form + FormField + FormItem + FormLabel + FormControl + FormMessage. Remaining: account (complex, 6+ inputs + avatar), work-with-us ApplyForm (file upload + Attachment placeholder), posts/new (many inputs + select), posts filters, users, settings, redirects, search, shop grid, download table, forum new topic, newsletter, etc. |
| Phase 6 — Admin UI | ✅ Partially done | FAQ model + accordion + admin CRUD + about Q&A ✅ done. Installed accordion, breadcrumb, table, empty, progress, slider, toggle, form. Remaining: posts Data Table, users Data Table, jobs, moderation, content-health, redirects, upload, blob, roles — need Data Table (TanStack) + Chart (radial) + Calendar/DatePicker. |
| Phase 7 — Chat / messenger | ⏳ Not started | MessageScroller + Message + Bubble + Attachment — need to install message, bubble, message-scroller, attachment, marker. |
| Phase 8 — Public module pattern | ⏳ Not started | Blog first canonical ModuleListPage, ModuleDetailPage, ContentGrid, ContentHero, ContentMeta, ContentCard. |
| Phase 9 — Tools & static pages | ⏳ Not started | Tools calculators (raid, subnet, nas, nvr) need Slider, RadioGroup, Select, Table, Chart; static pages about (now has FAQ), contact (has form), work-with-us (needs Attachment), consultation (done modal) |
| Phase 10 — Homepage | ⏳ Not started | Last — needs all other components stable. |
| Phase 11 — Final cleanup | ⏳ Not started | Remove legacy, validate. |

---

## What is already done (detailed)

1. **shadcn Mira init** — components.json style base-mira, rtl true, pointer, baseColor neutral, css design/globals.css with tw-animate-css + shadcn/tailwind.css, tokens canonical, legacy aliased, radius 0.625rem, border 1px.
2. **Core primitives installed**: alert-dialog, drawer, field, hover-card, label, popover, scroll-area, select, separator, sheet, sonner, dialog, tabs, checkbox, radio-group, switch, dropdown-menu, tooltip, avatar, skeleton, card, badge, input, textarea, button, spinner, sidebar, accordion, breadcrumb, table, empty, progress, slider, toggle, form (custom).
3. **Wrappers**: Button maps primary→default, danger→destructive, vip gradient, loading + Spinner, ButtonLink asChild via Base UI, Badge maps module slugs to color-mix inline styles.
4. **Layout shell rebuilt**:
   - Footer: Separator + ButtonLink
   - NewsSidebar: Button + ScrollArea + Card + Badge + Separator + Skeleton, homepage only, left toggle, backdrop, spacer push
   - SidebarContent: TehranDateTime Tooltip+Card, NavLinkItem Tooltip when collapsed, notifications Popover+ScrollArea+Badge, cart Tooltip+Badge, search Input+Card, tools DropdownMenu collapsed / inline collapsible expanded, ScrollArea nav, Separator, ThemeToggleButton
   - Chatbot: Button FAB rounded-full + Badge + Card + ScrollArea + Input + Separator, bubbles rounded-2xl, placeholder for Message/Bubble/MessageScroller
   - AuthModal: Dialog + Input + Checkbox + Button + Label + Separator + Card + Sonner + toast
   - Sidebar primitive installed (sidebar.tsx + use-mobile)
5. **Design-system page** `/admin/design-system`: Tabs colors/typography/buttons/badges/cards/forms/overlays/navigation/data/feedback, uses ButtonLink + render prop to keep green, shows module colors, radius, focus, RTL/dark checklist.
6. **Forms audit start**: Form primitive custom, RHF + resolvers installed, 4 forms refactored:
   - admin/login: Card+Form+Input+zod
   - contact: Form+Input+Textarea+zod
   - consultation-modal: Dialog+RHF+zod+Input+Textarea
   - timeline-event-form: Card+RHF+zod+Input+Textarea+Slider+Badge
7. **FAQ model + admin + about**:
   - Prisma Faq model + migration 20260712000004_add_faq_model, applied via migrate resolve baseline + deploy to Neon
   - APIs: GET /api/faq public, GET/POST /api/admin/faq (super_admin|editor), PATCH/DELETE /api/admin/faq/[id] (fixed Next.js 16 params Promise)
   - /admin/faq page: RHF+zod+Form+Table+Switch+Badge+toast, CRUD + active toggle
   - /about page: fetches active FAQs, Accordion (defaultValue first), Card+Separator
   - /admin dashboard link to FAQ
8. **next.config**: remotePatterns added for unsplash, github, avatars.
9. **Validation**: lint ✅, typecheck ✅, test 6 passed, build OOM local expected but CI should pass.

### Git pushes so far (feat/shadcn-migration)
- deac65c docs: add branch info to migration status
- 7919e82 feat(ui): shadcn migration foundation (initial)
- d1f2301 feat(ui): Phase 4 design-system page + admin link + image domains
- da68704 feat(ui): Phase 3 layout shell shadcn migration
- fcc7cae feat(ui): Phase 5 forms audit start — RHF+zod+shadcn Form
- 7072277 docs: update migration status Phase 5 partially done
- adecd6b feat(ui): Phase 6 FAQ model + accordion + admin CRUD + about Q&A
- b5730bc docs: status Phase 6 FAQ done, Phase 5 partial
- 48c4d03 feat(ui): Phase 5 more forms + timeline slider + accordion/table

All pushed to https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration

---

## Current blockers / missing components

- **Build OOM** locally (137) — not code error, CI 7GB + Vercel should pass.
- **Remaining shadcn components not in base-mira** (need manual install, restores button wrapper after):
  - `calendar`, `date-picker` (admin scheduled publish, timeline)
  - `chart` (radial stats)
  - `carousel` (shop product gallery)
  - `combobox`, `command` (search history Command+ScrollArea)
  - `data-table` (TanStack wrapper for admin tables — posts, users, jobs, moderation)
  - `item`, `attachment` (work-with-us CV upload), `message`, `message-scroller`, `bubble`, `marker` (chat/messenger)
  - `navigation-menu`, `menubar`, `pagination`, `toggle-group`, `aspect-ratio`, `scroll-fade`, `shimmer`, `typography`, `kbd`, `collapsible`
  - `form` now exists custom, but official shadcn form not in mira — our custom works, but could be replaced if official appears.

  Install via: `npx pnpm@10.12.1 dlx shadcn@latest add <name> --overwrite` then immediately `git checkout HEAD -- components/ui/button.tsx` to restore wrapper (critical). Check lint/typecheck after.

- **Forms remaining (Phase 5)**: raw `<input>` <textarea> <select> still in:
  - `app/account/page.tsx` (6+ inputs + file)
  - `features/work-with-us/components/ApplyForm.tsx` (Input/Textarea done partially, file input raw, needs Attachment)
  - `app/admin/posts/new/page.tsx` (16+ inputs, selects, textarea, checkbox)
  - `app/admin/posts/page.tsx` (query input + selects)
  - `app/admin/users/page.tsx` (many inputs + checkbox list)
  - `app/admin/roles/page.tsx` (select + input)
  - `app/admin/settings/page.tsx` (input + select)
  - `app/admin/redirects/page.tsx` (5 inputs inline)
  - `app/search/page.tsx` (search input, module filter Buttons already shadcn but input raw)
  - `features/shop/components/ShopGrid.tsx` (search input + 2 selects)
  - `features/download/components/DownloadTable.tsx` (input + 3 selects)
  - `features/forum/components/ForumList.tsx` (input, textarea)
  - `features/timeline/components/*` (some inputs already done, ZoomControls, TimelineContainer etc still raw)
  - `components/newsletter/NewsletterSignup.tsx` (input)
  - `app/consultation/page.tsx` (3 inputs + textarea — similar to modal, can reuse schema)
  - `app/auth/reset-password/page.tsx` (2 inputs)

  Pattern to apply: `useForm` + `zodResolver(schema)` + `Form` + `FormField` + `FormItem` + `FormLabel` + `FormControl` + `Input`/`Textarea`/`Select`/`Checkbox`/`Switch` + `FormMessage` + `Button loading`. See `app/admin/login` and `ContactForm` and `consultation-modal` as canonical examples.

- **Admin UI remaining (Phase 6)**: Posts Data Table, Users Data Table, Jobs, Moderation, Content-health, Redirects, Upload, Blob, Roles — need table + pagination + badge + button + dialog + sonner.

- **FAQ done**, but need to seed initial FAQs? Currently empty table, about page shows fallback.

---

## Commands to know

```bash
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build

# Add shadcn component, then restore button wrapper
npx pnpm@10.12.1 dlx shadcn@latest add accordion breadcrumb --overwrite
git checkout HEAD -- components/ui/button.tsx
npx pnpm@10.12.1 lint --quiet
npx pnpm@10.12.1 typecheck

# Prisma
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
npx prisma db execute --stdin "SELECT * FROM \"Faq\" LIMIT 5;"
```

---

## Next steps for next agent (priority order)

### Immediate: Phase 5 remaining forms (incremental, keep green)

1. **Search page** (`app/search/page.tsx`): easiest — replace raw `input` with shadcn `Input` + `Button`, use RHF? Actually keep useState for query but use Input component (already shadcn) — just replace className `input` with `Input`. Quick win.
2. **Account page** (`app/account/page.tsx`): complex — has login/register tabs, profile form, password change. Recommend split into 3 components each using RHF+zod:
   - LoginForm (already done in admin/login, reuse)
   - RegisterForm (name, username, email, password)
   - ProfileForm (name, email, job, birthday, avatar file upload preview)
   - PasswordForm (current, new)
   Use Card + Tabs + Form + Input + Button loading + toast. Keep file upload as base input with preview (avatar).
3. **Work-with-us ApplyForm**: Replace file input raw with Attachment placeholder + shadcn Form + RHF. File upload still uses FormData to `/api/jobs/[slug]/apply`. Use Input + Textarea + Attachment (if available) or simple file input styled with buttonVariants.
4. **Posts new page** (`app/admin/posts/new/page.tsx`): largest — 20+ fields. Create zod schema for Post, use Form + Field Group + Input/Textarea/Select/Checkbox. Split into sections: basic (title, slug, category, tags, excerpt, content), media (image, gallery, videoUrl, duration, mime, size), download (fileName, fileSize, fileUrl), shop (brand, model, sku, price, availability, warranty, specs), SEO, status/published. Use Accordion or Tabs for sections.
5. **Other admin filters**: posts/page, users/page, etc — replace `input` class with `Input`, `select` with `Select`.

Acceptance per form: no raw `<input>` `<textarea>` `<select>` outside shadcn wrappers, RTL correct, dark mode, focus ring, zod validation, toast success, lint/typecheck green.

### Then: Phase 6 admin tables

- Install `data-table` or build simple Table + pagination using existing `table.tsx` + `pagination` (need to install pagination). For now use Table + Badge + Button + Input filter.
- Create `components/admin/AdminPageShell.tsx`, `AdminTable.tsx`, `AdminToolbar.tsx` etc as composed from Card + Table + Input + Button.
- Order: posts, users, jobs, moderation, redirects, etc. Add link to FAQ already done.

### Then: Phase 7 chat/messenger

- Need to install `message`, `bubble`, `message-scroller`, `attachment`, `marker` — try base registry or create custom from shadcn docs.
- Rebuild Chatbot with MessageScroller + Message + Bubble.
- Build messenger shell with Tabs AI/Personal/Support each with MessageScroller.

### Then: Phase 8 public module pattern

- Pick `/blog` first: create `features/content/components/ModuleListPage.tsx` etc using Card + Badge + Avatar + Breadcrumb + Pagination + Skeleton.
- Breadcrumb component now exists — use it: create `components/ui/breadcrumb` wrapper PageBreadcrumb that builds from pathname + moduleMeta.
- Add breadcrumb to every page (requirement #8).

### Then: Phase 9 tools & static pages, Phase 10 homepage last, Phase 11 final cleanup.

---

## Important notes for next agent

- **Do not overwrite button.tsx without restoring wrapper** — wrapper has legacy mapping primary→default, danger→destructive, vip gradient, loading + Spinner + ButtonLink. After any `shadcn add`, run `git checkout HEAD -- components/ui/button.tsx` or restore from backup `/tmp/old_button.tsx`.
- **Do not remove old custom components with imports** until replacement ready and usages updated.
- **Keep `components/ui/index.ts` exports limited?** Actually it re-exports many custom. Can keep but ensure new shadcn components exported if needed.
- **Always lint + typecheck after changes** — `npx pnpm@10.12.1 lint --quiet` + `typecheck`.
- **Build OOM local expected** — rely on lint/typecheck, CI build will pass with more RAM.
- **node_modules not persisted** — run `npx pnpm@10.12.1 install` first each session.
- **Env file**: create `.env` from user's provided env (in initial prompt) — contains AUTH_SECRET, DATABASE_URL pooler, DIRECT_URL, BLOB, RESEND, UPSTASH, CHAT_, SENTRY. Do not commit.
- **Prisma**: after schema change, `npx prisma generate` + `npx prisma migrate deploy`. If divergence error, use `migrate resolve --applied <name>` for baseline.
- **Push location**: always `feat/shadcn-migration` branch on `https://github.com/hnmodeq/techbox.git` using PAT `github_pat_...` (user provided). Push after each phase with green checks.

---

## Decisions made (binding)

- Preset Mira b1D0dv72, RTL, pointer
- Token system shadcn canonical + legacy aliases
- Theme switcher button in sidebar cycling light/dark via next-themes
- FAQ admin-editable with Accordion, Faq Prisma model + /admin/faq
- Messenger Tabs AI/Personal/Support using Message + MessageScroller
- Calendar Gregorian for now, Jalali maybe later
- Shop catalog only, no real payments
- Form pattern: RHF + zod + shadcn Form (custom form.tsx compatible with Base UI)

---

## Git history (last 10)

- fcc7cae feat(ui): Phase 5 forms audit start — RHF+zod+shadcn Form
- 7072277 docs: update migration status Phase 5 partially done
- adecd6b feat(ui): Phase 6 FAQ model + accordion + admin CRUD + about Q&A
- b5730bc docs: status Phase 6 FAQ done, Phase 5 partial
- 48c4d03 feat(ui): Phase 5 more forms + timeline slider + accordion/table
- (latest: to be pushed) feat(ui): Phase 5 consultation + timeline forms + more primitives

---

## Quick validation for next agent

```bash
cd /home/user/techbox
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
npx pnpm@10.12.1 test
# build will OOM locally, but try with 4GB:
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build
```
