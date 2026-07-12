# TechBox UI Migration — Analysis & Recommended Plan Edits

> Status: analysis only. No code changes yet.
>
> Based on: `UI_MIGRATION_PLAN.md`, `design/globals.css`, `components/ui/*`, `features/*`, and all main routes.

---

## 1. Current design system in one picture

The project already has a **mature custom design system** built on Tailwind v4 + CSS variables:

| Layer | Files | What it does |
|-------|-------|--------------|
| Tokens | `design/globals.css` | Colors, typography, radii, borders, shadows, module colors |
| Utils | `lib/utils.ts` (`cn`) | `clsx` + `tailwind-merge` |
| Primitives | `components/ui/*` | Button, Card, Badge, Input, etc. (custom implementations) |
| Layout | `components/layout/*` | Sidebar, footer, layout shell |
| Effects | `components/effects/*` | Module header, page header, dock, glows, chroma |
| Module system | `config/modules.config.ts`, `config/module-colors.ts` | Registry of modules + color tokens |
| Features | `features/<module>/components/*` | Page-specific UI (blog grid, shop cards, forum list, etc.) |

### Key tokens today

```css
--main-background
--card-background
--button-background
--modal-background
--sidebar-background
--primary-text
--paragraph-color
--border-color
--corner-radius          /* currently 0px */
--border-size            /* currently 0px */
--shadow-size            /* currently 0 0 0 transparent-ish */
--ring-color
--blog, --news, --media, --shop, --tools, --download, --forum, --review, --timeline, --home, --admin, ...
```

### Visual identity today

- **Persian/RTL first** (`dir="rtl"`, Vazirmatn/Kalameh fonts).
- **Flat, square, minimal** — because `--corner-radius: 0px` and `--border-size: 0px`.
- **Module-colored accents** — each module (blog, news, shop, …) has its own color token.
- **Light/dark via `light-dark()`** — modern, no separate `.dark` variable blocks needed.

---

## 2. How shadcn fits (or doesn’t)

### What shadcn actually gives you

shadcn/ui is not a component library you install once. It is a **copy-paste registry of React primitives** built on:

- **Radix UI** for behavior (accessibility, keyboard, focus traps, RTL-aware logic).
- **Tailwind CSS** for styling.
- **Your own `globals.css` theme variables** for colors.

So adopting shadcn means:

1. Adding Radix-based primitives to `components/ui/`.
2. Mapping them to your design tokens.
3. Composing your domain components from those primitives.

### The Tailwind v4 complication

This repo is on **Tailwind CSS v4.3.2** with the new `@import "tailwindcss"` syntax. The classic shadcn CLI was built around Tailwind v3 and a `tailwind.config.ts`. The new shadcn registry is adapting to v4, but generated files still often assume the older token shape (`bg-background`, `text-foreground`, `border-border`, `rounded-lg`, etc.).

**Implication:** we cannot just run `pnpm dlx shadcn add ...` and trust the output. We will need to **manually reconcile** generated components with this project’s token system.

---

## 3. What the current migration plan gets right

`UI_MIGRATION_PLAN.md` is already very solid:

- Keeps TechBox tokens as the source of truth.
- Proposes a shadcn token bridge (`--background`, `--foreground`, `--card`, etc.).
- Does not start with the homepage.
- Insists on small PRs, lint/typecheck/build after each step.
- Insists on RTL, dark mode, focus states.
- Identifies generic primitives vs. TechBox-specific components.

---

## 4. Where the current plan needs to change

Your goals are more aggressive than the plan currently allows. The plan says **“use shadcn for generic primitives only, keep everything else custom.”** You want **“the whole website uses these components, remove custom components.”**

I agree with the direction, but we need to be **realistic** about what “use shadcn” means. Here is the honest gap:

### 4.1 You cannot replace TechBox-specific UI with raw shadcn

shadcn does not ship:

- A Persian RTL sidebar/dock.
- A module-colored page header.
- A content card grid that knows about `blog`, `news`, `shop`, etc.
- A forum topic row.
- A product gallery for server/storage gear.
- A technology timeline.

So the right goal is not **“no custom components.”** It is:

> **All generic primitives become shadcn/Radix. All domain components are thin compositions built from those primitives. Remove low-value custom primitives that duplicate shadcn.**

### 4.2 The current visual system fights shadcn

The two most important visual decisions are:

```css
--corner-radius: 0px;
--border-size: 0px;
```

This makes every shadcn component look wrong out of the box. shadcn expects subtle borders and rounded corners to show elevation, focus rings, and hierarchy.

**My strong recommendation:** change these to sensible defaults:

```css
--corner-radius: 0.5rem;   /* 8px */
--border-size: 1px;
```

and keep the **flat, clean, minimal** identity through low shadow values, neutral backgrounds, and typography — not through zero radius and zero borders.

If you keep `--corner-radius: 0px`, you will fight shadcn on every single component.

### 4.3 The token bridge in the plan is too minimal

The plan proposes:

```css
--background: var(--main-background);
--foreground: var(--primary-text);
--card: var(--card-background);
--popover: var(--modal-background);
--primary: var(--home);
--secondary: var(--card-background);
--muted: var(--card-background);
--accent: var(--card-background);
--destructive: var(--danger);
--border: var(--border-color);
--input: var(--border-color);
--ring: var(--ring-color);
--radius: var(--corner-radius);
```

This is a good start, but shadcn v4 also expects:

```css
--primary-foreground
--secondary-foreground
--muted-foreground
--accent-foreground
--destructive-foreground
--popover-foreground
--card-foreground
```

and a full **chart** palette if we use charts. We should add those explicitly and make sure they resolve to real values.

### 4.4 Some current `components/ui/*` files are dead weight

A static scan shows these are imported **nowhere**:

```
components/ui/avatar.tsx
components/ui/checkbox.tsx
components/ui/dropdown.tsx
components/ui/icon-button.tsx
components/ui/modal.tsx
components/ui/radio.tsx
components/ui/search-bar.tsx
components/ui/skeleton.tsx
components/ui/switch.tsx
components/ui/tabs.tsx
components/ui/tooltip.tsx
```

These are safe to delete and replace with shadcn equivalents when needed. The plan correctly flags them as “maybe unused,” but given your goal, we can be more decisive: **delete them as part of the shadcn migration**.

### 4.5 Heavily used custom components should be rebuilt on shadcn primitives

These are imported everywhere:

```
components/ui/button.tsx      (40 usages)
components/ui/card.tsx        (16)
components/ui/card-stats.tsx  (16)
components/ui/badge.tsx       (15)
```

The plan says “keep and normalize.” I agree, but the normalization should be more thorough:

- Re-implement `Button`, `Card`, `Badge` as shadcn-style primitives using Radix slots / standard APIs.
- Keep the same file names and similar props so we do not rewrite 40+ imports.
- Internally use shadcn classes: `bg-background`, `text-foreground`, `border-border`, `rounded-lg`, etc.
- `card-stats` is domain-specific (TechBox engagement stats) — keep it, but compose it from `Card` + `Badge`.

### 4.6 Input is barely used

`components/ui/input.tsx` is imported in only **1 file**. That means most forms are using raw `<input>` elements with inline styling. The migration plan should include a **form audit** to find all inputs, textareas, selects, and switches, then standardize them on shadcn `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`.

---

## 5. Component mapping: website parts → shadcn components

Here is a practical mapping of every major UI surface to shadcn primitives.

### Generic primitives to install (shadcn registry)

| shadcn component | Replaces current file | Used for |
|------------------|----------------------|----------|
| `button` | `components/ui/button.tsx` | Every CTA, action, link-button |
| `card` | `components/ui/card.tsx` | Panels, stat cards, content previews |
| `badge` | `components/ui/badge.tsx` | Labels, status, module tags |
| `input` | `components/ui/input.tsx` | All text inputs |
| `textarea` | `components/ui/textarea.tsx` | Multi-line text |
| `select` | `components/ui/select.tsx` | Dropdown selects |
| `checkbox` | `components/ui/checkbox.tsx` | Filters, forms, settings |
| `radio-group` | `components/ui/radio.tsx` | Single-choice forms |
| `switch` | `components/ui/switch.tsx` | Toggles |
| `tabs` | `components/ui/tabs.tsx` | Sectioned content |
| `dialog` | `components/ui/modal.tsx` | Modals, confirmations |
| `dropdown-menu` | `components/ui/dropdown.tsx` | User menus, actions |
| `tooltip` | `components/ui/tooltip.tsx` | Icon hints |
| `table` | new `components/ui/table.tsx` | Admin tables, data lists |
| `avatar` | `components/ui/avatar.tsx` | User/author avatars |
| `sonner` / `toast` | new | Notifications |
| `skeleton` | `components/ui/skeleton.tsx` | Loading states |
| `separator` | new | Dividers |
| `scroll-area` | new | Custom scroll regions |
| `sheet` | new | Mobile drawers, side panels |
| `breadcrumb` | new | Navigation paths |
| `pagination` | new | List pagination |
| `form` + `label` | new | Form validation wiring |

### Domain components to keep, but rebuild from shadcn primitives

| Domain component | Location | shadcn primitives inside |
|------------------|----------|--------------------------|
| `ModuleHeader` | `components/effects/ModuleHeader.tsx` | Typography + `Badge` |
| `PageHeader` | `components/effects/PageHeader.tsx` | Typography + `Button` + `Separator` |
| `ContentCard` | `features/content/components/ContentCard.tsx` | `Card` + `Badge` + `Avatar` |
| `BentoCard` | `features/content/components/BentoCard.tsx` | `Card` |
| `ModuleBadge` | `components/ui/module-badge.tsx` | `Badge` |
| `ForumBadge` | `components/ui/forum-badge.tsx` | `Badge` |
| `CardStats` | `components/ui/card-stats.tsx` | `Badge` / small text |
| `Sidebar` / `SidebarShell` | `components/layout/*` | `Sheet` (mobile), `Button`, `Tooltip`, `Separator`, `ScrollArea` |
| `Footer` | `components/layout/Footer.tsx` | `Separator`, `Button` |
| `NewsSidebar` | `features/home/components/NewsSidebar.tsx` | `Card`, `ScrollArea`, `Separator` |
| `Chatbot` launcher | `features/chat/components/Chatbot.tsx` | `Button`, `Sheet` / `Dialog` |
| `AuthModal` | `features/auth/components/auth-modal.tsx` | `Dialog`, `Input`, `Button` |
| Admin stat cards | inline in `app/admin/page.tsx` | `Card`, `Badge` |
| Admin tables | inline | `Table`, `Badge`, `Button`, `DropdownMenu` |
| Timeline UI | `features/timeline/components/*` | `Card`, `Badge`, `Button` |
| Product/shop UI | `features/shop/components/*` | `Card`, `Badge`, `Dialog`, `Tabs` |
| Forum UI | `features/forum/components/*` | `Card`, `Avatar`, `Badge`, `Dialog` |

### Components to delete outright

These are either unused or duplicated by shadcn:

```
components/ui/avatar.tsx          → replace with shadcn Avatar
components/ui/checkbox.tsx        → replace with shadcn Checkbox
components/ui/dropdown.tsx        → replace with shadcn DropdownMenu
components/ui/icon-button.tsx     → use shadcn Button size="icon"
components/ui/modal.tsx           → replace with shadcn Dialog
components/ui/radio.tsx           → replace with shadcn RadioGroup
components/ui/search-bar.tsx      → compose from Input + Button
components/ui/skeleton.tsx        → replace with shadcn Skeleton
components/ui/switch.tsx          → replace with shadcn Switch
components/ui/tabs.tsx            → replace with shadcn Tabs
components/ui/tooltip.tsx         → replace with shadcn Tooltip
components/ui/overlay.tsx         → use DialogOverlay / SheetOverlay
components/ui/panel.tsx           → use Card
components/ui/close-button.tsx    → use shadcn DialogClose / Button
components/effects/BorderGlow.tsx → remove if unused
components/effects/GradientText.tsx → remove if unused
```

### Components that are truly custom and should stay

These are not generic UI; they are TechBox product behavior:

```
components/effects/ChromaGrid.tsx
components/effects/Dock.tsx
components/effects/LogoLoop.tsx
components/effects/ModuleBorderGlow.tsx
components/ui/like-button.tsx
components/ui/live-view-counter.tsx
components/ui/product-gallery.tsx
components/ui/rating-widget.tsx
components/ui/review-rating.tsx
features/home/components/*Row.tsx
features/timeline/components/*
features/shop/components/*
features/forum/components/*
features/tools/components/*
```

These should be **rewritten using shadcn primitives** where possible (e.g. `Button`, `Card`, `Badge`, `Dialog`) but their domain logic stays.

---

## 6. Token strategy recommendation

Your goal #2: *“all components use the token system (which shadcn have it's tokens itself and the project already have some).”*

Best approach: **single source of truth, two naming layers.**

### Layer 1: TechBox brand tokens (keep, rename a few)

Keep these because they carry meaning:

```css
--blog, --news, --media, --shop, --tools, --download, --forum, --review, --timeline, --home, --admin, --about, --contact, ...
--success, --danger, --warning, --info
--hero-font-size, --h1-font-size, --h2-font-size, --h3-font-size
--paragraph-font-size, --paragraph-color
```

Rename or adjust these for clarity:

```css
--main-background    → --background
--card-background    → --card
--button-background  → --muted  (or remove)
--modal-background   → --popover
--sidebar-background → --card / --secondary
--primary-text       → --foreground
--border-color       → --border
--ring-color         → --ring
--corner-radius      → --radius
```

### Layer 2: shadcn token bridge

Add shadcn-compatible aliases in `design/globals.css`:

```css
:root {
  --background: var(--main-background);
  --foreground: var(--primary-text);

  --card: var(--card-background);
  --card-foreground: var(--primary-text);

  --popover: var(--modal-background);
  --popover-foreground: var(--primary-text);

  --primary: var(--home);
  --primary-foreground: #ffffff;

  --secondary: light-dark(oklch(0.96 0 0), oklch(0.22 0 0));
  --secondary-foreground: var(--primary-text);

  --muted: light-dark(oklch(0.96 0 0), oklch(0.22 0 0));
  --muted-foreground: var(--paragraph-color);

  --accent: var(--card-background);
  --accent-foreground: var(--primary-text);

  --destructive: var(--danger);
  --destructive-foreground: #ffffff;

  --border: var(--border-color);
  --input: var(--border-color);
  --ring: var(--ring-color);

  --radius: var(--corner-radius);
}
```

Then shadcn-generated classes work directly:

```html
class="bg-background text-foreground border-border rounded-lg"
class="bg-card text-card-foreground"
class="text-muted-foreground"
class="ring-ring focus-visible:ring-ring"
```

### Important: change `--corner-radius` and `--border-size`

I recommend this as part of the migration:

```css
--corner-radius: 0.5rem;
--border-size: 1px;
--shadow-size: 0 1px 3px light-dark(oklch(0 0 0 / 0.08), oklch(0 0 0 / 0.35));
```

This gives shadcn components room to look like shadcn without abandoning the TechBox minimal identity.

---

## 7. Suggested edits to `UI_MIGRATION_PLAN.md`

Here is what I would change in the plan document itself:

### Edit A: Scope — be clearer about “custom vs. shadcn”

Current plan says:

> “Keep TechBox-specific components custom.”

Change to:

> **“Generic primitives come from shadcn/Radix. Domain components stay custom in shape, but their internals are rebuilt from shadcn primitives. No component should invent its own button/card/input/badge styles.”**

### Edit B: Tokens — promote TechBox tokens to shadcn names

Current plan keeps two parallel systems.

Change to:

> **“Merge TechBox tokens into shadcn naming. The shadcn names become the canonical names. Legacy TechBox names remain as aliases for backward compatibility during the migration, then are deprecated.”**

Reason: if you want “the whole website uses these components,” the tokens must speak shadcn’s language.

### Edit C: Visual defaults — change radius and border

Add a new section:

> **“To make shadcn components look correct, change `--corner-radius` from `0px` to `0.5rem` and `--border-size` from `0px` to `1px`. Keep shadows minimal to preserve the flat identity.”**

### Edit D: Add a “Form audit” phase

Add after token bridge:

> **Phase 1b — Form/input audit: find every raw `<input>`, `<textarea>`, `<select>`, checkbox, and toggle in features and admin pages. Replace with shadcn `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`.**

### Edit E: Component deletion list

The plan says “do not delete maybe-unused components in the same PR.”

Change to:

> **“After confirming zero imports, delete the unused custom primitives (avatar, checkbox, dropdown, icon-button, modal, radio, search-bar, skeleton, switch, tabs, tooltip, overlay, panel, close-button) in a single cleanup PR before installing shadcn replacements.”**

### Edit F: Design-system route is public, not admin-only

Current plan suggests `/admin/design-system`.

I would keep it, but also suggest a public `/design-system` route **only if it does not expose sensitive data**. Since it will only show tokens and dummy component states, either route works. The plan is fine here.

### Edit G: Tailwind v4 warning

Add:

> **“Because this project uses Tailwind CSS v4, the shadcn CLI output must be manually reconciled. Do not run `shadcn add` blindly; review each generated file for v4 compatibility and token alignment.”**

### Edit H: Add a “responsive polish” requirement

Add to every phase checklist:

> **“Check mobile, tablet, and desktop. shadcn primitives are responsive by default, but domain compositions must be tested at `sm`, `md`, `lg`, `xl`.”**

---

## 8. Recommended new phase order

I would restructure the migration like this:

### Phase 0 — Baseline

- `pnpm lint`, `pnpm typecheck`, `pnpm build`.
- Delete confirmed-unused custom primitives.

### Phase 1 — Token foundation

- Rename core tokens to shadcn names.
- Add shadcn token bridge.
- Change `--corner-radius` and `--border-size` to shadcn-friendly defaults.
- Verify no visual regressions on existing pages.

### Phase 2 — Core primitives

- Rebuild `Button`, `Card`, `Badge` as shadcn-style components with the same file paths.
- Add `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Tabs`, `Dialog`, `DropdownMenu`, `Tooltip`, `Table`, `Avatar`, `Skeleton`, `Sonner`.

### Phase 3 — Design-system page

- Create `/admin/design-system`.
- Show every primitive in light/dark/RTL.

### Phase 4 — Layout shell

- Rebuild `Sidebar`, `Footer`, `NewsSidebar`, `AuthModal`, `Chatbot` launcher using shadcn `Sheet`, `Button`, `Tooltip`, `Separator`, `Dialog`.

### Phase 5 — Admin UI

- Rebuild `/admin/*` pages using `Card`, `Table`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Dialog`.
- Create composed admin components: `AdminPageShell`, `AdminStatCard`, `AdminSection`, `AdminToolbar`, `AdminTable`, `AdminEmptyState`, `AdminFormSection`.

### Phase 6 — Public module pattern

- Rebuild `/blog` and `/blog/[slug]` as the canonical module pattern.
- Then apply to `/news`, `/media`, `/review`, `/download`, `/shop`, `/forum`, `/timeline`.

### Phase 7 — Homepage

- Rebuild homepage last, using the now-stable `ContentCard`, `ModuleHeader`, `Button`, `Card`, `Badge`, `Dialog` primitives.

### Phase 8 — Cleanup

- Remove remaining legacy token aliases.
- Remove legacy custom components that are no longer imported.
- Final lint/typecheck/build.

---

## 9. My opinion: should the plan be edited?

**Yes, but not drastically.**

The current plan is already a safe, correct roadmap. The main things to change:

1. **Be more aggressive about replacing primitives with shadcn.** The current plan is too cautious about keeping custom primitives.
2. **Change the visual defaults** (`--corner-radius`, `--border-size`, shadows) so shadcn components can actually look good.
3. **Make shadcn tokens the canonical naming**, not just a bridge.
4. **Add a form/input audit** because inputs are currently scattered and under-used.
5. **Delete confirmed-unused components** instead of leaving them in “maybe” limbo.

### What I would NOT change

- Keep the **homepage-last** rule.
- Keep **small PRs**.
- Keep **RTL, dark mode, focus states** as first-class requirements.
- Keep **module colors** as TechBox-specific tokens.
- Keep **no fake data/claims** rule.

### The one big design decision you need to make

**Do you want a “shadcn-looking” TechBox, or a “TechBox-looking” site that uses shadcn under the hood?**

- If you want it to look like a beautiful shadcn site → accept rounded corners, subtle borders, and shadcn’s default visual language.
- If you want to keep the current flat/square identity → you will constantly fight shadcn and end up overriding everything.

My recommendation: **move toward the shadcn visual language**. It is the fastest path to a polished, responsive, accessible UI, and it will still feel like TechBox because of the module colors and Persian typography.

---

## 10. Next step suggestion

If you agree with this analysis, the next concrete action is:

1. **Edit `UI_MIGRATION_PLAN.md`** with the changes above.
2. **Run the baseline** (`pnpm lint`, `pnpm typecheck`, `pnpm build`).
3. **Start Phase 1** (token foundation + delete unused primitives).

I’m ready to do any of these once you confirm the direction.
