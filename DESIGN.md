# TechBox (تکباکس) – Design System, Visual Identity & UI Architecture
> **Target Audience:** UI/UX Engineers, AI Redesign Engines ([stitch.withgoogle.com](https://stitch.withgoogle.com)), and Frontend Developers.  
> **Source of Truth:** Real codebase architecture, live data structures (`/data/*.json`), token registry (`/design/tokens/`), and Next.js 16 App Router implementations. Nothing invented, nothing placeholder.

---

## 1. Codebase Purpose & Core Goals

### **Identity & Taglines**
* **Name:** تکباکس (TechBox)
* **Primary Tagline:** پاتوق بچه‌های فناوری اطلاعات (The Hangout for IT Professionals & Network Engineers)
* **Core Goal:** To provide the definitive Farsi/RTL enterprise IT portal that unifies specialized technical media (reviews, hardware lab benchmarks, news, video tutorials, community forum) with interactive hardware engineering selectors (NAS/NVR calculators) and B2B infrastructure consulting/shopping.

### **Dominant Feature & Homepage Weight**
As established by the codebase root and homepage (`app/page.tsx`), TechBox leads with a bold, high-contrast, engineering-focused entrance:
1. **Hero Display:** Dominated by a massive, neutral-white typography landmark (`.tb-hero`: `"تکباکس"`) paired with a live, animated rotating tagline (`HeroSection.tsx`) cycling through core product promises (e.g., *«اخبار تکنولوژی رو با تکباکس دنبال کن»*, *«از ابزارهای زیرساختی تکباکس استفاده کن»*).
2. **Live Pulse Ticker:** A continuous, horizontally scrolling news ticker (`NewsTicker.tsx`) presenting real-time updates tagged with their exact module identity colors.
3. **Modular Bento Grid (`HomeModulesSection`):** A responsive 7-column layout displaying live feed previews from every content module, outlined with subtle color-mix border glows (`ModuleBorderGlow`) matching each module's native color.

---

## 2. Global Visual Identity & Design Tokens

TechBox uses a centralized **Token-First Design System** built on CSS Variables, Tailwind CSS v4 (`@theme inline`), and OKLCH color spaces. Hardcoded colors or ad-hoc typography are strictly prohibited.

### **Surface Philosophy (Neutral Grayscale Base)**
Surfaces are designed to be completely color-neutral (`color-scheme: light / dark`), allowing saturated **Module Identity Colors** to act as visual beacons across the interface:
* `--tb-bg-primary`: App canvas (`light-dark(oklch(0.985 0 0), oklch(0.16 0 0))`)
* `--tb-bg-secondary`: Cards, floating panels, modals (`light-dark(oklch(1 0 0), oklch(0.21 0 0))`)
* `--tb-bg-muted`: Input fields, subtle row striping (`light-dark(oklch(0.955 0 0), oklch(0.26 0 0))`)
* `--tb-fg-primary`: Main text (`light-dark(oklch(0.20 0 0), oklch(0.97 0 0))` — pure neutral white in dark mode)
* `--tb-fg-muted`: Captions, timestamps, secondary metadata (`light-dark(oklch(0.55 0 0), oklch(0.65 0 0))`)
* `--tb-border`: Structure separators (`light-dark(oklch(0.91 0 0), oklch(0.26 0 0))`)

### **Brand Accent & Module Identity Colors (`/design/tokens/modules.css`)**
Modules are the **ONLY** colors allowed to brand content across the UI. Every card, badge, icon rail, tooltip, and hover state dynamically inherits its color from its parent module:
* **Brand Primary (`--tb-primary`):** Electric Cyan-Blue (`light-dark(oklch(0.62 0.21 255), #60a5fa)`) — buttons, links, hero highlights.
* **Blog (`--tb-blog`):** Orange (`#fb923c`) — deep technical articles and infrastructure guides.
* **News (`--tb-news`):** Rose (`#fb7185`) — technology updates and urgent news feed.
* **Media (`--tb-media`):** Amber / Gold (`#fcd34d`) — video tutorials, unboxing, podcasts.
* **Shop (`--tb-shop`):** Lime Green (`#a3e635`) — enterprise servers, storage, networking hardware.
* **Tools (`--tb-tools`):** Cyan (`#67e8f9`) — engineering calculators and hardware selectors.
* **RAID Calculator (`--tb-raid`):** Teal (`#2dd4bf`) — RAID 0/1/5/6/10 & SHR storage arrays.
* **Subnet Calculator (`--tb-subnet`):** Blue (`#60a5fa`) — IPv4 / CIDR engineering tools.
* **NAS Selector (`--tb-nas`):** Purple (`#c084fc`) — intelligent storage array sizing.
* **NVR Selector (`--tb-nvr`):** Emerald (`#34d399`) — surveillance camera bandwidth & AI recorder sizing.
* **Forum (`--tb-forum`):** Rose-300 (`#fda4af`) — community Q&A and troubleshooting threads.
* **Review (`--tb-review`):** Sky Blue (`#38bdf8`) — hardware lab benchmarks and architecture reviews.
* **Download (`--tb-download`):** Pink (`#f472b6`) — ISOs, firmware, and enterprise driver packs.

### **Semantic Status Accents**
* **Success (`--tb-success`):** `#4ade80` (used for `حل‌شده ✓` solved forum threads, valid RAID configs, best recommendations).
* **Warning (`--tb-warning`):** `#fcd34d` (used for `باز` open forum threads, unallocated disk warnings, weaknesses).
* **Danger (`--tb-danger`):** `#fb7185` (used for errors, invalid disk arrays, destructive actions).

---

## 3. Typography Scale & RTL Rules (`/design/tokens/typography.css`)

TechBox enforces strict Farsi/RTL typography (`dir="rtl"`) powered by **Kalameh (`KalamehWebFaNum`)** with graceful fallbacks to `Vazirmatn`, `IRANSansWeb`, and `Tahoma`. All numbers across the UI must be formatted in Persian numerals (`Intl.NumberFormat("fa-IR")` or `tabular-nums`).

### **Utility Role Classes**
Instead of scattered font size/weight combinations, components use standardized role utility classes:
* `.tb-text-sm` (13px / weight 500 / leading 1.6): Metadata, timestamps, badges, card stats.
* `.tb-text-md` (15px / weight 500 / leading 1.8): Body text, form inputs, general descriptions.
* `.tb-text-lg` (20px / weight 700 / leading 1.45): Card headers, modal titles, subsection headers.
* `.tb-text-big-title` (`clamp(1.6rem, 3.5vw, 2.5rem)` / font-black 900 / leading 1.2): Page and major section headings.
* `.tb-hero` (`clamp(3.5rem, 9vw, 8rem)` / font-black 900 / leading 1.1 / letter-spacing -0.02em): Single source of truth for the primary homepage banner display title.

---

## 4. Native Product Shapes & Core Layout Structures

Any redesign must preserve the native, data-driven shapes that govern TechBox's interactive engineering tools and content modules:

### **A. Hardware Engineering Selectors (NAS / NVR Selectors)**
* **Native Shape:** Two-part vertical workflow (`flex flex-col gap-8`). The interactive **Configuration Panel** sits at the top, and the real-time **Scored Recommendations Panel** sits directly below it (`border-t border-[var(--tb-border)] pt-4`).
* **NAS Selector (`/tools/nas-selector`):**
  * *Step 1 (Usage Persona):* Toggle cards for Home (`home`), Creator (`creator`), Small Office (`office`), Business (`business`), Enterprise (`enterprise`).
  * *Step 2 (Workloads):* Multi-select cards for Backup, File Sharing, Docker, Surveillance, Virtualization, Database.
  * *Step 3 (Hardware Specs):* Interactive range sliders for Users (1–120), Usable Capacity TB (2–160), Camera Count (0–64), and Budget Tier (1–5).
  * *Results Behavior:* Initially unselected options display a prompt box (`"هیچ گزینه‌ای انتخاب نشده است"`). Once configured, real shop items (`Synology DS423+`, `QNAP TVS-h674`) are ranked by exact match score (`% تطابق`) with green checkmark reasons and warning badges, linking directly to `/shop/<shopSlug>`.
* **NVR Selector (`/tools/nvr-selector`):**
  * *Interactive Controls:* Sliders for Camera Count (1–64) and Continuous Recording Days (7–90), Resolution buttons (`1080p`, `4MP`, `4K`, `8MP`), and AI Analytics toggle.
  * *Live Math:* Real-time calculation of required bandwidth and storage (`estimateNvrStorageTb`), displaying estimated project TB highlighted in `--tb-nvr` emerald.

### **B. RAID & SHR Sizing Calculator (`/tools/raid-calculator`)**
* **Native Shape:** Top interactive drive bay rack + bottom analytical report.
* **Drive Configuration:** Quick-add capacity buttons (`+ 1TB` up to `+ 24TB`) adding drives dynamically.
* **RAID Matrix & Visualizer:** Supports `Basic`, `JBOD`, `RAID 0`, `RAID 1`, `RAID 5`, `RAID 6`, `RAID 10`, `SHR-1`, `SHR-2` plus Hot Spare disk allocation.
* **Live Capacity Bar:** A segmented visual storage bar (`Segment`) breaking total raw TB into color-coded blocks:
  * **Teal (`--tb-raid`):** Usable Storage Volume
  * **Green (`--tb-success`):** Parity / Protection Space
  * **Yellow (`--tb-warning`):** Unused / Wasted Array Space
  * **Gray (`--tb-fg-muted`):** Hot Spare Reserved Disks

### **C. Community Forum (`/forum`)**
* **List Shape (Reddit / StackOverflow Hybrid):** Full-width rows (`grid grid-cols-12`) featuring:
  * *Left Column:* Voting controls (`▲` / `▼`) displaying net vote count.
  * *Center Column:* Author avatar, topic title with hover color transition (`group-hover:text-[var(--tb-forum)]`), and explicit status badges:
    * **Solved (`حل‌شده ✓`):** Green badge (`bg-[var(--tb-success)]/15 border-[var(--tb-success)]/30 text-[var(--tb-success)]`).
    * **Open (`باز`):** Yellow warning badge (`bg-[var(--tb-warning)]/15 text-[var(--tb-warning)]`).
* **Topic Detail View (`/forum/[slug]`):** No generic images. Displays the user's technical problem paragraph (`item.content`), interactive reply submission form, and nested replies list where the author's selected solution is outlined in green with a prominent **"پاسخ انتخابی توسط ایجادکننده موضوع"** badge.

### **D. Media Hub (`/media`) & Reviews (`/review`)**
* **Media Hub:** Full-bleed video cards (`aspect-[16/10] sm:aspect-[16/9]`) with zero image padding. Titles and stats are overlaid on a bottom-to-top dark gradient (`from-black/90 via-black/45 to-transparent`). Clicking any card opens a high-z-index **Modal Pop-up Player** playing the video (`autoPlay`, `controls`) and featuring interactive like toggles and real-time comment submission. Includes numeric pagination (`1 2 3 4`).
* **Review Center:** Single-column vertical list with wide horizontal cards (`grid md:grid-cols-[320px_1fr]`), displaying star ratings (`Stars`), author avatars, and deep previews. Custom Review Detail pages feature side-by-side technical evaluation boxes:
  * **Strengths (`نقاط قوت`):** Green card outlined in `--tb-success` with checkmark icons.
  * **Weaknesses (`نقاط ضعف`):** Yellow/Red card outlined in `--tb-warning` with shield icons.

### **E. Infrastructure Shop (`/shop`)**
* **E-Commerce Grid:** Clean 4-column hardware gallery displaying verified stock badges (`موجود`), discount tags, product title with `--tb-shop` lime hover transition, and an integrated `"مشاوره خرید"` consultation buying action.
* **Inline Dropdown Filtering:** A clean dropdown menu attached to the search bar allowing instant filtering across infrastructure categories (`امنیت`, `ذخیره‌سازی`, `NAS`, `سرور`, `شبکه`, `برق و رک`) and sorting (`جدیدترین`, `پربازدیدترین`, `محبوب‌ترین`).

---

## 5. Navigation Chrome & Layout Geometry

* **Global Rail / Dock (`SidebarShell` & `SidebarMain`):**
  * On Desktop: A smooth fixed navigation sidebar (`w-64` expanded / `w-16` collapsed) featuring module rail buttons with exact color tooltips (`SidebarTooltip`) matching each module's token.
  * On Mobile: Responsive slide-out drawer triggered by a floating action button (`FAB`) at bottom/side (`zIndex.mobileFab`), strictly bounded inside `overflow-x-hidden w-full max-w-full` containers to prevent horizontal scroll overflow.
* **Header Bar Elements:** Real-time Tehran Clock (`TehranDateTime`) formatted in Farsi (`Asia/Tehran` timezone), expanding instant search bar, notification center (`news` tone), shopping cart drawer trigger (`shop` tone), and Day/Night theme toggle switch.

---

## 6. Critical Codebase Files for Redesign Reference

When inspecting or extending the site, reference these exact source-of-truth implementations:
1. `design/tokens/modules.css` & `colors.css` – Core semantic color definitions and OKLCH light-dark pairings.
2. `design/tokens/typography.css` – Standardization of `.tb-text-*`, `.tb-text-big-title`, and `.tb-hero`.
3. `config/sidebar.config.ts` & `module-colors.ts` – Centralized icon mapping (`design/icons.tsx`) and hover/active color bindings.
4. `features/home/components/HeroSection.tsx` & `HomeModulesSection.tsx` – Entrance weight, hero title, and modular Bento grid.
5. `features/tools/components/nas-selector/NasSelector.tsx` – Intelligent storage array scoring engine and stacked layout shape.
6. `features/tools/components/nvr-selector/NvrSelector.tsx` – Surveillance bandwidth calculator and dynamic shop linking.
7. `features/tools/components/raid-calculator/RaidCalculator.tsx` – Array capacity math and segmented capacity bar visualizer.
8. `features/forum/components/ForumList.tsx` & `ForumDetail.tsx` – Community Q&A voting rows and solved solution workflows.
9. `features/media/components/MediaGallery.tsx` – Full-bleed gradient video cards and interactive pop-up modal player.
10. `features/review/components/ReviewGrid.tsx` & `ReviewDetail.tsx` – Wide horizontal review cards and strengths/weaknesses architecture.
11. `features/shop/components/ShopGrid.tsx` – Hardware gallery, inline dropdown filters, and consultation actions.







