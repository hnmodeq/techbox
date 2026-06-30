# React Bits upgrade — PixelBlast / BorderGlow / LogoLoop / Shuffle / ChromaGrid / Dock

All effects are token-driven. Control every color / radius / shadow / glow / blur / opacity
from `design/tokens/colors.css`. Do **not** hardcode at call sites.

## Install (local)

```bash
pnpm add three postprocessing gsap @gsap/react motion react-icons ogl
pnpm add -D @types/three
# then
pnpm install
pnpm exec prisma generate
pnpm typecheck
pnpm lint
pnpm dev
```

`package.json` already lists: `three`, `postprocessing`, `gsap`, `@gsap/react`,
`motion`, `react-icons`, `ogl`, and dev `@types/three`.

> NOTE: the in-workspace `pnpm` isn't available, and a full `next build` here fails only
> because the real `public/fonts/*` and `public/assets/*` are not in this sandbox
> (`lib/fonts.ts` -> `../public/fonts/KalamehWebFaNum-Thin.woff2`). `typecheck` and `lint`
> both pass clean. The build works on your machine where `public/` has the real assets.

## Components (in `components/effects/`)

| File | What | Token source |
|---|---|---|
| `PixelBlast.tsx` | Raw WebGL dithered background (three + postprocessing) | — |
| `PixelBlastBackground.tsx` | Token-driven wrapper; reads `--tb-pixelblast-*`; resolves color from a CSS var | `--tb-pixelblast-*` (+ `colorVar` override) |
| `Shuffle.tsx` | GSAP SplitText shuffle text | passed `colorFrom`/`colorTo` as CSS vars |
| `BorderGlow.tsx` | Mesh-gradient pointer edge glow | tokens via wrapper |
| `ModuleBorderGlow.tsx` | Token-driven wrapper; module-synced colors | `--tb-borderglow-*` + module color |
| `LogoLoop.tsx` | Marquee of logos (icons or images) | `fadeOutColor` = `var(--tb-background)` |
| `Dock.tsx` | Magnifying dock, **vertical or horizontal** | `--tb-dock-*` |
| `ChromaGrid.tsx` | Spotlight team cards | `--tb-chroma-*` |

## Where they're wired

- **Homepage hero** (`features/home/components/HeroSection.tsx`)
  - Background: `<PixelBlastBackground variant="square" />`
  - Title: `<Shuffle text="تکباکس" ... colorFrom/colorTo from tokens />`
- **Module headers** (`components/effects/ModuleHeader.tsx`)
  - Background: `<PixelBlastBackground colorVar={moduleVar} />` (e.g. `--tb-blog`), synced to module color.
- **Home feed cards** (`features/home/components/HomeModulesSection.tsx`)
  - Each card wrapped in `<ModuleBorderGlow moduleColor={meta.color}>`.
- **Above footer** (`features/home/components/TechLogoLoopSection.tsx`)
  - `<LogoLoop />` (swap the tech icons for company `{ src, alt, href }` items when ready).
- **About page team** (`app/about/page.tsx` -> `features/home/components/TeamChromaSection.tsx`)
  - `<ChromaGrid />` built from `data/users.json`, tinted from module tokens.
- **Vertical Dock sidebar** (`components/layout/SidebarDock.tsx`)
  - Ready-to-use `<SidebarDock />`. Uses the same `navItems` config + admin-only item.
  - Mount it where you want the floating magnifying rail. The classic
    `SidebarContent.tsx` is untouched and still works, so you can A/B them.

## Tokens added (`design/tokens/colors.css`)

`:root` and `.dark` now include:
`--tb-pixelblast-*`, `--tb-borderglow-*`, `--tb-dock-*`, `--tb-shuffle-*`, `--tb-chroma-*`.
Change looks there only.

## Notes / SSR

- All effect components are `"use client"` and guard `window`/`document`.
- PixelBlast pauses rendering offscreen (IntersectionObserver) to avoid wasted GPU work / flicker,
  and re-resolves its color when the `.dark` class toggles.
- LogoLoop/Shuffle/ChromaGrid/Dock honor `prefers-reduced-motion`.
