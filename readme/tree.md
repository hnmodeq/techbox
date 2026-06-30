# Project Structure

```
techbox-made-by-arena
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
│   │   └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   └── me
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
│   │   └── posts
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
│   ├── tools
│   │   ├── [slug]
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
│   ├── layout
│   │   ├── Footer.tsx
│   │   ├── LayoutShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SidebarContent.tsx
│   │   ├── SidebarShell.tsx
│   │   └── SidebarTooltip.tsx
│   └── ui
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Checkbox.tsx
│       ├── Chip.tsx
│       ├── Dropdown.tsx
│       ├── IconButton.tsx
│       ├── index.ts
│       ├── Input.tsx
│       ├── LikeButton.tsx
│       ├── Modal.tsx
│       ├── Radio.tsx
│       ├── SearchBar.tsx
│       ├── Skeleton.tsx
│       ├── Switch.tsx
│       ├── Tabs.tsx
│       ├── Textarea.tsx
│       └── Tooltip.tsx
├── config
│   ├── module-colors.ts
│   ├── modules.config.ts
│   └── sidebar.config.ts
├── constants
│   ├── app.constants.ts
│   ├── index.ts
│   ├── module.constants.ts
│   ├── routes.constants.ts
│   └── validation.constants.ts
├── data
│   ├── blog.json
│   ├── comments.json
│   ├── download.json
│   ├── forum.json
│   ├── jobs.json
│   ├── media.json
│   ├── news.json
│   ├── review.json
│   ├── shop.json
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
│   │   ├── blur.ts
│   │   ├── colors.css
│   │   ├── motion.ts
│   │   ├── radius.ts
│   │   ├── shadows.ts
│   │   └── typography.ts
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
│   │       └── ForumList.tsx
│   ├── home
│   │   └── components
│   │       ├── HeroSection.tsx
│   │       └── HomeModulesSection.tsx
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
│   │       └── ReviewGrid.tsx
│   ├── shop
│   │   ├── components
│   │   │   └── ShopGrid.tsx
│   │   └── hooks
│   │       └── useCart.tsx
│   └── tools
│       └── components
│           ├── RaidCalculator.tsx
│           ├── SubnetCalculator.tsx
│           └── ToolsGrid.tsx
├── hooks
│   └── useFabTop.ts
├── lib
│   ├── auth-server.ts
│   ├── auth.ts
│   ├── content.ts
│   ├── db.ts
│   ├── fonts.ts
│   ├── modules.ts
│   └── utils.ts
├── prisma
│   ├── dev.db
│   ├── schema.prisma
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
│   └── continue.config.txt
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
│   └── user.ts
├── codes.txt
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── tsconfig.json
└── tsconfig.tsbuildinfo
```
