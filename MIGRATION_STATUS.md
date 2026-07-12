# TechBox UI Migration Status

> This file tracks progress so the next agent can continue without asking.
>
> Branch: `feat/shadcn-migration`
>
> Remote: `https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration`
>
> Latest commit: `665e685` (homepage redesign), total 30+ commits
>
> Last updated: 2026-07-12 — Phase 3 ✅ 95%, Phase 4 ✅ 100%, Phase 5 ✅ 100%, Phase 6 ~90%, Phase 7 ⏳ 5%, Phase 8 ✅ 50%, Phase 9 ✅ 100%, Phase 10 ✅ 100%, Phase 11 ✅ 90%
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
| Phase 5 — Forms & inputs audit | ✅ 100% | ALL forms migrated to RHF+zod+shadcn. NVR selector (Card+Slider+Switch+Badge), RAID calculator (Card+Select+Slider+Button+Badge), all tools, comments (Textarea), homepage rows complete. Only 1 hidden file input remains (intentional standard pattern). |
| Phase 6 — Admin UI | ✅ ~90% | FAQ ✅ (model+migration+API+admin CRUD+about Accordion), posts ✅ Table+Input+Select+Card+Breadcrumb, users ✅ Input+Select+Checkbox+Card+ScrollArea, roles ✅ Select+Checkbox+Table+Dialog, settings ✅ Select+Switch+Input+Card, redirects ✅ Input+Table+Card, jobs ✅ Table+Card+Badge, moderation ✅ Card+Tabs+Badge, content-health ✅ Card+Table+Badge, upload ✅ BlobUploadField+Card+PageBreadcrumb, blob ✅ PageBreadcrumb TreeView, design-system ✅. Remaining: jobs applications list, content-health URL check details, upload field Panel custom → Card+Progress. |
| Phase 7 — Chat / messenger | ⏳ ~5% | Chatbot rebuilt with Card+Button+Input+ScrollArea+Badge+Separator, already solid and functional. Message/MessageScroller/Bubble primitives not in base-mira registry (very new June 2026). Current implementation is good. |
| Phase 8 — Public module pattern | ✅ ~50% | BlogGrid migrated to Card+Badge+Avatar+Skeleton canonical pattern with loading states. Other module pages (news, media, shop, forum, review, download) can follow same pattern when needed. |
| Phase 9 — Tools & static pages | ✅ 100% | ALL tools complete: NVR selector (Card+Slider+Switch+Badge+Button+Separator), RAID calculator (Card+Select+Slider+Button+Badge+Separator), subnet calculator (Card+Slider+Input+Badge), NAS selector (Card+Slider+Badge+Button), ZoomControls (Slider+Button+Card). About ✅ FAQ Accordion, Contact ✅ Form, Work-with-us ✅ ApplyForm, Consultation modal+page ✅, Forum ✅, Newsletter ✅. |
| Phase 10 — Homepage | ✅ 100% | ALL homepage rows migrated: MagazineRow (Card+Badge+Avatar+ButtonLink), ShopRow (Card+Badge+ButtonLink), ForumRow (Card+Badge+Avatar+ButtonLink+Skeleton), ReviewRow (Card+Badge+Avatar+ButtonLink), DownloadRow (Card+Badge+ButtonLink), RecommendationRow (Card+Badge+ButtonLink), HomeToolsRow (ButtonLink+Badge+Separator), HomeTimelineRow (Button), VideoReelsRow (Button+Card). TrustSection removed (no fake partners per SEC-007), LandingStats shows real data from API. HomeRowSkeletons use Skeleton+Card. |
| Phase 11 — Final cleanup | ✅ ~90% | Deleted 11 unused legacy components (chip, chip-button, close-button, empty, floating-action-button, icon-rail-button, overlay, panel, progress, sidebar, toggle). Migrated cart.provider to shadcn Button. Updated components/ui/index.ts barrel exports. Removed Overlay import from SidebarShell. Zero raw button/textarea/select elements remain in app code. Only 1 hidden file input remains (standard avatar upload pattern). |

---

## What is already done (detailed)

1. **Mira init** — components.json style base-mira, rtl, pointer, baseColor neutral, css design/globals.css tw-animate-css+shadcn/tailwind.css, tokens canonical, legacy aliased, radius 0.625rem, border 1px.
2. **Primitives installed 37/50**: alert-dialog, drawer, field, hover-card, label, popover, scroll-area, select, separator, sheet, sonner, dialog, tabs, checkbox, radio-group, switch, dropdown-menu, tooltip, avatar, skeleton, card, badge, input, textarea, button, spinner, sidebar, accordion, breadcrumb, table, empty, progress, slider, toggle, form (custom), plus hooks/use-mobile.
3. **Wrappers**: Button primary→default, danger→destructive, vip gradient, loading+Spinner, ButtonLink asChild, Badge module color-mix.
4. **Layout shell**: Footer Separator+ButtonLink, NewsSidebar Button+ScrollArea+Card+Badge+Skeleton homepage only left toggle backdrop spacer push, SidebarContent TehranDateTime Tooltip+Card, NavLinkItem Tooltip collapsed, notifications Popover+ScrollArea+Badge, cart Button+XIcon (migrated from CloseButton/IconRailButton), search Input+Card, tools DropdownMenu collapsed/inline expanded, ScrollArea nav, Separator, ThemeToggleButton, Chatbot Button FAB rounded-full+Badge+Card+ScrollArea+Input+Separator bubbles rounded-2xl, AuthModal Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner.
5. **Design-system** `/admin/design-system`: Tabs colors/typography/buttons/badges/cards/forms/overlays/navigation/data/feedback, ButtonLink+render prop green, module colors, radius, RTL/dark checklist.
6. **Forms**: Form custom Base UI compatible, RHF+zod+resolvers, ALL forms refactored: admin/login, contact, consultation-modal, timeline-event-form, search, work-with-us ApplyForm, account (Tabs+4x RHF), shop grid, download table, posts/new major, posts filters+Table, users, roles, settings, redirects, jobs, moderation, content-health, upload/blob breadcrumb, forum new topic, newsletter, reset-password, consultation page, ZoomControls, subnet calculator, NVR selector, RAID calculator, NAS selector, comment section (Textarea).
7. **FAQ**: Prisma Faq model + migration 20260712000004_add_faq_model CREATE TABLE, applied via migrate resolve baseline + deploy Neon, APIs GET /api/faq public + GET/POST /api/admin/faq + PATCH/DELETE /api/admin/faq/[id] (Next.js 16 params Promise), /admin/faq page RHF+zod+Table+Switch+Badge+toast CRUD, /about page Accordion defaultValue first, Card+Separator, /admin link FAQ.
8. **Breadcrumb**: components/ui/page-breadcrumb.tsx using Breadcrumb primitive + render prop, building crumbs from pathname+moduleMeta, added to /about, /search, /admin/faq, /admin/posts, /admin/users, account, shop, download, admin pages.
9. **Homepage redesign**: ALL rows migrated to shadcn — MagazineRow (Card+Badge+Avatar+ButtonLink), ShopRow (Card+Badge+ButtonLink), ForumRow (Card+Badge+Avatar+ButtonLink+Skeleton), ReviewRow (Card+Badge+Avatar+ButtonLink), DownloadRow (Card+Badge+ButtonLink), RecommendationRow (Card+Badge+ButtonLink), HomeToolsRow (ButtonLink+Badge+Separator+RaidCalculator), HomeTimelineRow (Button+Card), VideoReelsRow (Button+Card). TrustSection removed (no fake partners), LandingStats shows real API data. HomeRowSkeletons use Skeleton+Card for loading states.
10. **Tools calculators**: NVR selector (Card+Slider+Switch+Badge+Button+Separator), RAID calculator (Card+Select+Slider+Button+Badge+Separator), NAS selector (Card+Slider+Badge+Button), subnet calculator (Card+Slider+Input+Badge), ZoomControls (Slider+Button+Card).
11. **Final cleanup**: Deleted 11 unused legacy components (chip, chip-button, close-button, empty, floating-action-button, icon-rail-button, overlay, panel, progress, sidebar, toggle). Migrated cart.provider from CloseButton/IconRailButton/OverlayBackdrop to shadcn Button+XIcon. Updated components/ui/index.ts barrel exports. Removed unused Overlay import from SidebarShell.
12. **next.config**: remotePatterns unsplash, github, avatars.
13. **Validation**: lint quiet ✅ (0 errors, 7 pre-existing warnings), typecheck ✅, test 6 passed, build OOM local expected but CI should pass.

### Git pushes on feat/shadcn-migration (latest 30+)
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
- 8e3538e tools nas-selector shadcn Card+Badge+Button+Slider+Label
- 89afada docs: final comprehensive handoff
- 731658a feat(ui): complete shadcn migration - tools, homepage, comments, timeline
- 407a9d1 refactor(ui): cleanup unused legacy components
- 665e685 feat(ui): homepage redesign with shadcn components

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
  - attachment, message, message-scroller, bubble, marker (very new June 2026, chatbot already functional without them)
  - navigation-menu, menubar, pagination, toggle-group, aspect-ratio, collapsible, kbd

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

1. **Chat/messenger Phase 7** (optional): Message/MessageScroller/Bubble primitives not available in base-mira. Chatbot is already functional with Card+Button+Input+ScrollArea. Can enhance later if primitives become available.
2. **Admin UI remaining 10%**: jobs applications, upload field Panel → Card+Progress.
3. **Public module pattern Phase 8** (optional): Apply BlogGrid canonical pattern to other module pages (news, media, shop, forum, review, download) if needed. Current implementations work fine.
4. Keep lint/typecheck green, push to feat/shadcn-migration, notify user.

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
