# TechBox UI Migration Plan

> Goal: redesign the UI without losing the existing TechBox identity, RTL/Persian experience, module color system, or backend stability.
>
> Recommended direction: **Tailwind + shadcn-style primitives + TechBox tokens as the source of truth**.


---

## Agent execution contract — read before editing

This section is intentionally strict so another coding agent can continue the UI migration without making the project messy.

### Non-negotiable rules

1. **Do not rewrite the whole UI.** Work in small, reviewable PR-sized steps.
2. **Do not start with the homepage.** Homepage is Phase 7 and should happen after primitives/module patterns are stable.
3. **Do not delete “maybe unused” components in the same PR as redesign work.** Deletion requires a separate cleanup PR with proof from search/import analysis.
4. **Do not overwrite existing `components/ui/*` blindly with shadcn CLI output.** Compare, then merge manually while preserving existing imports where possible.
5. **Do not remove TechBox tokens.** Add shadcn-compatible aliases that point to TechBox tokens.
6. **Do not hard-code module colors in pages.** Use `config/modules.config.ts`, `config/module-colors.ts`, `moduleMeta`, or CSS variables.
7. **Do not break RTL.** Every new component must be checked in Persian/RTL layout.
8. **Do not introduce fake data, fake stats, fake partners, or placeholder claims.** Empty states must be honest.
9. **Do not mix unrelated goals.** Example: do not redesign admin, migrate shadcn, delete unused files, and change data APIs in one PR.
10. **Do not change backend behavior unless the UI task is blocked by a real API/data problem.**

### Required validation after every UI task

Run at minimum:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If a task touches interactions/forms, also run or manually verify the relevant page flow.

### Preferred PR/task size

A good UI PR should usually touch:

- 1–3 primitives, **or**
- 1 page + its composed components, **or**
- 1 design-system/demo page update

Avoid PRs that touch 20+ unrelated files unless they are mechanical import changes.

### Exact first task for the next agent

If no UI migration work has started yet, the next agent should do only this:

1. Add the shadcn-compatible token bridge in `design/globals.css`.
2. Add `app/admin/design-system/page.tsx` as a private visual playground.
3. Show existing tokens/components on that page.
4. Do **not** redesign real product pages yet.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm build`.

### Definition of “done” for the first task

- `/admin/design-system` renders.
- It shows module color swatches.
- It shows Button/Card/Input/Textarea/Badge examples.
- Existing pages still look acceptable.
- Build log is clean.
- No public page redesign was attempted.

---

## 1. Decision summary

### Use shadcn?

**Yes, but as a component/primitives pattern — not as a full brand replacement.**

Use shadcn-style components for generic UI primitives:

- Button
- Card
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Tabs
- Dialog / Modal
- Dropdown Menu
- Tooltip
- Table
- Form
- Toast / Sonner
- Skeleton

Keep TechBox-specific components custom:

- RTL layout shell
- Sidebar / dock
- Module header
- Page header
- Module badge
- Content cards
- Timeline UI
- Forum topic UI
- Product gallery/detail UI
- Home feed rows
- Chroma/effect components
- Module color behavior

### Use shadcn tokens or current TechBox tokens?

**Keep TechBox tokens as the source of truth.**

Add shadcn-compatible token names as a bridge that points to the existing TechBox variables. This lets shadcn components work while preserving the current brand system.

---

## 2. Current design system facts

The project already has a design system foundation:

- `design/globals.css` — global CSS variables, colors, typography, theme behavior
- `design/icons.tsx` — shared icon layer
- `design/z-index.ts` — z-index scale
- `config/modules.config.ts` — module registry and metadata
- `config/module-colors.ts` — module color source
- `components/ui/*` — shared UI primitives
- `components/effects/*` — visual/effect components
- `components/layout/*` — shell/sidebar/footer
- `features/*/components/*` — module-specific UI

Important existing tokens include:

```css
--main-background
--card-background
--button-background
--modal-background
--sidebar-background
--primary-text
--paragraph-color
--border-color
--corner-radius
--shadow-size
--ring-color
--blog
--news
--media
--shop
--tools
--download
--forum
--review
--timeline
--admin
--success
--danger
--warning
--info
```

These should remain the **TechBox brand tokens**.

---

## 3. Token bridge plan

Add shadcn-compatible aliases in `design/globals.css` while keeping the current tokens.

Suggested bridge:

```css
:root {
  --background: var(--main-background);
  --foreground: var(--primary-text);

  --card: var(--card-background);
  --card-foreground: var(--primary-text);

  --popover: var(--modal-background);
  --popover-foreground: var(--primary-text);

  --primary: var(--home);
  --primary-foreground: white;

  --secondary: var(--card-background);
  --secondary-foreground: var(--primary-text);

  --muted: var(--card-background);
  --muted-foreground: var(--paragraph-color);

  --accent: var(--card-background);
  --accent-foreground: var(--primary-text);

  --destructive: var(--danger);
  --destructive-foreground: white;

  --border: var(--border-color);
  --input: var(--border-color);
  --ring: var(--ring-color);

  --radius: var(--corner-radius);
}
```

Then shadcn-style components can use classes such as:

```tsx
bg-background text-foreground border-border
bg-card text-card-foreground
text-muted-foreground
ring-ring
```

But visually they still follow TechBox.

---

## 4. Component inventory

This is a first-pass static usage scan. It is not a deletion list; it is a review list.

### 4.1 High-use shared UI components

Keep and normalize first:

| Component | Status | Notes |
|---|---|---|
| `components/ui/button.tsx` | Keep / shadcn-align | Very widely used. Do not replace imports. Improve internally. |
| `components/ui/badge.tsx` | Keep / shadcn-align | Widely used. Preserve neutral/module behavior intentionally. |
| `components/ui/card.tsx` | Keep / shadcn-align | Good candidate for shadcn-compatible structure. |
| `components/ui/card-stats.tsx` | Keep | Used in content cards; may become a composed primitive. |
| `components/ui/module-badge.tsx` | Keep custom | TechBox-specific. |
| `components/ui/like-button.tsx` | Keep custom | Product behavior, not generic. |
| `components/ui/live-view-counter.tsx` | Keep custom | Product behavior, not generic. |
| `components/ui/overlay.tsx` | Keep / align | Can align to Dialog/Sheet patterns later. |
| `components/ui/panel.tsx` | Keep / align | Useful base component. |
| `components/ui/close-button.tsx` | Keep | Generic but already integrated. |

### 4.2 Possible shadcn replacement/normalization candidates

These can be replaced or rewritten in shadcn style:

| Component | Suggested action |
|---|---|
| `components/ui/avatar.tsx` | Replace/align with shadcn Avatar |
| `components/ui/checkbox.tsx` | Replace/align with shadcn Checkbox |
| `components/ui/radio.tsx` | Replace/align with shadcn RadioGroup |
| `components/ui/switch.tsx` | Replace/align with shadcn Switch |
| `components/ui/tabs.tsx` | Replace/align with shadcn Tabs |
| `components/ui/tooltip.tsx` | Replace/align with shadcn Tooltip |
| `components/ui/dropdown.tsx` | Replace/align with shadcn DropdownMenu |
| `components/ui/modal.tsx` | Replace/align with shadcn Dialog |
| `components/ui/input.tsx` | Normalize as shadcn-style Input |
| `components/ui/textarea.tsx` | Normalize as shadcn-style Textarea |
| `components/ui/skeleton.tsx` | Normalize as shadcn-style Skeleton |

### 4.3 Maybe-unused shared UI components

Static scan found no obvious usages. Verify manually before deleting:

```txt
components/ui/avatar.tsx
components/ui/checkbox.tsx
components/ui/icon-button.tsx
components/ui/radio.tsx
components/ui/search-bar.tsx
components/ui/tabs.tsx
components/ui/tooltip.tsx
components/effects/BorderGlow.tsx
components/effects/GradientText.tsx
```

### 4.4 Maybe-unused feature components

Verify manually before deleting:

```txt
features/comment/components/MentionInput.tsx
features/content/components/ModuleList.tsx
features/home/components/HomeModulesSection.tsx
features/home/components/HomeToolsRow.tsx
features/home/components/TechLogoLoopSection.tsx
features/media/components/VideoPlayer.tsx
```

### 4.5 Components to keep custom

These are TechBox-specific and should not be replaced by generic shadcn components:

```txt
components/layout/*
components/effects/ModuleHeader.tsx
components/effects/PageHeader.tsx
components/effects/ChromaGrid.tsx
components/effects/Dock.tsx
components/effects/LogoLoop.tsx
components/effects/ModuleBorderGlow.tsx
features/content/components/ContentCard.tsx
features/content/components/BentoCard.tsx
features/content/components/DbContentDetail.tsx
features/home/components/*Row.tsx
features/timeline/components/*
features/shop/components/*
features/forum/components/*
features/tools/components/*
```

---

## 5. Migration principles

1. **Do not redesign everything at once.**
2. **Do not delete tokens before the new system is proven.**
3. **Do not replace imports globally unless needed.** Prefer improving existing files internally.
4. **Keep RTL and Persian typography as first-class requirements.**
5. **Use shadcn for generic primitives only.**
6. **Keep module colors custom.** shadcn does not understand TechBox modules.
7. **Make every new component work in light and dark mode.**
8. **Every interactive component must have focus states.**
9. **Prefer composition over page-specific one-offs.**
10. **Homepage is last, not first.**

---

## 6. Recommended migration phases

### Phase 0 — Safety baseline

Before UI work:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Confirm:

- DB health is good in Vercel: `/api/healthz`
- Production content is not empty
- Admin dashboard numbers are DB-backed
- No deprecated build warnings remain

### Phase 1 — Token bridge

Files:

```txt
design/globals.css
```

Tasks:

- Add shadcn-compatible token aliases
- Keep existing TechBox tokens
- Confirm light/dark mode still works
- Confirm module colors still work

Acceptance:

- Existing UI looks the same or better
- shadcn-style classes can use `bg-background`, `text-foreground`, `border-border`
- `pnpm build` is clean

### Phase 2 — Core primitive normalization

Files:

```txt
components/ui/button.tsx
components/ui/card.tsx
components/ui/input.tsx
components/ui/textarea.tsx
components/ui/badge.tsx
components/ui/skeleton.tsx
```

Tasks:

- Make components shadcn-compatible internally
- Preserve existing public API where possible
- Avoid mass refactors

Acceptance:

- Existing pages still compile
- Existing imports still work
- Button/card/input visual states are consistent
- Keyboard focus states are visible

### Phase 3 — Add missing primitives

Add or normalize:

```txt
components/ui/dialog.tsx
components/ui/dropdown-menu.tsx
components/ui/select.tsx
components/ui/table.tsx
components/ui/tabs.tsx
components/ui/tooltip.tsx
components/ui/form.tsx
components/ui/sonner.tsx or toast.tsx
```

Acceptance:

- New primitives use TechBox/shadcn token bridge
- RTL alignment is checked
- Components have examples in design-system page

### Phase 4 — Create design-system page

Recommended route:

```txt
app/admin/design-system/page.tsx
```

Why admin route?

- It is not public marketing UI
- It can be used as a private playground
- It is okay if it changes frequently

The page should display:

- Colors/module swatches
- Typography scale
- Buttons
- Inputs
- Textarea
- Select
- Checkbox/radio/switch
- Cards
- Badges
- Dialog/modal
- Dropdown
- Tabs
- Table
- Skeletons
- Empty states
- Dashboard stat cards
- Content cards

Acceptance:

- One page shows the whole visual language
- Easy to compare light/dark mode
- Easy to test component changes before touching real pages

### Phase 5 — Admin UI redesign

Start with admin because it is internal and structured.

Order:

```txt
/admin
/admin/settings
/admin/posts
/admin/posts/new
/admin/users
/admin/moderation
/admin/jobs
```

Create composed admin components:

```txt
components/admin/AdminPageShell.tsx
components/admin/AdminSection.tsx
components/admin/AdminStatCard.tsx
components/admin/AdminToolbar.tsx
components/admin/AdminTable.tsx
components/admin/AdminEmptyState.tsx
components/admin/AdminFormSection.tsx
```

Acceptance:

- Admin dashboard shows real DB stats
- Forms look consistent
- Tables are readable in RTL
- Mobile/tablet layout is acceptable

### Phase 6 — Public module pattern

Pick one module first:

```txt
/blog
/blog/[slug]
```

Create a reusable module pattern:

```txt
ModuleListPage
ModuleDetailPage
ContentCard
ContentGrid
ContentHero
ContentMeta
```

Then apply to:

```txt
/news
/media
/review
/download
/shop
/forum
```

Acceptance:

- One visual pattern works across modules
- Module colors remain distinct
- Detail pages are readable
- Mobile layout is good

### Phase 7 — Homepage redesign last

Homepage is the hardest page because it combines everything.

Do it after module cards, headers, and feed rows are stable.

Acceptance:

- No fake stats/claims
- Server-rendered content appears immediately
- Layout does not feel crowded
- Mobile experience is strong

---

## 7. Suggested shadcn install/use approach

Do not blindly install every shadcn component.

Recommended approach:

1. Add components one by one.
2. Compare generated code with existing `components/ui` files.
3. Merge the ideas into existing files if imports are already widely used.
4. Keep TechBox tokens.
5. Test after each primitive.

Example command pattern if using shadcn CLI:

```bash
pnpm dlx shadcn@latest add button card input textarea badge dialog dropdown-menu tabs tooltip table select checkbox radio-group switch skeleton
```

But before running it, decide whether generated files should overwrite existing files. In this project, prefer **reviewing and merging manually** over overwrite.

---

## 8. Component naming rules

### Generic primitive names

Use shadcn-style names:

```txt
Button
Card
Input
Textarea
Badge
Dialog
DropdownMenu
Tabs
Table
Tooltip
Skeleton
```

### TechBox composed names

Use domain-specific names:

```txt
ModuleHeader
PageHeader
ModuleBadge
ContentCard
DashboardStatCard
AdminTable
ForumTopicRow
ProductSpecTable
TimelineCard
ToolPageHeader
```

### Avoid vague names

Avoid:

```txt
Box
Thing
Section2
NewCard
BetterButton
CustomComponent
```

---

## 9. File organization target

Keep current architecture, but make boundaries clearer:

```txt
components/ui/           generic primitives
components/layout/       app shell, sidebar, footer
components/effects/      visual effects / animated display components
components/admin/        admin-specific composed components
features/<module>/       module-specific UI and behavior
config/                  module registry, colors, sidebar config
design/                  tokens, icons, z-index
```

Do not move everything into `components/ui`. That folder should stay generic.

---

## 10. Redesign checklist for each page

Before marking a page redesigned:

- [ ] Uses shared primitives where possible
- [ ] No duplicated button/card/input styling
- [ ] RTL layout is correct
- [ ] Mobile layout checked
- [ ] Dark mode checked
- [ ] Empty state exists
- [ ] Loading state exists if data is client-fetched
- [ ] Error state exists if API can fail
- [ ] Keyboard focus states visible
- [ ] No fake data or fake stats
- [ ] No console warnings/errors in browser
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes

---

## 11. First concrete tasks

Recommended first PRs:

### PR 1 — Token bridge + design-system route

- Add shadcn token aliases to `design/globals.css`
- Add `/admin/design-system`
- Show current buttons/cards/inputs/badges/colors
- No page redesign yet

### PR 2 — Button/Card/Input/Textarea/Badge normalization

- Normalize high-use primitives
- Preserve existing API
- Update design-system page examples

### PR 3 — Admin dashboard redesign

- Redesign `/admin`
- Create `AdminStatCard`
- Create `AdminSection`
- Use real dashboard stats

### PR 4 — Admin tables/forms

- Normalize `/admin/posts`, `/admin/users`, `/admin/settings`
- Introduce `AdminTable` and `AdminFormSection`

### PR 5 — First public module redesign

- Redesign `/blog` and `/blog/[slug]`
- Create reusable pattern for other modules

---

## 12. What not to do

Do not:

- Rewrite the whole UI in one PR
- Delete TechBox tokens
- Replace all components with shadcn at once
- Start with homepage
- Build page-specific one-off styles everywhere
- Ignore RTL/focus/dark-mode states
- Make module colors generic
- Remove components just because static scan says maybe unused

---

## 13. Definition of UI-ready foundation

The project is ready for full UI redesign when:

1. Build log is clean.
2. DB health is stable.
3. Token bridge exists.
4. Core primitives are normalized.
5. Design-system page exists.
6. Admin dashboard uses real DB stats.
7. A first redesigned page proves the system.

---

## 14. Current recommended direction

**Use Tailwind and shadcn-style components. Keep TechBox tokens.**

In one sentence:

> shadcn should organize your primitives; TechBox tokens should define your brand.