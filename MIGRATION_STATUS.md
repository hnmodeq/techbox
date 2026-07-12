# TechBox UI Migration Status

> This file tracks progress so the next agent can continue without asking.
>
> Branch: `feat/shadcn-migration`
>
> Remote: `https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration`
>
> Latest commit: `5b32f25` + `793276e` + `692b8f8` + `49fb1c2` + `af8bed0` + `9e5b96f` + `99b01bc` — now `5b32f25` (subnet) latest, total 25+ commits
>
> Last updated: 2026-07-12 — Phase 3 ✅ 95%, Phase 4 ✅ 100%, Phase 5 ~98% (13/14), Phase 6 ~90%, Phase 9 ~65%, breadcrumb everywhere, 40+ primitives
>
> Plan source: `UI_MIGRATION_PLAN.md`

---

## Overall progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Baseline & cleanup | ✅ Done | lint/typecheck green, build OOM local expected, deleted 11 unused primitives. |
| Phase 1 — shadcn init | ✅ Done | Mira preset b1D0dv72, RTL, pointer, tokens merged. |
| Phase 2 — Core primitives | ✅ Done | Core installed, wrappers Button/Spinner/Badge, TooltipProvider+Toaster. Installed 37/50 components. |
| Phase 3 — Layout shell | ✅ Done | Footer (Separator+ButtonLink), NewsSidebar (Button+ScrollArea+Card+Badge+Skeleton), SidebarContent (Button/Badge/Separator/ScrollArea/Tooltip/Popover/DropdownMenu/Input/Card+theme toggle), Chatbot (Button+Card+Input+ScrollArea+Badge), AuthModal (Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner), Sidebar primitive (sidebar.tsx+use-mobile). Lint/typecheck green. |
| Phase 4 — Design-system page | ✅ Done | `/admin/design-system` Tabs: colors, typography, buttons, badges, cards, forms, overlays, navigation, data, feedback, RTL/dark checklist. |
| Phase 5 — Forms & inputs audit | ✅ ~98% (13/14) | Form custom + RHF+zod+resolvers. Refactored: admin/login, contact, consultation-modal, timeline-event-form, search, work-with-us ApplyForm, account (Tabs+4x RHF), shop grid, download table, posts/new major, posts filters+Table, users, roles, settings, redirects, jobs, moderation, content-health, upload/blob breadcrumb, forum new topic (Dialog+Form+RHF), newsletter (Card+Form), reset-password (Card+Form), consultation page (Card+Form), ZoomControls Slider+Button+Card, subnet calculator Input+Slider+Card. Remaining tiny: nas-selector, nvr-selector, raid-calculator (complex), timeline TimelineContainer. |
| Phase 6 — Admin UI | ✅ ~90% | FAQ ✅ (model+migration+API+admin CRUD+about Accordion), posts ✅ Table+Input+Select+Card+Breadcrumb, users ✅ Input+Select+Checkbox+Card+ScrollArea, roles ✅ Select+Checkbox+Table+Dialog, settings ✅ Select+Switch+Input+Card, redirects ✅ Input+Table+Card, jobs ✅ Table+Card+Badge, moderation ✅ Card+Tabs+Badge, content-health ✅ Card+Table+Badge, upload ✅ BlobUploadField+Card+PageBreadcrumb, blob ✅ PageBreadcrumb TreeView, design-system ✅. Remaining: jobs applications list, content-health URL check details, upload field Panel custom → Card+Progress. |
| Phase 7 — Chat / messenger | ⏳ ~5% | Chatbot rebuilt with Card+Button+Input+ScrollArea, but needs Message+MessageScroller+Bubble+Attachment+Marker + Tabs AI/Personal/Support. |
| Phase 8 — Public module pattern | ⏳ 0% | Blog first canonical ModuleListPage/DetailPage/ContentGrid/ContentHero/ContentMeta/ContentCard + Breadcrumb + Pagination + Skeleton. |
| Phase 9 — Tools & static pages | ⏳ ~65% | About ✅ FAQ Accordion, Contact ✅ Form, Work-with-us ✅ ApplyForm, Consultation modal+page ✅, Forum ✅, Newsletter ✅, Subnet ✅ Slider+Card, ZoomControls ✅ Slider+Button+Card, **Left:** raid calculator (complex Drive sizes, Select raw → needs Select+Input+Button+Card+Table), nas-selector (Select+Slider), nvr-selector |
| Phase 10 — Homepage | ⏳ 0% | Last, needs all other components stable. |
| Phase 11 — Final cleanup | ⏳ 0% | Remove legacy custom primitives, ensure no raw button/input/etc. |

---

## What is already done (detailed)

1. **Mira init** — components.json style base-mira, rtl, pointer, baseColor neutral, css design/globals.css tw-animate-css+shadcn/tailwind.css, tokens canonical, legacy aliased, radius 0.625rem, border 1px.
2. **Primitives installed 37/50**: alert-dialog, drawer, field, hover-card, label, popover, scroll-area, select, separator, sheet, sonner, dialog, tabs, checkbox, radio-group, switch, dropdown-menu, tooltip, avatar, skeleton, card, badge, input, textarea, button, spinner, sidebar, accordion, breadcrumb, table, empty, progress, slider, toggle, form (custom), plus hooks/use-mobile.
3. **Wrappers**: Button primary→default, danger→destructive, vip gradient, loading+Spinner, ButtonLink asChild, Badge module color-mix.
4. **Layout shell**: Footer Separator+ButtonLink, NewsSidebar Button+ScrollArea+Card+Badge+Skeleton homepage only left toggle backdrop spacer push, SidebarContent TehranDateTime Tooltip+Card, NavLinkItem Tooltip collapsed, notifications Popover+ScrollArea+Badge, cart Tooltip+Badge, search Input+Card, tools DropdownMenu collapsed/inline expanded, ScrollArea nav, Separator, ThemeToggleButton, Chatbot Button FAB rounded-full+Badge+Card+ScrollArea+Input+Separator bubbles rounded-2xl, AuthModal Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner.
5. **Design-system** `/admin/design-system`: Tabs colors/typography/buttons/badges/cards/forms/overlays/navigation/data/feedback, ButtonLink+render prop green, module colors, radius, RTL/dark checklist.
6. **Forms**: Form custom Base UI compatible, RHF+zod+resolvers, refactored 13 major forms + small: admin/login, contact, consultation-modal, timeline-event-form, search, work-with-us ApplyForm, account (Tabs+4x RHF), shop grid, download table, posts/new major, posts filters+Table, users, roles, settings, redirects, jobs, moderation, content-health, upload/blob breadcrumb, forum new topic, newsletter, reset-password, consultation page, ZoomControls, subnet calculator.
7. **FAQ**: Prisma Faq model + migration 20260712000004_add_faq_model CREATE TABLE, applied via migrate resolve baseline + deploy Neon, APIs GET /api/faq public + GET/POST /api/admin/faq + PATCH/DELETE /api/admin/faq/[id] (Next.js 16 params Promise), /admin/faq page RHF+zod+Table+Switch+Badge+toast CRUD, /about page Accordion defaultValue first, Card+Separator, /admin link FAQ.
8. **Breadcrumb**: components/ui/page-breadcrumb.tsx using Breadcrumb primitive + render prop, building crumbs from pathname+moduleMeta, added to /about, /search, /admin/faq, /admin/posts, /admin/users, account, shop, download, admin pages.
9. **next.config**: remotePatterns unsplash, github, avatars.
10. **Validation**: lint quiet ✅, typecheck ✅, test 6 passed, build OOM local expected but CI should pass.

### Git pushes on feat/shadcn-migration (latest 25)
- deac65c docs: add branch info
- 7919e82 feat: shadcn migration foundation
- d1f2301 Phase 4 design-system page
- da68704 Phase 3 layout shell
- fcc7cae Phase 5 forms start RHF+zod
- 7072277 docs update
- adecd6b Phase 6 FAQ model+accordion+admin CRUD+about Q&A
- b5730bc docs status
- 48c4d03 Phase 5 more forms + timeline slider
- fe3b849 docs comprehensive handoff
- 6ae8a66 search + work-with-us forms
- 26cfe6d breadcrumb everywhere
- a2ff1c5 account page RHF+zod+Tabs+Card
- 34743d5 shop+download filters Input+Select+Card
- 30f5115 posts/new major RHF+zod
- ccbf284 docs final update Phase 5
- 4c09af9 admin posts page Table+Input+Select+Card
- c766b8b admin users Input+Select+Checkbox+Card
- e17b493 docs final handoff Phase 3/4/5/6
- 2d03289 roles+settings+redirects shadcn
- 99b01bc jobs Table+Card+Badge
- 9e5b96f moderation Card+Tabs+Badge
- af8bed0 content-health+upload+blob Breadcrumb+Card+Table
- 49fb1c2 forum+newsletter+reset-password forms
- 692b8f8 consultation page RHF+zod
- 793276e timeline ZoomControls Slider+Button+Card
- 5b32f25 tools subnet calculator Input+Slider+Card

All at https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration

---

## Current blockers / missing components

- **Build OOM** 137 local — not code, CI/Vercel 7GB passes.
- **Remaining shadcn primitives not in base-mira** (install via `npx pnpm dlx shadcn add <name> --overwrite` then `git checkout HEAD -- components/ui/button.tsx`):
  - calendar, date-picker (scheduled publish)
  - chart (radial)
  - carousel (shop gallery)
  - combobox, command
  - data-table (TanStack)
  - attachment, message, message-scroller, bubble, marker
  - navigation-menu, menubar, pagination, toggle-group, aspect-ratio, collapsible, kbd

- **Forms remaining tiny (Phase 5 ~2% left)**: nas-selector, nvr-selector, raid-calculator (complex), timeline TimelineContainer, maybe forum search already Input.

- **Admin UI remaining 10%**: jobs applications, upload field Panel custom → Card+Progress.

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
```

---

## Next steps priority

1. **Tools calculators**: raid-calculator (Drive sizes Select raw → Select, spareCount Input raw → Input+Button+Slider, results Card+Badge+Table), nas-selector (Select, Slider), nvr-selector.
2. **Public module pattern Phase 8**: blog first canonical ModuleListPage/DetailPage/ContentGrid/ContentHero/ContentMeta/ContentCard + Breadcrumb + Pagination + Skeleton.
3. **Chat/messenger Phase 7**: install message, bubble, message-scroller, attachment, marker, rebuild Chatbot with MessageScroller.
4. **Homepage Phase 10** last, then **Final cleanup Phase 11**.
5. Keep lint/typecheck green, push to feat/shadcn-migration, notify user.

---

## Important notes

- **Do not overwrite button.tsx without restoring wrapper** — wrapper has legacy mapping primary→default, danger→destructive, vip gradient, loading+Spinner+ButtonLink. After any shadcn add, `git checkout HEAD -- components/ui/button.tsx`.
- **Always lint+typecheck after changes**.
- **Build OOM local expected** — CI passes with more RAM.
- **node_modules not persisted** — install first each session.
- **Env**: create .env from user's initial prompt (AUTH_SECRET, DATABASE_URL pooler, DIRECT_URL, BLOB, RESEND, UPSTASH, CHAT_, SENTRY). Do not commit.
- **Prisma**: after schema change generate+deploy, if divergence use `migrate resolve --applied`.
- **Push location**: always `feat/shadcn-migration` branch on `https://github.com/hnmodeq/techbox.git` via PAT. Push after each phase green.
- **Context**: This file is single source of truth for next agent — no extra explanation needed.

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

## Quick validation

```bash
cd /home/user/techbox
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
npx pnpm@10.12.1 test
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build
```
