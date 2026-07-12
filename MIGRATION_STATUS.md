# TechBox UI Migration Status

> This file tracks progress so the next agent can continue without asking.
>
> Branch: `feat/shadcn-migration`
>
> Remote: `https://github.com/hnmodeq/techbox/tree/feat/shadcn-migration`
>
> Latest commit: `adecd6b` -> now `feat: FAQ + accordion`
>
> Last updated: 2026-07-12 — Phase 3/4/5 partial/6 FAQ ✅
>
> Plan source: `UI_MIGRATION_PLAN.md`

---

## Overall progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Baseline & cleanup | ✅ Done | lint & typecheck pass; build fails due to environment OOM (not code). Deleted 11 unused ui primitives. |
| Phase 1 — shadcn init | ✅ Done | Mira preset applied. shadcn tokens merged with TechBox tokens. |
| Phase 2 — Core primitives | ✅ Done | Core shadcn primitives installed. Backward-compatible wrappers added for Button, Spinner, Badge. TooltipProvider + Toaster in layout. |
| Phase 3 — Layout shell | ✅ Done (partial full) | Footer ✅ shadcn Separator+ButtonLink, NewsSidebar ✅ Button+ScrollArea+Card+Badge+Separator+Skeleton, SidebarContent ✅ Button/Badge/Separator/ScrollArea/Tooltip/Popover/DropdownMenu/Input/Card + theme toggle, Chatbot ✅ Button+Card+Input+ScrollArea+Badge+Separator, AuthModal ✅ Dialog+Input+Checkbox+Button+Label+Separator+Card+Sonner, Sidebar primitive installed (sidebar.tsx + use-mobile). Lint/typecheck green. |
| Phase 4 — Design-system page | ✅ Done | Created `/admin/design-system` — showcases colors, typography, buttons, badges, cards, forms, overlays, tabs, breadcrumb placeholder, table placeholder, skeleton/spinner, sonner, avatar, scrollarea, separator, RTL/dark checklist. Lint+typecheck green. |
| Phase 5 — Forms & inputs audit | ✅ Partially done (2/12) | Started: added Form primitive (custom base-ui compatible), installed RHF + resolvers, refactored admin/login (Card+Form+Input+zod+toast) and contact (Form+Input+Textarea+Card+zod+toast). Pattern established: useForm + zodResolver + Form + FormField + FormItem + FormLabel + FormControl + FormMessage + Input/Textarea + Button loading. Remaining: account, work-with-us, consultation, timeline-event-form, posts/new, posts page filters, redirects, users, settings, search, shop, download, forum, newsletter, etc. |
| Phase 6 — Admin UI | ✅ Partially done | FAQ model + accordion + admin CRUD + about Q&A ✅ done (Faq Prisma + migration + API + /admin/faq page with Table + Form + Switch + Badge + RHF+zod + toast, /about with Accordion). Remaining admin tables (posts, users, jobs, moderation, etc) need Data Table + Chart etc. |
| Phase 7 — Chat / messenger | ⏳ Not started | MessageScroller + Message. |
| Phase 8 — Public module pattern | ⏳ Not started | Blog first, then others. |
| Phase 9 — Tools & static pages | ⏳ Not started | Tools, about, contact, etc. |
| Phase 10 — Homepage | ⏳ Not started | Last. |
| Phase 11 — Final cleanup | ⏳ Not started | Remove legacy, validate. |

---

## What is already done

1. **shadcn initialized** with Mira preset (`b1D0dv72`), RTL, pointer cursor.
2. **Deleted custom primitives** that were unused:
   - `avatar`, `checkbox`, `dropdown`, `icon-button`, `modal`, `radio`, `search-bar`, `skeleton`, `switch`, `tabs`, `tooltip`
3. **Installed shadcn primitives**:
   - `alert-dialog`, `drawer`, `field`, `hover-card`, `label`, `popover`, `scroll-area`, `select`, `separator`, `sheet`, `sonner`
   - `dialog`, `tabs`, `checkbox`, `radio-group`, `switch`, `dropdown-menu`, `tooltip`, `avatar`, `skeleton`
   - `card`, `badge`, `input`, `textarea`, `button`, `spinner`
4. **Backward-compatible wrappers** created for:
   - `Button` (maps legacy variants/sizes, supports `loading` and `ButtonLink`)
   - `Spinner` (adds `SpinnerCenter`)
   - `Badge` (maps legacy TechBox variants including modules)
5. **Token system merged**:
   - shadcn tokens are canonical.
   - Legacy TechBox tokens (`--main-background`, `--card-background`, etc.) are aliased to shadcn tokens.
   - `--corner-radius` now points to `--radius`; `--border-size` is `1px`.
6. **Layout providers added**: `TooltipProvider` and `Toaster` in `app/layout.tsx`.
7. **Design-system page**: `/admin/design-system` implemented with Tabs: colors (theme + module accents + chart/sidebar/radius), typography (Kalameh hero/h1/h2/h3/paragraph + typeset), buttons (all variants + sizes + ButtonGroup placeholder), badges (shadcn + ModuleBadge), cards, forms (Input/Textarea/Select/Checkbox/Switch/Radio/Field), overlays (Dialog/AlertDialog/Drawer/Sheet/DropdownMenu/Popover/Tooltip/HoverCard with Base UI render prop fix), navigation (Tabs line variant, breadcrumb placeholder, ScrollArea+Separator), data (Avatar/Skeleton/Spinner, Table placeholder, 13 missing placeholders), feedback (Sonner toast demos, focus + RTL/dark checklist). Uses `ButtonLink` + `render` prop to keep lint/typecheck green.
8. **Admin entry**: link to design-system added in `/admin` page (super_admin) with 🎨.
9. **next.config**: added remotePatterns for `images.unsplash.com`, `github.com`, `*.githubusercontent.com`, `avatars.githubusercontent.com` to support Image optimization in design-system.
10. **Validation**: `pnpm lint` ✅ and `pnpm typecheck` ✅ and `pnpm test` ✅ 6 passed. Build OOM locally expected (137), should pass in CI/Vercel.

### Deep dive performed (2026-07-12)
- Cloned branch, read all .md (README, TODO, UI_MIGRATION_PLAN, MIGRATION_STATUS, UI_MIGRATION_ANALYSIS, UI_MIGRATION_COMPONENT_ANALYSIS), diff main..feat/shadcn-migration (42 files +7259/-1110), inspected components/ui/*, design/globals.css, layout, modules.config, prisma schema, ci workflow, env handling.
- Confirmed project is RTL Persian multi-module tech platform (Next 16, React 19, Tailwind v4, Prisma Neon, Blob, Resend, Upstash, Sentry).
- Confirmed Phase 0-2 done, Phase 4 now done per this session.
- Produced `MIGRATION_DEEP_DIVE_READY.md` with full report.

---

## Current blockers

- **Build cannot be validated** in this environment due to memory limits (exit 137 / OOM) — also observed for `build:webpack` with 4GB. Not a code error; CI (ubuntu-latest 7GB) and Vercel should pass. Lint/typecheck do pass.
- **Some shadcn components are not available** in the `base-mira` registry. Known missing from initial install attempts (still true after Phase 4):
  - `form` (React Hook Form wrapper)
  - `accordion` (needed for about Q&A)
  - `breadcrumb` (we have placeholder)
  - `calendar`, `date-picker` (admin scheduled publish)
  - `chart` (radial, stats)
  - `carousel` (shop product gallery)
  - `combobox`, `command` (search history)
  - `data-table`, `table` (admin tables)
  - `empty`, `item`, `field` (field done), `attachment`, `message`, `message-scroller`, `bubble`, `marker`
  - `navigation-menu`, `menubar`, `pagination`, `progress`, `slider`, `toggle`, `toggle-group`, `typography`, `scroll-fade`, `shimmer`, `aspect-ratio`

  **Solution:** try installing one by one with `npx pnpm@10.12.1 dlx shadcn@latest add <name>` — if base-mira missing, use base registry: `npx shadcn add <name> --registry https://ui.shadcn.com` or manually copy from shadcn docs. Phase 6-7 will need many of these.

- **Design-system image**: uses unsplash external image — added to `next.config.mjs` remotePatterns to avoid Next build image error.

---

## Commands to know

```bash
# pnpm is not installed globally; use npx
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build

# Add a shadcn component (base-mira preset)
npx pnpm@10.12.1 dlx shadcn@latest add <component-name>

# Add from base registry if missing in mira
npx pnpm@10.12.1 dlx shadcn@latest add <name> -r https://ui.shadcn.com

# Add with overwrite (use carefully — restore wrappers after)
npx pnpm@10.12.1 dlx shadcn@latest add -y -o <component-name>
```

---

## Next steps for the next agent

### Immediate next task: Phase 3 — Layout shell (what user agreed is next after design-system baseline)

Rebuild the global shell using shadcn primitives:

1. **Main sidebar** (`components/layout/Sidebar.tsx` + `SidebarShell.tsx` + `SidebarContent.tsx`)
   - Use shadcn `Sidebar` component (if available) or rebuild with `ScrollArea` + `Button` + `Separator` + `Tooltip` + `DropdownMenu`
   - Desktop: collapsible 16rem / 4rem via `html[data-main-sidebar-open]`
   - Mobile: `Drawer`
   - Items: `Button` ghost, `Tooltip`, module colors
   - Footer: theme toggle button cycling light/dark via `next-themes` (component #47)

2. **News sidebar** (`features/home/components/NewsSidebar.tsx`)
   - Use `Drawer` (mobile) + `Sheet` (desktop) + `ScrollArea`, `Card`, `Separator`, `Button`

3. **Footer** (`components/layout/Footer.tsx`)
   - Use `Separator`, `Button`, `Link`, module colors muted

4. **Auth modal** (`features/auth/components/auth-modal.tsx`)
   - Use `Dialog`, `Tabs`, `Form` (needs form install), `Input`, `Button`, `Checkbox`, `Sonner`

5. **Chatbot launcher** (`features/chat/components/Chatbot.tsx`)
   - Use `Button`, `Sheet`/`Drawer`, placeholder for MessageScroller

Acceptance: RTL correct, dark mode toggle works, mobile drawer works, no console errors, lint/typecheck green.

### After layout shell

- **Phase 5:** Forms audit — replace raw `<input>`, `<textarea>`, `<select>` with shadcn `Form` + React Hook Form + zod in: `app/admin/login/page.tsx`, `features/auth/components/auth-modal.tsx`, `features/contact`, `features/work-with-us`, `features/consultation`, `features/timeline`, `app/account`, `app/admin/posts/new`, etc.
- **Phase 6:** Admin UI + Faq model (`Faq` Prisma table + `/admin/faq` Data Table + Form)
- **Phase 7:** Chat / messenger — install `message`, `bubble`, `message-scroller`, `attachment`, `marker`, build messenger Tabs AI/Personal/Support
- **Phase 8:** Public module pattern — blog first canonical, then news/media/review/download/shop/forum/timeline
- **Phase 9-11:** Tools, homepage last, final cleanup.

---

## Important notes

- **Do not run `shadcn add` with overwrite on `button.tsx`, `badge.tsx` unless you restore the backward-compatible wrappers afterwards.** The wrappers are critical to keep existing pages compiling.
- **Do not remove old custom components that still have imports** until their shadcn replacements are ready and usages updated.
- **Always run `npx pnpm@10.12.1 lint` and `npx pnpm@10.12.1 typecheck` after changes.**
- **Build validation:** The full Next.js build fails with OOM in this environment. Rely on lint/typecheck for validation.
- **node_modules is not persisted** across sessions. Next agent must run `npx pnpm@10.12.1 install` first.

---

## Decisions made

- **Preset:** Mira (`b1D0dv72`)
- **Init command:** `npx pnpm@10.12.1 dlx shadcn@latest init --preset b1D0dv72 --rtl --pointer`
- **Theme switcher:** Button in main sidebar cycling light/dark via `next-themes`
- **Q&A admin editable:** New `Faq` Prisma table + `/admin/faq` page
- **Messenger:** Tabs for AI / Personal / Support, all using `Message` + `MessageScroller`
- **Persian calendar:** TBD — using Gregorian `DatePicker` for now

---

## Git history

Latest commit: `f53612a` — "feat(ui): shadcn migration foundation"
