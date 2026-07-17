# Next Agent Handoff — TechBox (تکباکس) Feature Implementation

> **Date**: 2026-07-17  
> **Branch**: main  
> **Status**: Partially implemented — several features are in-progress and need completion

---

## What This Project Is

A Persian RTL tech content platform built with:
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** + **Base UI primitives**
- **Prisma** + **PostgreSQL** (Neon)
- **Kalameh** static font (9 separate .woff2 files, NOT variable)
- Desktop-first, RTL design

---

## What's Already Been Done ✅

### Fully Completed
1. **Hero "تکباکس" text fix** — replaced VariableProximity with simple `<h1>` using `font-extrabold`
2. **Auth routes 500 crash fix** — added AUTH_SECRET guard to `/api/auth/me`, `/api/auth/login`, `/api/auth/register`
3. **First-user-is-admin** — first registrant gets `super_admin` role
4. **Typing text moved to topbar** — after breadcrumb with separator, `overflow-hidden` + `max-w-[240px]`
5. **Hero simplified** — now just "تکباکس" name
6. **Hero toggle in admin** — in چیدمان خانه tab
7. **Search bar reopen bug fixed** — added `suppressFocusUntilRef.current = Date.now() + 600`
8. **Search bar layout** — category selector moved from right (start) to left (end) side, before magnifier icon. Input padding `ps-3 pe-[7.25rem]`
9. **News button** — icon removed, background `bg-red-600 hover:bg-red-700 text-white`
10. **Holiday system** — `lib/holidays.ts`, admin API, public API, admin page with add/remove/seed, enable/disable. Calendar marks Fridays + custom holidays in red.
11. **Module color system — data layer** — `moduleColorsEnabled`, `unifiedModuleColor`, `moduleColors` added to `SiteLayoutConfig` + DB keys + public API + provider

### Partially Completed (needs finishing)
12. **`showHomeTitle` / `showHomeMoreLabel` — data layer** — fields exist in `ModuleConfig` type, defaults, DB keys added, API validation updated, public API updated, provider type updated, `saveModuleConfig` now persists them
13. **MagazineRow** — updated to accept and use `showHomeTitle`/`showHomeMoreLabel` props
14. **VideoReelsRow** — function signature updated to accept props, but the JSX still needs conditional rendering added
15. **app/page.tsx** — passes `showHomeTitle`/`showHomeMoreLabel` to row components

---

## What Still Needs To Be Done 🔴

### 1. Finish `showHomeTitle` / `showHomeMoreLabel` in remaining row components

**Files to update:**

- `features/home/components/VideoReelsRow.tsx` — signature updated but JSX not yet conditional. Change the h2 and Link to wrap with `{showHomeTitle && ...}` and `{showHomeMoreLabel && ...}`
- `features/home/components/ShopRow.tsx` — add `showHomeTitle`/`showHomeMoreLabel` props, make h2 and ButtonLink conditional
- `features/home/components/ForumRow.tsx` — same pattern
- `features/home/components/ReviewRow.tsx` — same pattern
- `features/home/components/DownloadRow.tsx` — same pattern
- `features/home/components/HomeTimelineRow.tsx` — same pattern

**Pattern to follow** (from MagazineRow which is already done):
```tsx
export default function XXXRow({ homeTitle, homeMoreLabel, showHomeTitle = true, showHomeMoreLabel = true }: { homeTitle?: string; homeMoreLabel?: string; showHomeTitle?: boolean; showHomeMoreLabel?: boolean }) {
  // ...
  <div className="flex items-center justify-between gap-4 mb-6">
    {showHomeTitle && <h2>...</h2>}
    {showHomeMoreLabel && <ButtonLink>...</ButtonLink>}
  </div>
```

### 2. Add visibility toggles to Admin Modules page — "عناوین ردیف‌ها" tab

**File:** `app/admin/modules/page.tsx`

The "titles" tab currently only has text inputs for `homeTitle` and `homeMoreLabel`. It needs:
- An **eye toggle (Switch)** next to each "عنوان ردیف" label — controls `showHomeTitle`
- An **eye toggle (Switch)** next to each "متن دکمه بیشتر" label — controls `showHomeMoreLabel`

Current code in the titles tab renders each module with Input fields. Add a Switch before or after each Label:

```tsx
<div className="flex items-center justify-between">
  <Label className="text-xs">عنوان ردیف ...</Label>
  <Switch
    checked={cfg?.showHomeTitle ?? true}
    onCheckedChange={(checked) => updateModule(slug, { showHomeTitle: checked })}
  />
</div>
<Input ... />
```

Same pattern for `showHomeMoreLabel`.

### 3. Add "رنگ‌ها" (Colors) tab to Admin Modules page

**File:** `app/admin/modules/page.tsx`

Add a new tab `type TabId = "modules" | "homepage" | "titles" | "colors"` with label "رنگ‌ها".

The tab should contain:
- **Toggle switch**: "سیستم رنگ ماژول‌ها" — controls `config.moduleColorsEnabled`
- **When enabled**: show a color picker (or text input) for EACH module (blog, news, media, shop, forum, review, download, timeline). The values come from `config.moduleColors` which is `Partial<Record<ModuleSlug, string>>`. Use the default CSS variable values from `globals.css` as placeholders.
- **When disabled**: show a single unified color picker controlling `config.unifiedModuleColor`
- All these fields already exist in the `SiteLayoutConfig` type and are saved/loaded correctly

**Default module colors** (from `globals.css`):
```
blog: light-dark(oklch(0.7 0.17 52), #fb923c)   -- orange
news: light-dark(oklch(0.64 0.22 25), #fb7185)   -- rose
media: light-dark(oklch(0.82 0.15 85), #fcd34d)  -- yellow
shop: light-dark(oklch(0.8 0.19 125), #a3e635)   -- lime
forum: light-dark(oklch(0.78 0.16 5), #fda4af)   -- pink
review: light-dark(oklch(0.7 0.17 240), #38bdf8) -- sky
download: light-dark(oklch(0.72 0.2 350), #f472b6) -- fuchsia
timeline: light-dark(oklch(0.72 0.16 210), #06b6d4) -- cyan
tools: light-dark(oklch(0.82 0.12 200), #67e8f9) -- teal
```

For the color picker, a simple `<input type="color">` or text input with a color swatch preview will work. The values are CSS values (could be oklch, hex, or `var(--xxx)`).

### 4. Make module colors work at runtime

**Files to update:**
- `features/home/components/*.tsx` (all row components)
- Possibly a new wrapper component or hook

Currently, each row hardcodes its module color like `text-[var(--blog)]`, `text-[var(--news)]`, etc. The CSS variables are defined in `globals.css` `:root`.

**Strategy**: Create a client component or hook that:
1. Reads `useModuleConfig()` to get `moduleColorsEnabled`, `unifiedModuleColor`, `moduleColors`
2. If `moduleColorsEnabled` is false, override the module CSS variables with `unifiedModuleColor` using inline styles or `document.documentElement.style.setProperty()`
3. If `moduleColorsEnabled` is true but a module has a custom color in `moduleColors`, override just that module's CSS variable

**Simplest approach**: Create a `ModuleColorApplier` client component that sits in the layout, reads the config, and sets CSS custom properties on `document.documentElement`:

```tsx
"use client"
import { useModuleConfig } from "@/providers/module-config.provider"
import { useEffect } from "react"

const MODULE_SLUGS = ["blog","news","media","shop","forum","review","download","timeline","tools"] as const

export function ModuleColorApplier() {
  const { moduleColorsEnabled, unifiedModuleColor, moduleColors, loading } = useModuleConfig()

  useEffect(() => {
    if (loading) return
    if (!moduleColorsEnabled) {
      // All modules use unified color
      for (const slug of MODULE_SLUGS) {
        document.documentElement.style.setProperty(`--${slug}`, unifiedModuleColor)
      }
    } else {
      // Reset to defaults first, then apply custom overrides
      for (const slug of MODULE_SLUGS) {
        document.documentElement.style.removeProperty(`--${slug}`)
      }
      for (const [slug, color] of Object.entries(moduleColors)) {
        if (color) document.documentElement.style.setProperty(`--${slug}`, color)
      }
    }
  }, [moduleColorsEnabled, unifiedModuleColor, moduleColors, loading])

  return null
}
```

Place this component in the root layout. When `moduleColorsEnabled` is false, it overrides all `--blog`, `--news`, etc. CSS vars with `unifiedModuleColor`. When enabled, it only overrides the ones with custom colors set in `moduleColors`.

### 5. Fix search bar placeholder empty space

The placeholder "دنبال چی میگردی؟" reportedly has too much empty space. The input currently has `className="h-8 ps-3 pe-[7.25rem]"`. The right padding accounts for the category selector + magnifier icon at the end. The empty space issue might be because the input is too wide or the placeholder text alignment needs adjustment. Try `text-right` or `text-start` on the input, and verify the padding values are correct.

---

## Important Technical Notes ⚠️

### Git Config & Push
```bash
git config user.email "hnmodeq@gmail.com"
git config user.name "hnmodeq"
# Remote is already configured — just push with:
# git push origin main
```
If the remote needs to be re-added, check the repo settings for the access token.

### Key Rules
- **Never use fake/hardcoded data** — all data reads/writes from DB
- **Work only on main branch**
- **Use reusable shadcn components** and shadcn design tokens
- **Website is RTL** using Kalameh font
- **Kalameh is a STATIC font** — `font-variation-settings` has NO effect. Do NOT split Persian characters into individual `inline-block` spans (breaks cursive forms).
- **Button component** uses `ButtonPrimitive` from `@base-ui/react/button` which defaults to `type="button"` — must explicitly add `type="submit"` for form submission
- **Select onValueChange** returns `string | null` — must add null check
- **revalidateTag** in Next.js 16 has changed signature — use `revalidatePath` instead
- **Auto-deploy** is currently ENABLED on Vercel — user will disable manually from dashboard

### Architecture: Module Config System
- Stored in `SiteSetting` table as JSON with keys like `modules.enabled`, `modules.home_titles`, etc.
- `ModuleConfigMap` = `Record<ModuleSlug, ModuleConfig>` — pure record type
- `SiteLayoutConfig` = `ModuleConfigMap & { heroVisible, moduleColorsEnabled, unifiedModuleColor, moduleColors }`
- Cached via `unstable_cache` with 30s revalidate
- `Object.fromEntries()` returns `{ [k: string]: ... }` which doesn't satisfy intersection types — keep `ModuleConfigMap` as pure `Record`

### Module Config Save/Load
- GET `/api/admin/modules` — returns full `SiteLayoutConfig`
- PATCH `/api/admin/modules` — validates with zod, saves, revalidates `/` and `/api/modules/enabled`
- GET `/api/modules/enabled` — public API, returns enabled slugs + homeConfig + color settings

---

## Files Changed/Added (Current Uncommitted State)

### Modified
- `app/admin/page.tsx` — added holidays link
- `app/api/admin/modules/route.ts` — showHomeTitle/showHomeMoreLabel validation, color settings
- `app/api/modules/enabled/route.ts` — exposes showHomeTitle, showHomeMoreLabel, color settings
- `app/page.tsx` — passes showHomeTitle/showHomeMoreLabel to row components
- `components/layout/search-form.tsx` — dropdown reopen fix, category selector moved
- `components/layout/site-header.tsx` — typing text after breadcrumb, news button red, calendar with holidays
- `components/layout/topbar-typing-text.tsx` — overflow-hidden, fixed max-width
- `features/home/components/MagazineRow.tsx` — showHomeTitle/showHomeMoreLabel conditional rendering
- `features/home/components/VideoReelsRow.tsx` — function signature updated (JSX not yet conditional)
- `lib/module-config.ts` — showHomeTitle/showHomeMoreLabel fields, DB keys, save/load, color settings
- `providers/module-config.provider.tsx` — showHomeTitle/showHomeMoreLabel in homeConfig type, color settings

### New
- `app/admin/holidays/page.tsx` — holiday management admin page
- `app/api/admin/holidays/route.ts` — admin holiday API
- `app/api/holidays/route.ts` — public holiday API
- `lib/holidays.ts` — holiday CRUD with SiteSetting table

---

## Priority Order for Next Agent

1. **Finish row components** — add `showHomeTitle`/`showHomeMoreLabel` to ShopRow, ForumRow, ReviewRow, DownloadRow, HomeTimelineRow, and fix VideoReelsRow JSX
2. **Admin toggles** — add Switch toggles for `showHomeTitle`/`showHomeMoreLabel` in the titles tab of admin modules page
3. **Admin colors tab** — add "رنگ‌ها" tab with module color controls
4. **Module colors runtime** — create `ModuleColorApplier` component and place in root layout
5. **Search bar placeholder** — fix empty space issue on "دنبال چی میگردی؟"
6. **Build test** — run `npx next build` to verify no TypeScript errors
7. **Commit & push** — push to main
