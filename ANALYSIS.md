# TechBox Project Analysis – Complete Bug Report & Fix Plan

## 🔍 Executive Summary

TechBox is a Persian tech infrastructure platform with 8 content modules (blog, news, media, review, tools, download, shop, forum) + timeline. It started with hardcoded mock JSON data and later added Prisma + Neon PostgreSQL + Vercel integration. The migration is incomplete — the project is in a **half-mock/half-database hybrid state** causing all the bugs described.

---

## 🚨 Root Cause: Dual Data Sources

Every page uses **`@/lib/content.ts`** which imports from **mock JSON files** (hardcoded likes/views/comments). Then client components **fetch from `/api/stats` and `/api/views`** to overwrite those numbers. This means:

1. **Flash of stale data** — hardcoded numbers show first, then DB numbers replace them
2. **Every card shows the same number** because when DB fails, the `/api/stats` route falls back to mock data that uses `Math.random`-like logic or first-match
3. **Comments are duplicated** — `CommentSection` reads from DB but `ForumDetail` also reads from `comments.json`
4. **Forum solved status** — uses `item.slug.includes("proxmox")` hardcoded logic

---

## 📋 Detailed Issue List

### 🅰️ Data Layer Issues

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| 1 | **Dual data sources** | `lib/content.ts` + mock JSON files | Pages still import mock JSON; client components fetch from API to override |
| 2 | **Stats API fallback to mock** | `app/api/stats/route.ts` | Try DB → catch → use mock data with fake numbers |
| 3 | **Like system has in-memory fallback** | `app/api/like/route.ts` | Uses `globalThis.__local_like_counts__` which resets on every deploy, causing data loss |
| 4 | **Comments API falls back to JSON** | `features/comment/actions/comments.ts` | getCommentsAction tries DB → catch → reads from `comments.json` |
| 5 | **Forum detail reads comments.json directly** | `features/forum/components/ForumDetail.tsx` | Imports `commentsData` directly instead of using API |

### 🅱️ Server/Client Component Mismatch

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| 6 | **Page components are Server Components using mock data** | `app/blog/[slug]/page.tsx`, `app/forum/[slug]/page.tsx`, etc. | `generateStaticParams` and pages use `getBySlug()` from `lib/content.ts` (mock) |
| 7 | **Client components override server-rendered data** | `MagazineRow`, `CardStats`, `LiveViewCounter`, etc. | Client-side fetch replaces initial values → flash of wrong data |
| 8 | **All home page rows use mock data** | `MagazineRow`, `VideoReelsRow`, `ShopRow`, `ForumRow`, `ReviewRow`, `DownloadRow` | `getLatest('blog', 5)` from mock JSON |

### 🅲 Module-Specific Bugs

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| 9 | **Forum solved badge uses fake logic** | `ForumRow.tsx`, `ForumDetail.tsx`, `ForumList.tsx` | `idx % 2 === 0`, `!item.slug.includes("proxmox")`, `item.likes % 2 === 0` |
| 10 | **Review ratings are fake** | `ReviewRow.tsx` | `const rating = 4.8 - idx * 0.15` — hardcoded |
| 11 | **Forum new topics saved to localStorage only** | `ForumList.tsx` | New forum topics saved to localStorage instead of DB |
| 12 | **Download file sizes in stats API hardcoded** | `app/api/stats/route.ts` | Fallback returns `"۶۸۰ مگابایت"` for all items |
| 13 | **Timeline events mix DB + mock** | `app/api/timeline/events/route.ts` | Tries DB → catch → uses `timeline.json` (good pattern, but timeline comments/likes separate) |
| 14 | **NewsSidebar uses mock data** | `features/home/components/NewsSidebar.tsx` | `getModuleItems('news').slice(0, 15)` from mock |

### 🅳 Admin & Auth Issues

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| 15 | **Admin pages may also use mock data** | `app/admin/` | Need to check if admin CRUD works with DB |
| 16 | **Auth uses DB but like system has fallback** | `lib/auth.ts` + Like API | Inconsistent — some features write to DB, some fallback to memory |

---

## 🛠️ Fix Strategy: "Data Layer Unification"

### Phase 1: Make `lib/content.ts` read from PostgreSQL (NOT mock JSON)

**Replace `lib/content.ts`** to query `prisma.post` instead of importing JSON files.

```typescript
// New lib/content.ts — server-only module
import { prisma } from "./db";

export async function getModuleItems(module: ModuleSlug): Promise<ContentItem[]> {
  const posts = await prisma.post.findMany({
    where: { module: module, published: true },
    orderBy: { date: "desc" },
    select: { /* all fields needed */ }
  });
  return posts.map(formatPost);
}

export async function getBySlug(module: ModuleSlug, slug: string): Promise<ContentItem | null> {
  const post = await prisma.post.findUnique({
    where: { module_slug: { module, slug } }
  });
  return post ? formatPost(post) : null;
}
```

**Impact:**
- ✅ Server Components get real data directly (no flash)
- ✅ `generateStaticParams` works with real slugs
- ✅ No more dual-source confusion

### Phase 2: Remove all mock JSON imports from components

1. **Home page rows** — Make them async Server Components that call `getLatest()` from DB
2. **ForumBadge** — Remove the fallback logic, always rely on DB `solved` field
3. **ReviewRow** — Add a `rating` field to the DB schema or calculate from likes
4. **Download file sizes** — Add `fileSize` to Post model and seed with real values
5. **ForumDetail** — Use `CommentSection` component instead of importing `comments.json`

### Phase 3: Clean up API routes

1. **`/api/stats`** — Remove all fallback to mock data. If DB fails, return error, not guessed numbers
2. **`/api/like`** — Remove `globalThis.__local_like_counts__` in-memory fallback
3. **`/api/views`** — Already clean (no fallback) ✅
4. **`features/comment/actions/comments.ts`** — Remove `comments.json` import; only use DB

### Phase 4: Schema improvements

Add to `prisma/schema.prisma`:
- `fileSize` already exists on Post ✅
- Add `rating` (Float) to Post for reviews
- Add `answers` (Int) to Post for forum
- Add `isBestAnswer` (Boolean) to Comment model

### Phase 5: Seed the database properly

Update `prisma/seed.ts` to also seed:
- `fileSize` values (realistic sizes like "۲.۳ گیگابایت")
- Forum `solved` status (some true, some false, not random)
- Realistic comment hierarchies with replies

---

## 🎯 Quick Wins (do first)

1. ✅ Fix `/api/stats` to remove all mock fallback
2. ✅ Fix `/api/like` to remove `globalThis` fallback  
3. ✅ Make `lib/content.ts` an async server-only module reading from DB
4. ✅ Update all `/[module]/[slug]/page.tsx` to use async DB functions
5. ✅ Update all home row components to be async server components

---

## 📦 Files to Modify

### Critical (Data Flow):
- `lib/content.ts` — Complete rewrite to use Prisma
- `app/api/stats/route.ts` — Remove mock fallback
- `app/api/like/route.ts` — Remove in-memory fallback
- `features/comment/actions/comments.ts` — Remove JSON fallback

### Module Pages (Make async):
- `app/page.tsx` — Make async, pass DB data to rows
- `app/blog/page.tsx` & `app/blog/[slug]/page.tsx`
- `app/forum/page.tsx` & `app/forum/[slug]/page.tsx`
- `app/news/page.tsx`, `app/media/page.tsx`, `app/review/page.tsx`
- `app/download/page.tsx`, `app/shop/page.tsx`
- `app/timeline/page.tsx`

### Home Row Components (Convert to async):
- `features/home/components/MagazineRow.tsx`
- `features/home/components/VideoReelsRow.tsx`
- `features/home/components/ShopRow.tsx`
- `features/home/components/ForumRow.tsx`
- `features/home/components/ReviewRow.tsx`
- `features/home/components/DownloadRow.tsx`
- `features/home/components/NewsSidebar.tsx`

### UI Components (Clean up):
- `components/ui/forum-badge.tsx` — Remove fallback prop
- `components/ui/card-stats.tsx` — Simplify, remove client-side fetch
- `components/ui/live-view-counter.tsx` — Simplify
- `components/ui/like-button.tsx` — Remove in-memory fallback
- `features/forum/components/ForumDetail.tsx` — Use DB comments
- `features/forum/components/ForumList.tsx` — Save topics to DB, not localStorage

### Config:
- `prisma/schema.prisma` — Add rating field to Post
- `prisma/seed.ts` — Better seed data with fileSize, rating, solved

---

## 🧪 Testing Checklist

After fixes:
- [ ] Home page loads with REAL data (no flash of old numbers)
- [ ] Each blog post shows its own unique views/likes/comments
- [ ] Each forum topic shows its own solved/badge status
- [ ] Likes persist and don't reset on deploy
- [ ] Comments work and persist in DB
- [ ] Forum new topics save to database
- [ ] Review ratings are stored in DB
- [ ] Download file sizes are per-item
- [ ] Timeline events load from DB with comments
- [ ] Admin CRUD works end-to-end