# Project Structure

```
techbox
├── .config
│   └── nextjs-nodejs
│       └── config.json
├── .continue
│   └── rules
│       ├── architecture.md
│       ├── backend-patterns.md
│       ├── coding-standards.md
│       ├── documentation.md
│       ├── feature-guidelines.md
│       ├── frontend-patterns.md
│       ├── tech-stack.md
│       └── ui-design-system.md
├── .TO-DO.LIST
│   ├── Admin
│   │   ├── Analytics Specialist
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── Blog Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── Designer
│   │   │   └── Main Page.txt
│   │   ├── Download Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── Forum Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── Media Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── News Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── Owner
│   │   │   ├── Main Page.txt
│   │   │   └── Roles Managing.txt
│   │   ├── Product Speciallist
│   │   │   └── Main Page.txt
│   │   ├── Review Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   ├── Shop Editor
│   │   │   ├── Main Page.txt
│   │   │   ├── Slug Edit Page.txt
│   │   │   └── Slug New Page.txt
│   │   └── Social Network Manager
│   │       ├── Main Page.txt
│   │       ├── Slug Edit Page.txt
│   │       └── Slug New Page.txt
│   ├── Global
│   │   ├── Footer Edits.txt
│   │   ├── Global Edits.txt
│   │   ├── Home Page Header.txt
│   │   ├── Rest of the Website Headers.txt
│   │   └── Sidebar.txt
│   ├── Main Pages
│   │   ├── About Us.txt
│   │   ├── Blog.txt
│   │   ├── Contact Us.txt
│   │   ├── Download.txt
│   │   ├── Forum.txt
│   │   ├── Home.txt
│   │   ├── Media.txt
│   │   ├── NAS Selector.txt
│   │   ├── News.txt
│   │   ├── NVR Selector.txt
│   │   ├── Profile.txt
│   │   ├── Rack Customize.txt
│   │   ├── RAID Calculator.txt
│   │   ├── Review .txt
│   │   ├── Shop.txt
│   │   ├── Subnet Calculator.txt
│   │   ├── Technology Timeline.txt
│   │   ├── Tools.txt
│   │   └── Work with Us.txt
│   ├── Modals
│   │   ├── Chatbot.txt
│   │   ├── Consultation.txt
│   │   ├── Downloading Message.txt
│   │   ├── Login.txt
│   │   ├── Media Video Player.txt
│   │   ├── Notification.txt
│   │   └── Shopping Basket.txt
│   └── Slug Pages
│       ├── Blog Author.txt
│       ├── Blog.txt
│       ├── Force News.txt
│       ├── Forum Topics.txt
│       ├── News Slug Page.txt
│       ├── Reviews.txt
│       ├── Shop Products.txt
│       └── Work with Us.txt
├── app
│   ├── about
│   │   └── page.tsx
│   ├── account
│   │   └── page.tsx
│   ├── admin
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── posts
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── roles
│   │   │   └── page.tsx
│   │   ├── timeline
│   │   │   ├── components
│   │   │   │   └── TimelineEventForm.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── change-password
│   │   │   │   └── route.ts
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   ├── me
│   │   │   │   └── route.ts
│   │   │   ├── profile
│   │   │   │   └── route.ts
│   │   │   └── register
│   │   │       └── route.ts
│   │   ├── chat
│   │   │   └── route.ts
│   │   ├── comments
│   │   │   ├── vote
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── like
│   │   │   └── route.ts
│   │   ├── pay
│   │   │   └── zarinpal
│   │   │       ├── request
│   │   │       │   └── route.ts
│   │   │       └── verify
│   │   │           └── route.ts
│   │   ├── posts
│   │   │   └── route.ts
│   │   ├── stats
│   │   │   └── route.ts
│   │   ├── timeline
│   │   │   ├── comments
│   │   │   │   └── route.ts
│   │   │   ├── events
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── like
│   │   │       └── route.ts
│   │   └── views
│   │       └── route.ts
│   ├── blog
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── consultation
│   │   └── page.tsx
│   ├── contact
│   │   └── page.tsx
│   ├── download
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── forum
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── media
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── news
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── review
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── search
│   │   └── page.tsx
│   ├── shop
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   ├── checkout
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── timeline
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── readme.md
│   ├── tools
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   ├── nas-selector
│   │   │   └── page.tsx
│   │   ├── nvr-selector
│   │   │   └── page.tsx
│   │   ├── raid-calculator
│   │   │   └── page.tsx
│   │   ├── subnet-calculator
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── workwithus
│   │   ├── [slug]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── animations
│   │   ├── FadeIn.tsx
│   │   ├── index.ts
│   │   ├── MotionSection.tsx
│   │   └── SlideIn.tsx
│   ├── effects
│   │   ├── Aurora.tsx
│   │   ├── BorderGlow.tsx
│   │   ├── ChromaGrid.tsx
│   │   ├── Dock.tsx
│   │   ├── GradientText.tsx
│   │   ├── HeroBackground.tsx
│   │   ├── LogoLoop.tsx
│   │   ├── ModuleBorderGlow.tsx
│   │   ├── ModuleHeader.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PixelBlast.tsx
│   │   ├── PixelBlastBackground.tsx
│   │   └── Shuffle.tsx
│   ├── layout
│   │   ├── Footer.tsx
│   │   ├── LayoutShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SidebarContent.tsx
│   │   ├── SidebarDock.tsx
│   │   ├── SidebarShell.tsx
│   │   └── SidebarTooltip.tsx
│   └── ui
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── CardStats.tsx
│       ├── Checkbox.tsx
│       ├── Chip.tsx
│       ├── ChipButton.tsx
│       ├── CloseButton.tsx
│       ├── Dropdown.tsx
│       ├── FloatingActionButton.tsx
│       ├── IconButton.tsx
│       ├── IconRailButton.tsx
│       ├── index.ts
│       ├── Input.tsx
│       ├── LikeButton.tsx
│       ├── LiveViewCounter.tsx
│       ├── MediaSelectorCard.tsx
│       ├── Modal.tsx
│       ├── ModuleBadge.tsx
│       ├── Overlay.tsx
│       ├── Panel.tsx
│       ├── Radio.tsx
│       ├── SearchBar.tsx
│       ├── Skeleton.tsx
│       ├── Switch.tsx
│       ├── Tabs.tsx
│       ├── Textarea.tsx
│       ├── ThemeToggleButton.tsx
│       └── Tooltip.tsx
├── config
│   ├── module-colors.ts
│   ├── modules.config.TECHBOX_TOOLS_V2.ts
│   ├── modules.config.ts
│   └── sidebar.config.ts
├── constants
│   ├── app.constants.ts
│   ├── index.ts
│   ├── module.constants.ts
│   ├── routes.constants.ts
│   ├── timeline.ts
│   └── validation.constants.ts
├── data
│   ├── blog.json
│   ├── comments.json
│   ├── download.json
│   ├── forum.json
│   ├── jobs.json
│   ├── media.json
│   ├── nas-products.json
│   ├── news.json
│   ├── nvr-products.json
│   ├── review.json
│   ├── shop.json
│   ├── timeline.json
│   ├── tools.json
│   └── users.json
├── design
│   ├── foundation
│   │   ├── globals.css
│   │   └── primitives.css
│   ├── presets
│   │   ├── effects.ts
│   │   ├── interactions.ts
│   │   └── surfaces.ts
│   ├── tokens
│   │   ├── blur.css
│   │   ├── blur.ts
│   │   ├── border.css
│   │   ├── colors.css
│   │   ├── gradient.css
│   │   ├── modules.css
│   │   ├── motion.css
│   │   ├── motion.ts
│   │   ├── opacity.css
│   │   ├── radius.css
│   │   ├── radius.ts
│   │   ├── ring.css
│   │   ├── shadow.css
│   │   ├── shadows.ts
│   │   ├── typography.css
│   │   ├── typography.ts
│   │   └── z-index.ts
│   ├── icons.tsx
│   └── index.ts
├── features
│   ├── blog
│   │   └── components
│   │       └── BlogGrid.tsx
│   ├── chat
│   │   └── components
│   │       └── Chatbot.tsx
│   ├── comment
│   │   ├── actions
│   │   │   └── comments.ts
│   │   └── components
│   │       └── CommentSection.tsx
│   ├── consultation
│   │   └── components
│   │       └── ConsultationModal.tsx
│   ├── content
│   │   └── components
│   │       ├── BentoCard.tsx
│   │       ├── ContentCard.tsx
│   │       ├── ContentDetail.tsx
│   │       ├── ModuleList.tsx
│   │       └── SuggestionGrid.tsx
│   ├── download
│   │   └── components
│   │       ├── DownloadDetail.tsx
│   │       └── DownloadTable.tsx
│   ├── forum
│   │   └── components
│   │       ├── ForumDetail.tsx
│   │       └── ForumList.tsx
│   ├── home
│   │   └── components
│   │       ├── DownloadRow.tsx
│   │       ├── ForumRow.tsx
│   │       ├── HeroSection.tsx
│   │       ├── HomeModulesSection.tsx
│   │       ├── HomeRowConfig.ts
│   │       ├── HomeTimelineRow.tsx
│   │       ├── HomeToolsRow.tsx
│   │       ├── MagazineRow.tsx
│   │       ├── NewsSidebar.tsx
│   │       ├── ReviewRow.tsx
│   │       ├── ShopRow.tsx
│   │       ├── TeamChromaSection.tsx
│   │       ├── TechLogoLoopSection.tsx
│   │       └── VideoReelsRow.tsx
│   ├── media
│   │   └── components
│   │       ├── MediaGallery.tsx
│   │       └── VideoPlayer.tsx
│   ├── news
│   │   └── components
│   │       ├── NewsList.tsx
│   │       └── NewsTicker.tsx
│   ├── review
│   │   └── components
│   │       ├── ReviewDetail.tsx
│   │       └── ReviewGrid.tsx
│   ├── shop
│   │   └── components
│   │       └── ShopGrid.tsx
│   ├── timeline
│   │   ├── components
│   │   │   ├── index.ts
│   │   │   ├── TimelineCard.tsx
│   │   │   ├── TimelineContainer.tsx
│   │   │   ├── TimelineError.tsx
│   │   │   ├── TimelineLoading.tsx
│   │   │   └── ZoomControls.tsx
│   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── usePan.ts
│   │   │   ├── useTimelineEvents.ts
│   │   │   └── useTimelineZoom.ts
│   │   └── index.ts
│   └── tools
│       └── components
│           ├── nas-selector
│           │   ├── index.ts
│           │   ├── nas-selector-data.ts
│           │   └── NasSelector.tsx
│           ├── nvr-selector
│           │   ├── index.ts
│           │   ├── nvr-selector-data.ts
│           │   └── NvrSelector.tsx
│           ├── raid-calculator
│           │   ├── index.ts
│           │   └── RaidCalculator.tsx
│           ├── index.ts
│           ├── RaidCalculator.tsx
│           ├── SubnetCalculator.tsx
│           ├── ToolPageHeader.tsx
│           └── ToolsGrid.tsx
├── hooks
│   └── useFabTop.ts
├── lib
│   ├── auth-server.ts
│   ├── auth.ts
│   ├── content.ts
│   ├── db.ts
│   ├── fonts.ts
│   ├── get-module-gradient.ts
│   ├── jalali.ts
│   ├── modules.ts
│   ├── nas.ts
│   ├── nvr.ts
│   ├── tools.ts
│   └── utils.ts
├── prisma
│   ├── schema.prisma
│   ├── seed-timeline.ts
│   └── seed.ts
├── providers
│   ├── auth.provider.tsx
│   ├── cart.provider.tsx
│   ├── index.tsx
│   ├── query.provider.tsx
│   └── theme.provider.tsx
├── public
│   ├── assets
│   │   ├── atiye.png
│   │   ├── behnaz.png
│   │   ├── blog-1.jpg
│   │   ├── blog-2.jpg
│   │   ├── blog-3.jpeg
│   │   ├── blog-4.jpg
│   │   ├── blog-5.jpg
│   │   ├── blog-6.png
│   │   ├── hooman.png
│   │   ├── me.jpg
│   │   ├── nastaran.png
│   │   └── rojina.png
│   ├── fonts
│   │   ├── KalamehWebFaNum-Black.woff2
│   │   ├── KalamehWebFaNum-Bold.woff2
│   │   ├── KalamehWebFaNum-ExtraBold.woff2
│   │   ├── KalamehWebFaNum-ExtraLight.woff2
│   │   ├── KalamehWebFaNum-Light.woff2
│   │   ├── KalamehWebFaNum-Medium.woff2
│   │   ├── KalamehWebFaNum-Regular.woff2
│   │   ├── KalamehWebFaNum-SemiBold.woff2
│   │   └── KalamehWebFaNum-Thin.woff2
│   └── logo.png
├── readme
│   ├── continue.config.txt
│   ├── data.md
│   ├── DATABASE_SETUP.md
│   ├── QUICK_START.md
│   ├── TIMELINE_USAGE.md
│   └── tree.md
├── scripts
│   ├── data.cjs
│   └── tree.cjs
├── stores
│   ├── auth.store.ts
│   ├── index.ts
│   ├── sidebar.store.ts
│   └── theme.store.ts
├── tests
│   ├── unit
│   │   ├── auth.test.ts
│   │   └── content.test.ts
│   └── setup.ts
├── types
│   ├── api.ts
│   ├── common.ts
│   ├── content.ts
│   ├── index.ts
│   ├── sidebar.types.ts
│   ├── timeline.ts
│   └── user.ts
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── TIMELINE_ARCHITECTURE.md
├── tsconfig.json
└── tsconfig.tsbuildinfo
```
