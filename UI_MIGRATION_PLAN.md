# TechBox UI Migration Plan

> **Vision:** A fully shadcn/ui-based, responsive, accessible Persian interface. No custom primitive components. TechBox identity preserved through module colors, typography, and domain compositions.
>
> **Status:** This plan is the single source of truth. Any agent continuing this work should read it fully before editing code.
>
> **Rule of thumb:** If shadcn has it, we use it. If shadcn doesn’t have it, we compose it from shadcn primitives. Custom behavior-only hooks/stores stay; custom UI components go.

---

## 1. North Star

- **shadcn/ui primitives are the only UI primitives** in `components/ui/`.
- **TechBox tokens are replaced by shadcn tokens** (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--radius`, …).
- **Module colors** are kept as a small set of semantic color tokens on top of the shadcn theme.
- **Visual style:** Use the **Mira** preset as the base. Mira is "dense and product-focused". Public pages may get extra whitespace later if needed, but for now we apply Mira everywhere to fix the system.
- **RTL first** in every component.
- **Light/dark mode** via `next-themes` and a theme toggle button in the main sidebar.
- **Mobile-first responsive** layouts using Tailwind v4.

---

## 2. Project context for future agents

### 2.1 Tech stack

- **Framework:** Next.js 16 App Router
- **Styling:** Tailwind CSS v4.3.2 (`@import "tailwindcss"`)
- **PostCSS:** `@tailwindcss/postcss`
- **Package manager:** pnpm
- **Theme:** `next-themes`
- **Fonts:** Kalameh (Persian) + Vazirmatn fallback
- **Direction:** RTL (`dir="rtl"` on `<html>`)
- **Auth:** custom JWT auth
- **DB:** Prisma + Vercel Postgres
- **Storage:** Vercel Blob
- **Validation:** zod

### 2.2 Important existing files

| File | Purpose |
|------|---------|
| `design/globals.css` | Global styles, CSS variables, theme tokens |
| `lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `lib/fonts.ts` | Kalameh font loader |
| `config/modules.config.ts` | Module registry (blog, news, shop, tools, etc.) |
| `config/module-colors.ts` | Module color Tailwind classes |
| `components/ui/*` | Custom primitives to be replaced |
| `components/layout/*` | Sidebar, footer, layout shell |
| `components/effects/*` | Module/page headers, glows, visual effects |
| `features/*` | Module-specific UI |
| `app/*` | Next.js App Router pages |
| `providers/theme.provider.tsx` | next-themes provider |
| `stores/sidebar.store.ts` | Sidebar state store |

### 2.3 Custom components to delete

These will be replaced by shadcn primitives or rebuilt as thin compositions:

```
components/ui/avatar.tsx
components/ui/badge.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/card-stats.tsx
components/ui/checkbox.tsx
components/ui/chip.tsx
components/ui/chip-button.tsx
components/ui/close-button.tsx
components/ui/download-action.tsx
components/ui/download-meta.tsx
components/ui/dropdown.tsx
components/ui/floating-action-button.tsx
components/ui/forum-badge.tsx
components/ui/icon-button.tsx
components/ui/icon-rail-button.tsx
components/ui/input.tsx
components/ui/like-button.tsx
components/ui/live-view-counter.tsx
components/ui/media-selector-card.tsx
components/ui/modal.tsx
components/ui/module-badge.tsx
components/ui/overlay.tsx
components/ui/panel.tsx
components/ui/product-comparison-modal.tsx
components/ui/product-gallery.tsx
components/ui/radio.tsx
components/ui/rating-widget.tsx
components/ui/review-rating.tsx
components/ui/search-bar.tsx
components/ui/skeleton.tsx
components/ui/spinner.tsx
components/ui/switch.tsx
components/ui/tabs.tsx
components/ui/textarea.tsx
components/ui/theme-toggle-button.tsx
components/ui/tooltip.tsx
components/ui/author-link.tsx
```

Domain components that stay as **compositions** (rebuilt with shadcn internals):

```
components/effects/ModuleHeader.tsx
components/effects/PageHeader.tsx
components/effects/ChromaGrid.tsx
components/effects/Dock.tsx
components/effects/LogoLoop.tsx
components/effects/ModuleBorderGlow.tsx
components/layout/LayoutShell.tsx
components/layout/Sidebar.tsx
components/layout/Footer.tsx
features/home/components/NewsSidebar.tsx
features/chat/components/Chatbot.tsx
features/auth/components/auth-modal.tsx
features/content/components/ContentCard.tsx
features/content/components/BentoCard.tsx
features/content/components/SuggestionGrid.tsx
features/forum/components/*
features/shop/components/*
features/timeline/components/*
features/tools/components/*
features/news/components/*
features/blog/components/*
features/review/components/*
features/download/components/*
features/media/components/*
features/contact/components/ContactForm.tsx
features/consultation/components/consultation-modal.tsx
features/work-with-us/components/ApplyForm.tsx
features/comment/components/*
```

---

## 3. shadcn init strategy

### 3.1 Preset

Use the **Mira** preset via preset code `b1D0dv72`.

```bash
pnpm dlx shadcn@latest init --preset b1D0dv72 --rtl --pointer
```

**Why this command:**

- `--preset b1D0dv72` → applies Mira visual style
- `--rtl` → enables RTL support
- `--pointer` → pointer cursor on buttons
- **No `--template next`** because this is an existing project, not a new scaffold

### 3.2 Tailwind v4 compatibility

This project already uses Tailwind v4. After init, shadcn may generate a v4-compatible base. Every generated file must be reviewed.

Expected merge in `design/globals.css`:

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";   /* if generated */

@theme inline {
  --font-sans: var(--font-kalameh-stack);
  --font-mono: var(--font-techbox-mono);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### 3.3 Color system

Use shadcn's default OKLCH scale from Mira. Keep TechBox module accents as extra variables:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.546 0.245 262.881);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.546 0.245 262.881);
  --radius: 0.5rem;

  /* TechBox module accents */
  --home: var(--primary);
  --blog: oklch(0.7 0.17 52);
  --news: oklch(0.64 0.22 25);
  --media: oklch(0.82 0.15 85);
  --shop: oklch(0.8 0.19 125);
  --tools: oklch(0.82 0.12 200);
  --raid: oklch(0.66 0.18 175);
  --subnet: oklch(0.68 0.19 230);
  --nas: oklch(0.7 0.18 285);
  --nvr: oklch(0.75 0.18 145);
  --timeline: oklch(0.72 0.16 210);
  --forum: oklch(0.78 0.16 5);
  --review: oklch(0.7 0.17 240);
  --download: oklch(0.72 0.2 350);
  --admin: oklch(0.66 0.22 300);
  --success: oklch(0.722 0.18 150);
  --warning: oklch(0.82 0.15 85);
  --danger: oklch(0.64 0.22 25);
  --info: oklch(0.72 0.16 230);
}
```

Dark mode uses shadcn dark palette. Module accents may need `light-dark()` wrappers.

### 3.4 Typography / typeset

Use shadcn `Typeset` for rendered markdown and long-form content. Override fonts to Kalameh:

```css
@layer components {
  .typeset {
    --typeset-font-body: var(--font-kalameh-stack);
    --typeset-font-heading: var(--font-kalameh-stack);
    --typeset-font-mono: var(--font-techbox-mono);
  }
}
```

Apply `.typeset` class to:

- Blog/article detail body
- About page content
- Markdown-rendered content
- Newsletter content

---

## 4. Full shadcn component inventory

Install all of these into `components/ui/`:

### Forms

- `button`, `button-group`
- `input`, `textarea`, `select`, `native-select`
- `checkbox`, `radio-group`, `switch`
- `label`, `form`, `field`
- `input-group`, `input-otp`
- `slider`

### Layout & surfaces

- `card`
- `sheet`, `drawer`
- `sidebar`
- `separator`, `scroll-area`
- `aspect-ratio`
- `resizable`
- `skeleton`, `empty`

### Overlays & feedback

- `dialog`, `alert-dialog`
- `popover`, `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`, `hover-card`, `tooltip`
- `sonner`, `toast`
- `alert`
- `spinner`, `progress`

### Navigation & data

- `tabs`
- `breadcrumb`, `pagination`
- `command`, `combobox`
- `table`, `data-table`
- `accordion`, `collapsible`

### Display

- `badge`, `avatar`
- `calendar`, `date-picker`
- `carousel`
- `chart`
- `toggle`, `toggle-group`
- `kbd`, `item`, `marker`
- `typography`

### Chat / messaging (new in shadcn, June 2026)

- `message`, `bubble`, `message-scroller`, `attachment`, `marker`

### Utilities

- `scroll-fade`, `shimmer`
- `direction`

### Consolidated install command

```bash
pnpm dlx shadcn@latest add \
  accordion alert alert-dialog aspect-ratio attachment avatar badge breadcrumb bubble button button-group \
  calendar card carousel chart checkbox collapsible combobox command context-menu data-table date-picker \
  dialog direction drawer dropdown-menu empty field hover-card input input-group input-otp item kbd label \
  marker menubar message message-scroller navigation-menu pagination popover progress radio-group resizable \
  scroll-area select separator sheet sidebar skeleton slider sonner spinner switch table tabs textarea toast \
  toggle toggle-group tooltip typography scroll-fade shimmer
```

Also install form dependencies:

```bash
pnpm add react-hook-form @hookform/resolvers
```

`recharts` is installed automatically with `chart`.

---

## 5. TechBox surfaces → shadcn components

### Global shell

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| Main sidebar | `components/layout/Sidebar*`, `SidebarDock` | `Sidebar` (desktop) + `Drawer` (mobile) + `Tooltip` + `Separator` + `Button` + `DropdownMenu` |
| News sidebar | `features/home/components/NewsSidebar.tsx` | `Drawer` (mobile) + `Sheet` (desktop optional) + `ScrollArea` + `Card` + `Separator` + `Button` |
| Footer | `components/layout/Footer.tsx` | `Separator` + `Button`/`Link` |
| Chatbot launcher | `features/chat/components/Chatbot.tsx` | `Button` + `Sheet`/`Drawer` |
| Auth modal | `features/auth/components/auth-modal.tsx` | `Dialog` + `Tabs` + `Form` + `Input` + `Button` + `Checkbox` + `Sonner` |
| Theme toggle | `components/ui/theme-toggle-button.tsx` | `Button` in main sidebar that cycles light/dark via `next-themes` |
| Skip link | inline in `LayoutShell` | keep, styled with `Button`/`sr-only` utilities |

### Homepage

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| News ticker | `features/news/components/NewsTicker.tsx` | custom behavior + `Badge` + `Button` + `Separator` |
| Hero section | `features/home/components/HeroSection.tsx` | `Typography` + `Button` + Framer Motion |
| Landing stats | `features/home/components/LandingStats.tsx` | `Card` + `Chart` |
| Magazine row | `features/home/components/MagazineRow.tsx` | `Card` + `Badge` + `Avatar` + `Button` + `Skeleton` |
| Video reels row | `features/home/components/VideoReelsRow.tsx` | `Card` + `AspectRatio` + `Badge` + `Carousel` |
| Shop row | `features/home/components/ShopRow.tsx` | `Card` + `Badge` + `Button` |
| Forum row | `features/home/components/ForumRow.tsx` | `Card` + `Avatar` + `Badge` |
| Review row | `features/home/components/ReviewRow.tsx` | `Card` + `Avatar` + `Badge` + `Rating` (custom icon composition) |
| Download row | `features/home/components/DownloadRow.tsx` | `Card` + `Button` + `Badge` |
| Timeline row | `features/home/components/HomeTimelineRow.tsx` | `Card` + `Badge` + `Button` |
| Trust section | `features/home/components/TrustSection.tsx` | `Card` + `Avatar` + `Badge` |
| Recommendation row | `features/home/components/RecommendationRow.tsx` | `Card` + `Badge` + `Button` |
| Newsletter signup | `components/newsletter/NewsletterSignup.tsx` | `Card` + `Input` + `Button` + `Sonner` |

### Module list pages

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| Module header | `components/effects/ModuleHeader.tsx` | `Typography` + `Badge` + `Separator` |
| Page header | `components/effects/PageHeader.tsx` | `Breadcrumb` + `Typography` + `Button` + `Separator` |
| Blog grid | `features/blog/components/BlogGrid.tsx` | `Card` + `Avatar` + `Badge` |
| News list | `features/news/components/NewsList.tsx` | `Card` + `Badge` + `Separator` |
| Media gallery | `features/media/components/MediaGallery.tsx` | `Card` + `AspectRatio` + `Carousel` + `Dialog` |
| Shop grid | `features/shop/components/ShopGrid.tsx` | `Card` + `Badge` + `Button` + `Popover` (filters) + `Dialog` (comparison) |
| Forum list | `features/forum/components/ForumList.tsx` | `Card` + `Avatar` + `Badge` + `Button` |
| Review grid | `features/review/components/ReviewGrid.tsx` | `Card` + `Avatar` + `Badge` + `Rating` |
| Download list/table | `features/download/components/DownloadTable.tsx` | `Table` + `Badge` + `Button` |
| Timeline page | `features/timeline/components/*` | `Card` + `Badge` + `ScrollArea` + `Slider` + `Button` |
| Tools grid | `features/tools/components/ToolsGrid.tsx` | `Card` + `Badge` + `Button` + `Icon` |
| Search page | `app/search/page.tsx` | `Input` + `Command` + `ScrollArea` + `Card` + `Badge` |

### Detail pages

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| Content detail | `features/content/components/ContentDetail.tsx`, `DbContentDetail.tsx` | `Card` + `Badge` + `Avatar` + `Separator` + `Button` + `Typeset` |
| Markdown body | `features/content/components/MarkdownContent.tsx` | wrap in `Typeset` |
| Product detail | `features/shop/components/ProductDetail.tsx`, `DbProductDetail.tsx` | `Card` + `Carousel` + `Badge` + `Tabs` + `Button` + `Dialog` |
| Product gallery | `components/ui/product-gallery.tsx` | `Carousel` + `Dialog` |
| Product comparison modal | `components/ui/product-comparison-modal.tsx` | `Dialog` + `Table` + `Button` |
| Forum detail | `features/forum/components/ForumDetail.tsx` | `Card` + `Avatar` + `Badge` + `Button` + `Collapsible` |
| Review detail | `features/review/components/ReviewDetail.tsx`, `DbReviewDetail.tsx` | `Card` + `Avatar` + `Badge` + `Rating` + `Tabs` |
| Download detail | `features/download/components/DownloadDetail.tsx`, `DbDownloadDetail.tsx` | `Card` + `Button` + `Badge` + `Table` |
| Media / video player | `features/media/components/VideoPlayer.tsx` | wrap in `Card` + `AspectRatio`, controls use `Button`/`Slider` |
| Author page | `app/author/[username]/page.tsx` | `Avatar` + `Card` + `Badge` + `Tabs` |

### Static/marketing pages

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| About page | `app/about/page.tsx` | `Card` + `Avatar` + `Badge` + `Accordion` (Q&A) + `Typeset` |
| Contact page | `app/contact/page.tsx` | `Form` + `Input` + `Textarea` + `Button` + `Sonner` |
| Contact form | `features/contact/components/ContactForm.tsx` | `Form` + `Input` + `Textarea` + `Button` + `Sonner` |
| Work with us | `app/work-with-us/page.tsx`, `ApplyForm.tsx` | `Form` + `Input` + `Textarea` + `Select` + `Button` + `Attachment` |
| Consultation | `app/consultation/page.tsx`, `consultation-modal.tsx` | `Dialog` + `Form` + `Input` + `Select` + `Button` |
| Account page | `app/account/page.tsx` | `Card` + `Tabs` + `Form` + `Input` + `Button` + `Field` |

### Admin

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| Admin dashboard | `app/admin/page.tsx` | `Card` + `Chart` + `Badge` + `Button` |
| Admin tables | inline in `/admin/posts`, `/admin/users`, etc. | `Data Table` + `Badge` + `DropdownMenu` + `Button` + `Pagination` |
| Admin forms | `/admin/posts/new`, `/admin/settings` | `Form` + `Input` + `Textarea` + `Select` + `Switch` + `DatePicker` + `Button` |
| Admin shell | new | `AdminPageShell` composed from `Card`, `Tabs`, `Breadcrumb`, `Button` |
| Admin toolbar | new | `AdminToolbar` composed from `Button`, `Input`, `Combobox`, `DropdownMenu` |
| Admin empty state | new | `Empty` |
| User roles | `app/admin/roles/page.tsx` | `Table` + `Checkbox` + `Select` + `Button` |
| Moderation | `app/admin/moderation/page.tsx` | `Table` + `Badge` + `Button` + `AlertDialog` |
| Upload/blob | `app/admin/upload/page.tsx`, `app/admin/blob/page.tsx` | `Card` + `Progress` + `Button` + `Table` + `Attachment` |
| Jobs | `app/admin/jobs/page.tsx` | `Card` + `Table` + `Badge` |
| Redirects | `app/admin/redirects/page.tsx` | `Table` + `Input` + `Button` |
| Timeline admin | `app/admin/timeline/page.tsx` | `Form` + `Input` + `DatePicker` + `Button` |
| About Q&A admin | new | `Form` + `Accordion` preview + `Table` |

### Tools / calculators

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| Tool page header | `features/tools/components/ToolPageHeader.tsx` | `Breadcrumb` + `Typography` + `Badge` |
| RAID calculator | `app/tools/raid-calculator/page.tsx` | `Card` + `Input` + `Select` + `Slider` + `RadioGroup` + `Table` + `Button` + `Chart` |
| Subnet calculator | `app/tools/subnet-calculator/page.tsx` | `Card` + `Input` + `Button` + `Table` |
| NAS selector | `app/tools/nas-selector/page.tsx` | `Card` + `Select` + `Slider` + `Accordion` + `Button` |
| NVR selector | `app/tools/nvr-selector/page.tsx` | `Card` + `Select` + `Slider` + `Accordion` + `Button` |
| Tools landing | `app/tools/page.tsx` | `Card` + `Badge` + `Button` + `Tabs` |

### Chat / messenger

| TechBox part | Current files | shadcn replacement |
|---|---|---|
| AI chatbot | `features/chat/components/Chatbot.tsx` | `MessageScroller` + `Message` + `Bubble` + `Attachment` + `Marker` + `Input` + `Button` |
| Future messenger | new | `Tabs` (AI / Personal / Support) + `MessageScroller` + `Message` |

---

## 6. Specific owner requirements

This section maps the exact 50 requirements from the owner to implementation decisions.

1. **Attachment** → CV upload in `ApplyForm.tsx`.
2. **Message** → chatbot messages.
3. **MessageScroller** for chatbot; **Message** for personal chats and TechBox support.
4. **Accordion** → Q&A on about page; admin-editable via new DB table.
5. **Aspect Ratio** → media/video containers.
6. **Avatar** → all user/author profiles.
7. **Badge** → all badges/status/labels.
8. **Breadcrumb** → add to every page; use as canonical breadcrumb.
9. **Button** → all buttons.
10. **ButtonGroup** → grouped action buttons (search project for button clusters).
11. **Calendar** → opens when clicking date/time fields.
12. **Card** → all cards.
13. **Carousel** → product images in shop.
14. **Checkbox** → all checkboxes.
15. **Combobox** → all dropdown menus and filters.
16. **Command + ScrollArea** → search history dropdown.
17. **Data Table** → all admin tables and complex tables.
18. **Date Picker** → admin scheduled publishing.
19. **Dialog** → all dialogs/modals.
20. **Drawer** → main sidebar and news sidebar on mobile.
21. **Dropdown Menu** → sidebar items and submenus.
22. **Empty** → empty states for admin/content creation.
23. **Field** → user profile editor and all forms.
24. **Hover Card** → all hover previews.
25. **Input** → all inputs.
26. **Input Group** → inputs with icons/buttons.
27. **Item** → list items (notifications, settings, sidebar menu items).
28. **Navigation Menu** → tools submenu on sidebar hover.
29. **Pagination** → all paginated lists.
30. **Progress** → loading/upload progress.
31. **Radio Group** → all radio buttons.
32. **Scroll Area** → all scrollable regions.
33. **Separator** → dividers in sidebar, cards, footer, etc.
34. **Sidebar** → main sidebar.
35. **Skeleton** → all loading states.
36. **Slider** → all numeric range inputs (tools, calculators).
37. **Spinner** → inline loading (likes, comments, counts).
38. **Switch** → all toggles.
39. **Tabs** → tab systems in tools and admin.
40. **Textarea** → all textareas.
41. **Toggle / ToggleGroup** → editor toolbars, view modes.
42. **Alert** → inline alert messages.
43. **Alert Dialog** → important confirmations (delete, logout).
44. **Shimmer** → loading text.
45. **React Hook Form** → every form and modal.
46. **Message Scroller** → chat/messenger scroll behavior.
47. **Theme switcher** → button in main sidebar using `next-themes` (not Typeset; Typeset is for markdown typography).
48. **Radial chart** → statistics and charts.
49. **Typeset** → markdown/article bodies with Kalameh font override.
50. **Mira preset** → base visual style via `b1D0dv72`.

---

## 7. New data model requirement

### About page Q&A

The owner wants the about-page Q&A to be editable from the admin panel.

**Decision:** Create a new `Faq` table in Prisma:

```prisma
model Faq {
  id        String   @id @default(cuid())
  question  String
  answer    String
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- Public about page fetches active FAQs and renders them with `Accordion`.
- Admin panel gets a `/admin/faq` page with `Data Table` + `Form` to add/edit/delete.

---

## 8. Migration phases

### Phase 0 — Baseline & cleanup

1. Run baseline checks:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
2. Delete confirmed-unused custom primitives listed in section 2.3.
3. Commit the baseline.

### Phase 1 — shadcn init

1. Run:
   ```bash
   pnpm dlx shadcn@latest init --preset b1D0dv72 --rtl --pointer
   ```
2. Merge generated tokens with `design/globals.css`.
3. Add Kalameh typeset override.
4. Update `app/layout.tsx` if needed.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm build`.

### Phase 2 — Core primitives

Install and replace:

- `button`, `card`, `badge`, `input`, `textarea`, `select`, `label`
- `checkbox`, `radio-group`, `switch`
- `dialog`, `alert-dialog`, `sheet`, `drawer`, `popover`, `dropdown-menu`
- `tabs`, `separator`, `scroll-area`, `skeleton`, `avatar`, `spinner`
- `form`, `field`

Rebuild composed components:

- `ModuleBadge` → wraps `Badge`
- `ForumBadge` → wraps `Badge`
- `CardStats` → small composition of `Badge`/`Text`
- `AuthorLink` → `Avatar` + `Link`
- `ModuleHeader` → `Typography` + `Badge`
- `PageHeader` → `Breadcrumb` + `Typography` + `Button`

### Phase 3 — Layout shell

- Rebuild `Sidebar` with shadcn `Sidebar` + `Drawer` for mobile.
- Rebuild `Footer` with `Separator` + `Button`.
- Rebuild `NewsSidebar` with `Drawer` + `ScrollArea` + `Card`.
- Rebuild `AuthModal` with `Dialog` + `Form` + `Tabs`.
- Rebuild `Chatbot` launcher with `Button` + `Sheet`/`Drawer`.
- Add theme toggle button to main sidebar (cycles light/dark via `next-themes`).

### Phase 4 — Design-system page

Create `/admin/design-system` showing:

- Color swatches (theme + module accents)
- Typography scale
- Button variants
- Input / Textarea / Select / Checkbox / Radio / Switch / Slider
- Card variants
- Badge variants
- Dialog / Alert Dialog
- Dropdown Menu / Navigation Menu
- Tabs / Accordion / Collapsible
- Table / Data Table
- Skeleton / Spinner / Progress
- Toast / Sonner
- Avatar / Hover Card / Tooltip
- Calendar / Date Picker
- Chart (Radial)
- Message / Bubble / MessageScroller / Attachment
- Typeset preview
- Breadcrumb
- Empty
- Toggle / ToggleGroup

### Phase 5 — Forms & inputs audit

Find every raw `<input>`, `<textarea>`, `<select>`, checkbox, radio in `features/` and `app/`.

Replace with shadcn `Form` + React Hook Form + zod.

Pages to audit:

```
app/admin/login/page.tsx
features/auth/components/auth-modal.tsx
features/contact/components/ContactForm.tsx
features/work-with-us/components/ApplyForm.tsx
features/consultation/components/consultation-modal.tsx
features/timeline/components/timeline-event-form.tsx
app/account/page.tsx
app/admin/posts/new/page.tsx
app/admin/settings/page.tsx
app/admin/users/page.tsx
app/admin/roles/page.tsx
app/admin/timeline/page.tsx
```

### Phase 6 — Admin UI

Rebuild all admin pages using composed admin components:

```
components/admin/AdminPageShell.tsx
components/admin/AdminSection.tsx
components/admin/AdminStatCard.tsx
components/admin/AdminToolbar.tsx
components/admin/AdminTable.tsx
components/admin/AdminEmptyState.tsx
components/admin/AdminFormSection.tsx
```

Order:

1. `/admin` (dashboard)
2. `/admin/posts`
3. `/admin/posts/new`
4. `/admin/users`
5. `/admin/settings`
6. `/admin/moderation`
7. `/admin/jobs`
8. `/admin/upload`, `/admin/blob`
9. `/admin/content-health`, `/admin/redirects`, `/admin/timeline`
10. `/admin/faq` (new)

### Phase 7 — Chat / messenger

1. Install `message`, `bubble`, `message-scroller`, `attachment`, `marker`.
2. Rebuild `Chatbot` with AI tab using `MessageScroller`.
3. Build messenger shell with `Tabs` for AI / Personal / Support.
4. Each tab uses `Message` + `MessageScroller`.

### Phase 8 — Public module pattern

Pick `/blog` and `/blog/[slug]` first. Create the canonical module pattern:

```
features/content/components/ModuleListPage.tsx
features/content/components/ModuleDetailPage.tsx
features/content/components/ContentGrid.tsx
features/content/components/ContentHero.tsx
features/content/components/ContentMeta.tsx
features/content/components/ContentCard.tsx
```

Then apply to:

```
/news, /news/[slug]
/media, /media/[slug]
/review, /review/[slug]
/download, /download/[slug]
/shop, /shop/[slug]
/forum, /forum/[slug]
/timeline
```

### Phase 9 — Tools & static pages

- `/tools` grid → `Card` + `Badge` + `Tabs`
- `/tools/raid-calculator` → `Card` + `Input` + `Select` + `Slider` + `RadioGroup` + `Table` + `Button` + `Chart`
- `/tools/subnet-calculator` → `Card` + `Input` + `Button` + `Table`
- `/tools/nas-selector`, `/tools/nvr-selector` → `Card` + `Select` + `Slider` + `Accordion` + `Button`
- `/about` → `Card` + `Avatar` + `Badge` + `Accordion` + `Typeset`
- `/contact` → `Form` + `Sonner`
- `/work-with-us` → `Form` + `Attachment`
- `/consultation` → `Dialog` + `Form`
- `/account` → `Card` + `Tabs` + `Form` + `Field`
- `/search` → `Command` + `ScrollArea` + `Card`

### Phase 10 — Homepage redesign

Homepage is last because it consumes all other components.

- Hero → `Typography` + `Button` + Framer Motion
- Ticker → custom behavior + `Badge` + `Button`
- Rows → stable `ContentCard`, `ModuleHeader`, `Card`, `Badge`, `Avatar`, `Skeleton`
- Stats → `Card` + `Chart`
- Trust → `Card` + `Avatar`
- Recommendations → `Card` + `Badge`
- Newsletter → `Card` + `Form` + `Input` + `Button`

### Phase 11 — Final cleanup

1. Remove remaining unused files.
2. Remove legacy TechBox token aliases if any remain.
3. Ensure no raw `<button>`, `<input>`, `<textarea>`, `<select>` outside shadcn wrappers.
4. Run full validation:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   pnpm test:smoke
   ```
5. Manual RTL + dark mode pass on every page.

---

## 9. Validation rules

After every PR/phase:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

For UI work also verify:

- [ ] No custom button/card/input/badge styles remain in the touched area.
- [ ] RTL layout is correct.
- [ ] Mobile layout is correct.
- [ ] Dark mode is correct.
- [ ] Focus states are visible.
- [ ] No fake data/stats/partners.
- [ ] No console errors in browser.

---

## 10. What not to do

- Do not rewrite the whole UI in one PR.
- Do not keep old custom primitives alongside shadcn ones.
- Do not start with the homepage.
- Do not ignore Tailwind v4 compatibility.
- Do not ignore RTL.
- Do not invent new component names like `BetterButton`, `NewCard`, `Box`, etc.
- Do not use `Typeset` as a theme switcher.

---

## 11. Definition of done

The migration is complete when:

1. `components/ui/` contains only shadcn primitives.
2. No unused custom UI components remain.
3. All pages use shadcn primitives or domain compositions built from them.
4. Token system is shadcn-based with module accents.
5. Build, lint, typecheck, and smoke tests pass.
6. `/admin/design-system` documents the full visual language.
7. Every page has a breadcrumb.
8. Every form uses React Hook Form + zod.
9. Every page looks good in RTL, light, dark, and mobile.
10. Chatbot uses `MessageScroller` + `Message` + `Bubble`.
11. Future messenger tabs (AI / Personal / Support) are built.
12. About page Q&A is admin-editable.

---

## 12. Open question for future agents

**Persian (Jalali) calendar:** The owner did not confirm whether admin scheduled publishing and timeline forms need a Jalali calendar or if Gregorian is acceptable. The plan assumes Gregorian `Calendar`/`DatePicker`. If Jalali is needed later, switch to a Persian date picker library or `react-day-picker` with Persian locale.
