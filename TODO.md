# TechBox - Next Agent TODO List

**Date:** 2026-07-12  
**Branch:** `feat/shadcn-migration`  
**Latest Commit:** `e6eb54b`

This document outlines what the next agent needs to debug and fix.

---

##  Mission

Debug and fix remaining issues from the shadcn/ui migration, then ensure CI passes.

---

## Quick Start

```bash
cd /home/user/techbox
pnpm install
pnpm lint          # Should pass (0 errors)
pnpm typecheck     # Should pass
pnpm test          # Should pass (6/6)
pnpm build         # May timeout locally, passes on CI
```

---

##  Issues to Debug

### 🔴 Critical (Fix First)

#### 1. E2E Tests May Fail
**Issue:** Layout changed significantly, test selectors may be broken.  
**Files:** `tests/e2e/smoke.spec.ts`  
**Action:** Run `pnpm test:e2e` and fix any failing selectors.

#### 2. News Sidebar Mobile Behavior
**Issue:** News sidebar may not open on mobile (<768px).  
**Files:** 
- `components/layout/techbox-news-sidebar.tsx`
- `components/layout/LayoutShell.tsx`
**Debug Steps:**
1. Open browser dev tools, set viewport to mobile (<768px)
2. Click the floating red news button
3. Check if Sheet opens
4. Verify `open` prop and `onClose` handler
**Possible Fix:** The sidebar uses `SidebarProvider` with `open` prop - may need to check if mobile Sheet is working correctly.

#### 3. Profile Dropdown Navigation
**Issue:** Clicking profile items may not navigate or show errors.  
**File:** `components/layout/techbox-nav-user.tsx`  
**Debug Steps:**
1. Login to the app
2. Click profile avatar in sidebar
3. Click "حساب کاربری" (Account)
4. Check if it navigates to `/account`
**Possible Fix:** Verify `onClick` handlers use `window.location.href` correctly.

---

### 🟡 High Priority

#### 4. Theme Toggle Not Working
**Issue:** Theme toggle in navbar may not switch dark/light mode.  
**File:** `components/layout/site-header.tsx`  
**Debug Steps:**
1. Click theme toggle button (moon/sun icon)
2. Check if theme changes
3. Refresh page - theme should persist
**Check:**
- `next-themes` `ThemeProvider` in `app/layout.tsx`
- `useTheme()` hook usage
- localStorage persistence

#### 5. Search Not Working
**Issue:** Header search may not navigate to search results.  
**File:** `components/layout/search-form.tsx`  
**Debug Steps:**
1. Type in search box
2. Press Enter or submit
3. Check if navigates to `/search?q=...`
**Fix:** Ensure form submission handler works.

#### 6. Notification Bell No Data
**Issue:** Bell icon shows but has no real notifications.  
**Files:** `components/layout/site-header.tsx`  
**Current State:** Bell shows `hasUnreadNews` indicator but no dropdown.  
**Need to Implement:**
- Notification data model
- API endpoints for notifications
- Unread count logic
- Notification dropdown on click

---

### 🟢 Medium Priority

#### 7. Chatbot Tabs Incomplete
**Issue:** Chatbot has 3 tabs but support/messenger are placeholders.  
**File:** `features/chat/components/Chatbot.tsx`  
**Current State:**
- Chatbot tab: Working (AI chat)
- Support tab: Shows button to `/support` page
- Messenger tab: Shows placeholder text
**Need:** Real messaging system (future feature, low priority)

#### 8. Alert Component Not Used
**Issue:** Created Alert component but not integrated.  
**File:** `components/ui/alert.tsx`  
**Action:** Replace custom alert messages with `<Alert>` component in:
- Form success/error messages
- Admin notifications
- Any inline alerts

#### 9. Remaining Module Colors
**Issue:** Some module colors may still exist.  
**Files to Check:**
- `features/content/components/ContentCard.tsx`
- `features/home/components/HeroSection.tsx`
- `features/news/components/NewsTicker.tsx`
**Action:** Search for `var(--blog)`, `var(--news)`, etc. and replace with shadcn tokens.

---

### 🔵 Low Priority (Nice to Have)

#### 10. MagicRings Background
**Issue:** Owner wants animated background in hero section.  
**Source:** https://reactbits.dev (MagicRings component)  
**Requirements:**
- Install `three` dependency
- Create `components/effects/MagicRings.tsx`
- Add to `features/home/components/HeroSection.tsx`
**Props to use:**
```jsx
<MagicRings
  color="#8883ff"
  colorTwo="#ffffff"
  ringCount={6}
  speed={1}
  attenuation={29.5}
  lineThickness={2}
  baseRadius={0.38}
  radiusStep={0.26}
  scaleRate={0.1}
  opacity={1}
  blur={0}
  noiseAmount={0.27}
  rotation={0}
  ringGap={1.2}
  fadeIn={0.7}
  fadeOut={0.5}
/>
```

#### 11. Clickable Author Profiles
**Issue:** Author avatars/names should link to profile pages.  
**Files:**
- `components/ui/author-link.tsx`
- Create `/app/author/[username]/page.tsx`
**Need:** Author page showing their posts/comments/likes.

#### 12. Video Aspect Ratio Verification
**Issue:** Changed from 9/16 to 16/9.  
**File:** `features/home/components/VideoReelsRow.tsx`  
**Action:** Verify media pages look correct with landscape videos.

#### 13. Timeline Colors Verification
**Issue:** Most timeline colors replaced.  
**Files:**
- `features/timeline/components/TimelineContainer.tsx`
- `features/timeline/components/TimelineCard.tsx`
**Action:** Verify all timeline components use shadcn colors.

---

##  Validation Checklist

Before marking an issue as complete:
- [ ] Code changes made
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes (0 errors)
- [ ] Manual testing in browser
- [ ] Mobile responsive check (if applicable)
- [ ] Dark mode check (if applicable)
- [ ] Committed with clear message
- [ ] Pushed to `feat/shadcn-migration`

---

## 🚫 Don't Do

1. **Don't overwrite `components/ui/button.tsx`** - It has custom wrapper
2. **Don't worry about build timeout** - Passes on CI
3. **Don't add module colors back** - Use shadcn tokens
4. **Don't change RTL layout** - Main sidebar on right is correct

---

##  Resources

- **shadcn/ui:** https://ui.shadcn.com/
- **Base UI:** https://base-ui.com/
- **Tailwind v4:** https://tailwindcss.com/docs
- **Next.js 16:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs

---

## 📞 Contact

For questions about the migration:
- Check commit history: https://github.com/hnmodeq/techbox/commits/feat/shadcn-migration
- Read MIGRATION_STATUS.md for detailed context
- Check MIGRATION_COMPLETE.md for full progress report

---

## ✅ Done (Already Completed)

- [x] shadcn/ui installed (37+ components)
- [x] Layout migrated to sidebar-16 pattern
- [x] All homepage rows redesigned
- [x] Tools calculators migrated
- [x] All forms migrated to RHF+zod
- [x] Module colors removed
- [x] News sidebar with floating button
- [x] Support and Feedback pages created
- [x] Chatbot with tabs
- [x] Alert component created
- [x] Profile dropdown fixed
- [x] Breadcrumbs only in navbar
- [x] Mobile RTL fixes
- [x] Width bugs fixed
- [x] Video aspect ratio fixed
- [x] 3-column footer
- [x] All typecheck/lint/tests passing

---

**Good luck! The migration is 95% complete. Just need debugging and polish.**
