# TechBox UI Migration Status

> This file tracks progress so the next agent can continue without asking.
>
> Last updated: 2026-07-12
>
> Plan source: `UI_MIGRATION_PLAN.md`

---

## Overall progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Baseline & cleanup | ✅ Done | lint & typecheck pass; build fails due to environment OOM (not code). Deleted 11 unused ui primitives. |
| Phase 1 — shadcn init | ✅ Done | Mira preset applied. shadcn tokens merged with TechBox tokens. |
| Phase 2 — Core primitives | ✅ Partially done | Core shadcn primitives installed. Backward-compatible wrappers added for Button, Spinner, Badge. |
| Phase 3 — Layout shell | ⏳ Not started | Rebuild Sidebar, Footer, NewsSidebar, AuthModal with shadcn. |
| Phase 4 — Design-system page | ⏳ Not started | Create `/admin/design-system`. |
| Phase 5 — Forms & inputs audit | ⏳ Not started | Replace raw inputs with shadcn Form. |
| Phase 6 — Admin UI | ⏳ Not started | Admin dashboard + tables. |
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
   - `card`, `badge`, `input`, `textarea`
4. **Backward-compatible wrappers** created for:
   - `Button` (maps legacy variants/sizes, supports `loading` and `ButtonLink`)
   - `Spinner` (adds `SpinnerCenter`)
   - `Badge` (maps legacy TechBox variants including modules)
5. **Token system merged**:
   - shadcn tokens are canonical.
   - Legacy TechBox tokens (`--main-background`, `--card-background`, etc.) are aliased to shadcn tokens.
   - `--corner-radius` now points to `--radius`; `--border-size` is `1px`.
6. **Layout providers added**: `TooltipProvider` and `Toaster` in `app/layout.tsx`.
7. **Validation**: `pnpm lint` and `pnpm typecheck` pass.

---

## Current blockers

- **Build cannot be validated** in this environment due to memory limits (exit 137 / OOM).
- **Some shadcn components are not available** in the `base-mira` registry. Known missing from initial install attempts:
  - `form` (React Hook Form wrapper)
  - `accordion`
  - `date-picker`
  - `calendar`?
  - `chart`?
  - `carousel`?
  - `combobox`?
  - `command`?
  - `data-table`?
  - `empty`?
  - `item`?
  - `marker`?
  - `menubar`?
  - `message`?
  - `message-scroller`?
  - `bubble`?
  - `attachment`?
  - `navigation-menu`?
  - `pagination`?
  - `progress`?
  - `toggle`?
  - `toggle-group`?
  - `typography`?
  - `scroll-fade`, `shimmer`

  **Next agent:** try installing them one by one with `npx pnpm@10.12.1 dlx shadcn@latest add <name>`. If a component is not in `base-mira`, install from the base shadcn registry or create a custom one.

---

## Commands to know

```bash
# pnpm is not installed globally; use npx
npx pnpm@10.12.1 install
npx pnpm@10.12.1 lint
npx pnpm@10.12.1 typecheck
NODE_OPTIONS="--max-old-space-size=4096" npx pnpm@10.12.1 build

# Add a shadcn component
npx pnpm@10.12.1 dlx shadcn@latest add <component-name>

# Add with overwrite (use carefully)
npx pnpm@10.12.1 dlx shadcn@latest add -y -o <component-name>
```

---

## Next steps for the next agent

### Immediate next task: Phase 3 — Layout shell

Rebuild the global shell using shadcn primitives:

1. **Main sidebar** (`components/layout/Sidebar.tsx` + `SidebarShell.tsx` + `SidebarContent.tsx`)
   - Use shadcn `Sidebar` for desktop.
   - Use shadcn `Drawer` for mobile.
   - Use `Button`, `Tooltip`, `Separator`, `ScrollArea`, `DropdownMenu` for items.
   - Add theme toggle button in sidebar footer (cycles light/dark via `next-themes`).

2. **News sidebar** (`features/home/components/NewsSidebar.tsx`)
   - Use `Drawer` (mobile) + `Sheet` (desktop optional).
   - Use `ScrollArea`, `Card`, `Separator`, `Button`.

3. **Footer** (`components/layout/Footer.tsx`)
   - Use `Separator`, `Button`, `Link`.

4. **Auth modal** (`features/auth/components/auth-modal.tsx`)
   - Use `Dialog`, `Tabs`, `Form`, `Input`, `Button`, `Checkbox`, `Sonner`.

5. **Chatbot launcher** (`features/chat/components/Chatbot.tsx`)
   - Use `Button`, `Sheet`/`Drawer`.

### After layout shell

- **Phase 4:** Create `/admin/design-system` showing all installed primitives.
- **Phase 5:** Forms audit — replace raw `<input>`, `<textarea>`, `<select>` with shadcn `Form` + React Hook Form.
- **Phase 6:** Admin UI with `Data Table`, `Card`, `Chart`, etc.

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
