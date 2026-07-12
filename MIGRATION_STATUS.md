# TechBox UI Migration Status

> This file tracks progress so the next agent can continue without asking.
>
> Branch: `feat/shadcn-migration`
>
> Remote: `https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration`
>
> Latest commit: `c766b8b` — admin users page shadcn (latest total ~18 commits)
>
> Last updated: 2026-07-12 — Phase 3 ✅, Phase 4 ✅, Phase 5 ~90% (11/12+), Phase 6 ~60%, breadcrumb everywhere, table+form+accordion primitives
>
> Plan source: `UI_MIGRATION_PLAN.md`

---

## Overall progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Baseline & cleanup | ✅ Done | lint/typecheck green, build OOM local expected, deleted 11 unused primitives. |
| Phase 1 — shadcn init | ✅ Done | Mira preset b1D0dv72, RTL, pointer, tokens merged. |
| Phase 2 — Core primitives | ✅ Done | Core + wrappers Button/Spinner/Badge, TooltipProvider+Toaster. Installed 37/50 components. |
| Phase 3 — Layout shell | ✅ Done | Footer (Separator+ButtonLink), NewsSidebar (Button+ScrollArea+Card+Badge+Skeleton), SidebarContent (Button/Badge/Separator/ScrollArea/Tooltip/Popover/DropdownMenu/Input/Card+theme toggle), Chatbot (Button+Card+Input+ScrollArea+Badge), AuthModal (Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner), Sidebar primitive (sidebar.tsx+use-mobile). Lint/typecheck green. |
| Phase 4 — Design-system page | ✅ Done | `/admin/design-system` Tabs: colors, typography, buttons, badges, cards, forms, overlays, navigation, data, feedback, RTL/dark checklist. |
| Phase 5 — Forms & inputs audit | ✅ ~90% (11/12+) | Form primitive custom + RHF+zod+resolvers. Refactored: admin/login, contact, consultation-modal, timeline-event-form, search (Input+Card+Badge+Skeleton), work-with-us ApplyForm (RHF+zod+Attachment placeholder+file), account (Tabs+4x RHF: login/register/profile/password + Card+Input+Avatar), shop grid (Input+Select+Card+Badge), download table (Input+Select+Card+PageBreadcrumb), admin/posts/new major (Form+Accordion+Select+Switch+Input+Textarea+BlobUpload+Badge+PageBreadcrumb+Card preview), admin/posts page (Input+Select+Table+Card+PageBreadcrumb), admin/users (Input+Select+Checkbox+Card+ScrollArea+PageBreadcrumb). Remaining small: roles (select+checkbox raw), settings (select+checkbox), redirects (5 inputs), forum new topic (input+textarea), newsletter (input), auth/reset, consultation page, timeline ZoomControls. Pattern: useForm+zodResolver+Form+FormField+Input/Textarea+Button loading + toast. |
| Phase 6 — Admin UI | ✅ ~60% | FAQ ✅ (model+migration+API+admin CRUD+about Accordion), posts Table+Input+Select+Card ✅, users Card+Table+Select+Checkbox ✅, design-system ✅, breadcrumb ✅, table ✅, form ✅, accordion ✅. Remaining: jobs, moderation, content-health, redirects table, upload, blob, roles, settings — need Data Table (TanStack) + Chart radial + Calendar/DatePicker. |
| Phase 7 — Chat / messenger | ⏳ ~5% | Chatbot rebuilt with Card+Button+Input+ScrollArea, but needs Message+MessageScroller+Bubble+Attachment+Marker + Tabs AI/Personal/Support. |
| Phase 8 — Public module pattern | ⏳ 0% | Blog first canonical ModuleListPage/DetailPage/ContentGrid/ContentHero/ContentMeta/ContentCard + Breadcrumb + Pagination + Skeleton. |
| Phase 9 — Tools & static pages | ⏳ ~30% | About ✅ FAQ Accordion, Contact ✅ Form, Work-with-us ✅ ApplyForm, Consultation modal ✅, but tools calculators (raid, subnet, nas, nvr) still raw inputs need Slider/RadioGroup/Select/Table/Chart. |
| Phase 10 — Homepage | ⏳ 0% | Last, needs all other components stable. |
| Phase 11 — Final cleanup | ⏳ 0% | Remove legacy custom primitives, ensure no raw button/input/etc. |

---

## What is already done (detailed)

1. **Mira init** — components.json style base-mira, rtl, pointer, baseColor neutral, css design/globals.css tw-animate-css+shadcn/tailwind.css, tokens canonical, legacy aliased, radius 0.625rem, border 1px.
2. **Primitives installed 37/50**: alert-dialog, drawer, field, hover-card, label, popover, scroll-area, select, separator, sheet, sonner, dialog, tabs, checkbox, radio-group, switch, dropdown-menu, tooltip, avatar, skeleton, card, badge, input, textarea, button, spinner, sidebar, accordion, breadcrumb, table, empty, progress, slider, toggle, form (custom), plus hooks/use-mobile.
3. **Wrappers**: Button primary→default, danger→destructive, vip gradient, loading+Spinner, ButtonLink asChild, Badge module color-mix.
4. **Layout shell**: Footer Separator+ButtonLink, NewsSidebar Button+ScrollArea+Card+Badge+Skeleton homepage only left toggle backdrop spacer push, SidebarContent TehranDateTime Tooltip+Card, NavLinkItem Tooltip collapsed, notifications Popover+ScrollArea+Badge, cart Tooltip+Badge, search Input+Card, tools DropdownMenu collapsed/inline expanded, ScrollArea nav, Separator, ThemeToggleButton, Chatbot Button FAB rounded-full+Badge+Card+ScrollArea+Input+Separator bubbles rounded-2xl, AuthModal Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner.
5. **Design-system** `/admin/design-system`: Tabs colors/typography/buttons/badges/cards/forms/overlays/navigation/data/feedback, ButtonLink+render prop green, module colors, radius, RTL/dark checklist.
6. **Forms**: Form primitive custom Base UI compatible (Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage), RHF+zod+resolvers, refactored 11 major forms:
   - admin/login: Card+Form+Input+zod
   - contact: Form+Input+Textarea+zod
   - consultation-modal: Dialog+RHF+zod+Input+Textarea
   - timeline-event-form: Card+RHF+zod+Input+Textarea+Slider+Badge
   - search: Input+Card+Badge+Skeleton+PageBreadcrumb, module filter Buttons
   - work-with-us ApplyForm: RHF+zod+Input+Textarea+Attachment placeholder+file+Badge+Card+toast+FormData
   - account: Tabs+4x RHF (login/register/profile/password)+Card+Input+Avatar+PageBreadcrumb+toast
   - shop grid: Input+Select+Card+Badge+ProductComparisonModal isOpen fix
   - download table: Input+Select+Card+PageBreadcrumb
   - admin/posts/new major: Form+Accordion (seo, media, download, review, shop)+Select+Switch+Input+Textarea+BlobUpload+Badge+PageBreadcrumb+preview Card+Draft localStorage
   - admin/posts page: Input+Select+Table+Card+PageBreadcrumb+Badge+ButtonLink
   - admin/users page: Input+Select+Checkbox+Card+ScrollArea+PageBreadcrumb+Badge+BlobUploadField+activity
7. **FAQ**: Prisma Faq model + migration 20260712000004_add_faq_model CREATE TABLE, applied via migrate resolve baseline + deploy Neon, APIs GET /api/faq public + GET/POST /api/admin/faq + PATCH/DELETE /api/admin/faq/[id] (Next.js 16 params Promise), /admin/faq page RHF+zod+Table+Switch+Badge+toast CRUD, /about page Accordion defaultValue first, Card+Separator, /admin link FAQ.
8. **Breadcrumb**: components/ui/page-breadcrumb.tsx using Breadcrumb primitive + render prop, building crumbs from pathname+moduleMeta, added to /about, /search, /admin/faq, /admin/posts, /admin/users, account, shop, download already have PageBreadcrumb or will have.
9. **next.config**: remotePatterns unsplash, github, avatars.
10. **Validation**: lint quiet ✅, typecheck ✅, test 6 passed, build OOM local expected but CI 7GB passes.

### Git pushes on feat/shadcn-migration (latest 18)
- deac65c docs: add branch info to migration status
- 7919e82 feat(ui): shadcn migration foundation
- d1f2301 feat(ui): Phase 4 design-system page + admin link + image domains
- da68704 feat(ui): Phase 3 layout shell shadcn migration
- fcc7cae feat(ui): Phase 5 forms audit start — RHF+zod+shadcn Form
- 7072277 docs: update migration status Phase 5 partially done
- adecd6b feat(ui): Phase 6 FAQ model + accordion + admin CRUD + about Q&A
- b5730bc docs: status Phase 6 FAQ done, Phase 5 partial
- 48c4d03 feat(ui): Phase 5 more forms + timeline slider + accordion/table
- fe3b849 docs: comprehensive update for next agent
- 6ae8a66 feat(ui): Phase 5 search + work-with-us forms shadcn
- 26cfe6d feat(ui): breadcrumb everywhere + search + about + admin/faq
- a2ff1c5 feat(ui): Phase 5 account page RHF+zod+Tabs+Card
- 34743d5 feat(ui): shop + download filters shadcn Input+Select+Card
- 30f5115 feat(ui): Phase 5 major — admin posts/new RHF+zod+shadcn
- ccbf284 docs: final update Phase 5 8/12+ done
- 4c09af9 feat(ui): admin posts page shadcn Table+Input+Select+Card+PageBreadcrumb
- c766b8b feat(ui): admin users page shadcn Input+Select+Checkbox+Card+PageBreadcrumb

All at https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration

---

## Current blockers / missing components

- **Build OOM** 137 local — not code, CI/Vercel 7GB passes. Rely on lint/typecheck.
- **Remaining shadcn primitives not in base-mira** (install via `npx pnpm dlx shadcn add <name> --overwrite` then `git checkout HEAD -- components/ui/button.tsx` to restore wrapper):
  - calendar, date-picker (scheduled publish, timeline)
  - chart (radial stats)
  - carousel (shop gallery)
  - combobox, command (search history Command+ScrollArea)
  - data-table (TanStack for admin tables)
  - attachment, message, message-scroller, bubble, marker (chat/messenger + work-with-us CV)
  - navigation-menu, menubar, pagination, toggle-group, aspect-ratio, collapsible, kbd, scroll-fade, shimmer, typography
  - form now custom exists, but official may appear later

- **Forms remaining small (Phase 5 ~10% left)**:
  - app/admin/roles/page.tsx — select+checkbox raw, Table raw
  - app/admin/settings/page.tsx — select+checkbox raw
  - app/admin/redirects/page.tsx — 5 inputs raw inline
  - features/forum/components/ForumList.tsx — input+textarea raw
  - components/newsletter/NewsletterSignup.tsx — input raw
  - app/auth/reset-password/page.tsx — 2 inputs raw
  - app/consultation/page.tsx — 3 inputs+textarea (similar to modal, reuse schema)
  - features/timeline/components/ZoomControls.tsx, TimelineContainer.tsx — input raw
  - features/tools/components/* — nas/nvr/raid/subnet calculators have raw inputs/sliders/selects

  Pattern: useForm+zodResolver+Form+FormField+Input/Textarea/Select/Checkbox/Switch+Button loading+toast. See admin/login, contact, consultation-modal, account as canonical.

- **Admin UI remaining (Phase 6 40% left)**: jobs, moderation, content-health, redirects table, upload, blob, roles, settings — need Data Table + pagination + badge + dialog + chart + calendar.

- **FAQ** done but empty table — seed initial FAQs via /admin/faq or prisma db execute.

---

## Commands

```bash
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build

# Add shadcn component then restore button wrapper
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

## Next steps priority

1. **Roles page** (`app/admin/roles/page.tsx`): Table→Table primitive, select→Select, checkbox→Checkbox, Card+PageBreadcrumb, keep module toggle logic.
2. **Settings page** (`app/admin/settings/page.tsx`): select→Select, checkbox→Switch+Label, Card+PageBreadcrumb.
3. **Redirects page** (`app/admin/redirects/page.tsx`): 5 inputs → Input + Card + Table + PageBreadcrumb + Form RHF.
4. **Forum new topic**, **Newsletter**, **reset-password**, **consultation page** — Input+Textarea+Form.
5. **Admin jobs, moderation, content-health** — Table+Badge+Input+Select+Pagination (install pagination).
6. **Tools calculators** — Slider, RadioGroup, Select, Table, Chart placeholders — already have Slider, need Chart.
7. **Chat/messenger Phase 7** — install message, bubble, message-scroller, attachment, marker, rebuild Chatbot with MessageScroller.
8. **Public module pattern Phase 8** — blog first: ModuleListPage, ModuleDetailPage, ContentGrid, ContentHero, ContentMeta, ContentCard using Card+Badge+Avatar+Breadcrumb+Pagination+Skeleton.
9. **Homepage Phase 10** last.
10. **Final cleanup Phase 11** — remove legacy custom primitives (chip, close-button, icon-rail-button, overlay, panel, etc after usages replaced), ensure no raw button/input/etc, RTL/dark/mobile audit, lint/typecheck/build green.

---

## Important notes

- **Do not overwrite button.tsx without restoring wrapper** — wrapper has legacy mapping primary→default, danger→destructive, vip gradient, loading+Spinner+ButtonLink. After any shadcn add, `git checkout HEAD -- components/ui/button.tsx`.
- **Do not remove old custom components with imports** until replacement ready.
- **Always lint+typecheck after changes**.
- **Build OOM local expected** — CI passes with more RAM.
- **node_modules not persisted** — install first each session.
- **Env**: create .env from user's initial prompt (AUTH_SECRET, DATABASE_URL pooler, DIRECT_URL, BLOB, RESEND, UPSTASH, CHAT_, SENTRY). Do not commit.
- **Prisma**: after schema change generate+deploy, if divergence use `migrate resolve --applied`.
- **Push location**: always `feat/shadcn-migration` branch on `https://github.com/hnmodeq/techbox.git` via PAT. Push after each phase green.
- **Context**: This file is single source of truth for next agent — no extra explanation needed from user.

---

## Decisions binding

- Preset Mira b1D0dv72, RTL, pointer
- Tokens shadcn canonical + legacy aliases, radius 0.625rem, border 1px
- Theme switcher in sidebar cycling light/dark via next-themes
- FAQ admin-editable with Accordion, Faq model + /admin/faq
- Messenger Tabs AI/Personal/Support using Message+MessageScroller
- Calendar Gregorian for now
- Shop catalog only, no real payments
- Form pattern RHF+zod+shadcn Form custom compatible Base UI

---

## Git history last 10

- 30f5115 feat(ui): Phase 5 major — admin posts/new RHF+zod+shadcn
- ccbf284 docs: final update Phase 5 8/12+ done
- 4c09af9 feat(ui): admin posts page shadcn Table+Input+Select+Card+PageBreadcrumb
- c766b8b feat(ui): admin users page shadcn Input+Select+Checkbox+Card+PageBreadcrumb

---

## Quick validation

```bash
cd /home/user/techbox
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
npx pnpm@10.12.1 test
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build
```
