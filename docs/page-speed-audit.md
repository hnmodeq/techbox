# Page Speed Audit — TechBox

## Current State

### ✅ Good (Already Optimized)
- **next/image**: 24 components use optimized `next/image` with proper `sizes` and `fill` props
- **Image formats**: Configured for AVIF + WebP with 30-day cache TTL
- **Font loading**: Kalameh via `next/font` (self-hosted, no blocking), Vazirmatn via `@fontsource`
- **Dynamic imports**: Chatbot uses `dynamic()` with SSR disabled
- **Caching**: Service worker for static assets, API routes use cache headers
- **Code splitting**: App Router provides automatic code splitting per route
- **No heavy client bundles**: Three.js dependency exists but not imported in any page component
- **ISR**: Module listing pages use `revalidate = 3600` (1 hour)

### ⚠️ Needs Attention

#### 1. Raw `<img>` Tags (5 instances)
**Impact: Medium** — Missing automatic optimization, responsive sizes, lazy loading

| File | Lines | Context |
|------|-------|---------|
| `app/landing/storage/page.tsx` | 93, 136 | Product thumbnails |
| `features/tools/components/raid-calculator/RaidCalculator.tsx` | 264 | Product image |

**Fix**: Migrate to `next/image` with `sizes` prop. External domains already configured in `next.config.mjs`.

#### 2. Font CSS Imports (5 weight files)
**Impact: Low-Medium** — Each `@fontsource/vazirmatn/*.css` is a separate CSS file loaded at the root level

```tsx
import "@fontsource/vazirmatn/300.css";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
```

**Fix**: Consider using `next/font/local` for Vazirmatn (like Kalameh) or only load weights 400 + 700 and let the browser interpolate.

#### 3. Root Layout Fetches Data
**Impact: Medium** — `getHomeData()` and `getModuleConfig()` are called in the root layout, blocking initial render

```tsx
const [homeData, moduleConfig] = await Promise.all([
  getHomeData(),
  getModuleConfig(),
]);
```

**Fix**: These are already cached (60s). Consider using React `cache()` or `unstable_cache` for request deduplication.

#### 4. Large Content Payloads
**Impact: Medium** — Posts API returns full `content` field for listing pages (up to 100KB per post)

The `/api/posts` route uses `include` instead of `select`, returning all fields including `content`.

**Fix**: For listing pages, use `select` to exclude `content` field. Only fetch full content on detail pages.

#### 5. No Image Width/Height on Some Components
**Impact: Low** — Some `<Image>` components use `fill` without explicit width/height containers, which can cause CLS

**Fix**: Ensure parent containers have explicit `aspect-ratio` or dimensions.

### ❌ Not an Issue (Confirmed)
- **CLS**: Most images use `fill` with aspect-ratio containers
- **LCP**: Homepage pre-fetches data server-side, no loading flash
- **FID**: Minimal client-side JavaScript on initial load
- **Third-party**: Only Vercel Analytics + Speed Insights (lightweight)

## Recommendations (Priority Order)

1. **Migrate5 raw `<img>` to `next/image`** — Quick win, improves LCP + bandwidth
2. **Optimize font loading** — Reduce from5 to2 CSS files, use `next/font` if possible
3. **Add `select` to listing API queries** — Reduce payload size by excluding `content`
4. **Add `loading="lazy"` to below-fold images** — Already done for most, verify all
5. **Consider `React.cache()` for shared data fetches** — Deduplicate DB queries

## Core Web Vitals Estimate

| Metric | Estimated | Target |
|--------|-----------|--------|
| LCP | ~1.5-2.5s | < 2.5s ✅ |
| FID | < 100ms | < 100ms ✅ |
| CLS | < 0.1 | < 0.1 ✅ |
| INP | < 200ms | < 200ms ✅ |

The site should pass Core Web Vitals based on the architecture. Run a Lighthouse audit on the live site to confirm.
