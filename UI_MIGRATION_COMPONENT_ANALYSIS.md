# TechBox → shadcn/ui Component Mapping Analysis

> Based on shadcn/ui docs (installation, components, typeset, Mira preset) and TechBox codebase.
>
> Status: analysis only. No project code changes.

---

## 1. How to implement shadcn in this existing Next.js project

### 1.1 Existing project facts

- Next.js 16 (App Router)
- Tailwind CSS v4.3.2 with `@import "tailwindcss"` syntax
- PostCSS config uses `@tailwindcss/postcss`
- Import alias `@/*` already points to project root
- `cn()` utility already exists (`clsx` + `tailwind-merge`)
- Persian/RTL layout (`dir="rtl"`)
- `next-themes` already installed
- No `components.json` yet

### 1.2 shadcn init strategy

The shadcn docs say the standard flow for existing projects is:

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add <component>
```

Because this is Tailwind v4, the CLI will generate a `components.json` and a v4-compatible `globals.css` structure. We still need to review every generated file.

You also provided a specific preset/style:

```bash
pnpm dlx shadcn@latest init --preset b1D0dv72 --template next --rtl --pointer
# or
pnpm dlx shadcn@latest apply --preset b1D0dv72
```

The style name is **Mira**. According to shadcn docs, **Mira** is described as **"dense and product-focused"**. Named presets include: `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`.

### 1.3 Recommended init command

Since this is an existing project (not a new scaffold), use:

```bash
pnpm dlx shadcn@latest init --preset b1D0dv72 --rtl --pointer
```

Flags:

- `--preset b1D0dv72` → applies the Mira visual style
- `--rtl` → enables RTL support
- `--pointer` → pointer cursor on buttons

Do **not** use `--template next` because that scaffolds a new project.

After init, add components with:

```bash
pnpm dlx shadcn@latest add button card badge input ...
```

### 1.4 Expected changes after init

- Creates `components.json`
- Creates/updates `design/globals.css` or `app/globals.css` with shadcn tokens
- Adds `@import "shadcn/tailwind.css"` or similar base styles
- May conflict with existing Tailwind v4 setup — must merge manually

### 1.5 Merge strategy with existing Tailwind v4 setup

Current `design/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-kalameh-stack);
  --font-mono: var(--font-techbox-mono);
}
```

After shadcn init we should keep:

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";   /* if generated */

@theme inline {
  --font-sans: var(--font-kalameh-stack);
  --font-mono: var(--font-techbox-mono);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... all shadcn theme colors ... */
}
```

---

## 2. Mira preset analysis

Mira is one of shadcn's official presets. From the docs:

> **Mira: dense and product-focused**

This means:

- Tighter spacing
- Smaller padding
- Compact components
- Strong focus on data density
- Good for dashboards, admin panels, and content-heavy apps

**Is Mira right for TechBox?**

TechBox has a lot of content cards, admin tables, tools, and data. Mira could work well. However, the current TechBox design is quite airy/flat. Mira will feel more "product UI" and less "magazine UI." That may be exactly what you want.

**Recommendation:** try Mira on the design-system page first. If it feels too dense for the public homepage/magazine, we can override spacing tokens for public pages while keeping Mira for admin/tools.

---

## 3. Component-by-component analysis of your 50 requirements

### 1. Attachment component for work-with-us CV upload

**shadcn component:** `Attachment`

**Where:** `features/work-with-us/components/ApplyForm.tsx`

**Usage:**

```tsx
<Attachment>
  <AttachmentMedia><FileTextIcon /></AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>resume.pdf</AttachmentTitle>
    <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction aria-label="Remove file"><XIcon /></AttachmentAction>
  </AttachmentActions>
</Attachment>
```

**Notes:**

- Use `AttachmentGroup` for multiple files.
- Actual upload still uses Vercel Blob / API route; `Attachment` is only the UI.
- Add upload progress state with `Progress` component.

---

### 2. Message component for chatbot

**shadcn component:** `Message` + `Bubble`

**Where:** `features/chat/components/Chatbot.tsx`

**Usage:**

```tsx
<Message>
  <MessageAvatar>
    <Avatar><AvatarImage src="/ai-avatar.png" /></Avatar>
  </MessageAvatar>
  <MessageContent>
    <MessageHeader>
      <MessageAuthor>TechBox AI</MessageAuthor>
      <MessageTime>۱۲:۳۰</MessageTime>
    </MessageHeader>
    <Bubble>سلام، چطور می‌توانم کمکتان کنم؟</Bubble>
  </MessageContent>
</Message>
```

**Notes:**

- `Message` owns the row layout (avatar, header, footer, alignment).
- `Bubble` renders the message surface.
- For AI reasoning/tool calls, use `Message` with custom content inside `Bubble`.

---

### 3. Message Scroller for chatbot; Message for personal chats and support

**shadcn components:**

- `MessageScroller` (chatbot transcript)
- `Message` (personal chats + support)

**Where:**

- `features/chat/components/Chatbot.tsx` → `MessageScroller`
- Future messenger → `Message` + `MessageScroller`

**Usage:**

```tsx
<MessageScrollerProvider autoScroll>
  <MessageScroller>
    <MessageScrollerViewport>
      <MessageScrollerContent>
        {messages.map((msg) => (
          <MessageScrollerItem key={msg.id} messageId={msg.id} scrollAnchor={msg.role === "user"}>
            <Message>
              <MessageAvatar><Avatar /></MessageAvatar>
              <MessageContent>
                <Bubble variant={msg.role === "user" ? "sent" : "received"}>
                  {msg.content}
                </Bubble>
              </MessageContent>
            </Message>
          </MessageScrollerItem>
        ))}
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>
```

**Notes:**

- `MessageScroller` handles anchoring, auto-follow, prepend preservation.
- For future messenger tabs (AI / Personal / Support), use `Tabs` to switch contexts, each with its own `MessageScroller`.

---

### 4. Accordion for Q&A on about us page (admin-editable)

**shadcn component:** `Accordion`

**Where:** `app/about/page.tsx`

**Usage:**

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>چگونه با تکباکس تماس بگیرم؟</AccordionTrigger>
    <AccordionContent>از طریق صفحه تماس یا ایمیل پشتیبانی.</AccordionContent>
  </AccordionItem>
</Accordion>
```

**Admin editable:** store Q&A items in DB (e.g. `faq` table or `site_settings`). Admin edits via `Form` + `Accordion` preview.

---

### 5. Aspect Ratio for media/videos

**shadcn component:** `AspectRatio`

**Where:**

- `features/media/components/MediaGallery.tsx`
- `features/content/components/ContentCard.tsx` (video cards)
- `features/home/components/VideoReelsRow.tsx`

**Usage:**

```tsx
<AspectRatio ratio={16 / 9}>
  <VideoPlayer src={...} />
</AspectRatio>
```

---

### 6. Avatar for user profiles

**shadcn component:** `Avatar`, `AvatarImage`, `AvatarFallback`

**Where:**

- Author links (`components/ui/author-link.tsx`)
- Forum posts (`features/forum/components/*`)
- Comments (`features/comment/components/*`)
- Auth modal header
- User menu in sidebar
- Account page

**Usage:**

```tsx
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
</Avatar>
```

---

### 7. Badge for badges everywhere

**shadcn component:** `Badge`

**Where:**

- Module badges, status labels, category tags, admin status, new/v2 badges.

**Usage:**

```tsx
<Badge variant="default">جدید</Badge>
<Badge variant="secondary">v2</Badge>
<Badge variant="outline">دسته‌بندی</Badge>
<Badge variant="destructive">حذف شده</Badge>
```

**Notes:**

- For module-colored badges, use `style={{ backgroundColor: "var(--blog)" }}` or a custom `ModuleBadge` wrapper.

---

### 8. Breadcrumb for every page

**shadcn component:** `Breadcrumb`

**Where:** every page that doesn't have one.

Pages that need breadcrumbs:

```
/blog, /blog/[slug]
/news, /news/[slug]
/media, /media/[slug]
/shop, /shop/[slug]
/forum, /forum/[slug]
/review, /review/[slug]
/download, /download/[slug]
/timeline
/tools, /tools/[slug]
/admin/*
/about, /contact, /work-with-us, /consultation, /account, /search
/author/[username]
```

**Usage:**

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">خانه</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/blog">مجله</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>عنوان مقاله</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

**Implementation approach:** create a `PageBreadcrumb` component that reads the current pathname and builds crumbs from `config/modules.config.ts` + content title.

---

### 9. Button for all buttons

**shadcn component:** `Button`

**Where:** everywhere.

**Notes:**

- Replace custom `Button`, `ButtonLink`, `icon-button`, `chip-button`, `floating-action-button`, `theme-toggle-button`, close buttons, etc.
- Use `asChild` for link buttons: `<Button asChild><Link href="/">...</Link></Button>`.
- Use `size="icon"` for icon-only buttons.

---

### 10. Button Group for multiple buttons

**shadcn component:** `ButtonGroup`

**Where to search:**

- Tool pages with related actions
- Admin tables (view/edit/delete)
- Content detail pages (share/like/bookmark)
- Shop product actions (add to cart / compare)
- Timeline zoom controls

**Usage:**

```tsx
<ButtonGroup>
  <Button variant="outline" size="sm">کپی</Button>
  <Button variant="outline" size="sm">ویرایش</Button>
  <Button variant="outline" size="sm">حذف</Button>
</ButtonGroup>
```

---

### 11. Calendar when user clicks date/time

**shadcn component:** `Calendar` + `Popover` = `DatePicker`

**Where:**

- Admin scheduled publish (`/admin/posts/new`)
- Timeline event form (`features/timeline/components/timeline-event-form.tsx`)
- Any future date filter

**Usage:**

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">انتخاب تاریخ</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

---

### 12. Card for all cards

**shadcn component:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Where:**

- Content cards, product cards, tool cards, stat cards, admin cards, news cards.

**Usage:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>عنوان</CardTitle>
    <CardDescription>توضیحات</CardDescription>
  </CardHeader>
  <CardContent>محتوا</CardContent>
  <CardFooter>فوتر</CardFooter>
</Card>
```

---

### 13. Carousel for product images in shop

**shadcn component:** `Carousel` (Embla-based)

**Where:**

- `features/shop/components/ProductDetail.tsx`
- `components/ui/product-gallery.tsx`

**Usage:**

```tsx
<Carousel>
  <CarouselContent>
    {images.map((img) => (
      <CarouselItem key={img}>
        <Image src={img} alt="" />
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

---

### 14. Checkbox for any checkbox

**shadcn component:** `Checkbox`

**Where:**

- Auth modal "remember me"
- Admin forms (roles, permissions, publish options)
- Filters (multi-select categories)
- Work-with-us form (terms)

**Usage:**

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
  <Label htmlFor="remember">مرا به خاطر بسپار</Label>
</div>
```

---

### 15. Combobox for all dropdown menus

**shadcn component:** `Combobox`

**Where:**

- Shop filters (`features/shop/components/ShopGrid.tsx`)
- Tool selectors
- Admin filters (module, status, category)
- Search/filter bars

**Usage:**

```tsx
<Combobox
  options={categories}
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  placeholder="دسته‌بندی"
/>
```

**Note:** For simple native selects, prefer `Select`. Use `Combobox` when there are many options or search is needed.

---

### 16. Scrollable search history when clicking search bars

**shadcn component:** `Command` + `ScrollArea`

**Where:**

- Global search
- `/search` page
- Admin search inputs

**Usage:**

```tsx
<Command>
  <CommandInput placeholder="جستجو…" />
  <CommandList>
    <ScrollArea className="h-72">
      <CommandEmpty>نتیجه‌ای یافت نشد</CommandEmpty>
      <CommandGroup heading="تاریخچه">
        {history.map((item) => (
          <CommandItem key={item}>{item}</CommandItem>
        ))}
      </CommandGroup>
    </ScrollArea>
  </CommandList>
</Command>
```

---

### 17. Data Table for any table

**shadcn component:** `DataTable` (built on `Table`)

**Where:**

- Admin tables (`/admin/posts`, `/admin/users`, `/admin/moderation`, etc.)
- Download table (`features/download/components/DownloadTable.tsx`)
- Any list view that works better as a table

**Usage:**

```tsx
<DataTable columns={columns} data={data} />
```

---

### 18. Date Picker for admin scheduled publish

**shadcn component:** `DatePicker`

**Where:**

- `/admin/posts/new` (publish at)
- `/admin/timeline` (event date)

**Usage:**

```tsx
<DatePicker value={publishAt} onChange={setPublishAt} />
```

---

### 19. Dialog for every dialog

**shadcn component:** `Dialog`

**Where:**

- Auth modal
- Product comparison modal
- Consultation modal
- Admin confirmations
- Any modal currently using custom `Modal`

**Usage:**

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>عنوان</DialogTitle>
      <DialogDescription>توضیحات</DialogDescription>
    </DialogHeader>
    ...
  </DialogContent>
</Dialog>
```

---

### 20. Drawer for main sidebar and news sidebar

**shadcn component:** `Drawer` (mobile) + `Sidebar` (desktop)

**Where:**

- `components/layout/Sidebar.tsx` (mobile drawer)
- `features/home/components/NewsSidebar.tsx` (mobile drawer)

**Usage:**

```tsx
<Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
  <DrawerContent>
    <SidebarContent />
  </DrawerContent>
</Drawer>
```

**Note:** Desktop sidebar should use shadcn `Sidebar`, not `Drawer`.

---

### 21. Dropdown Menu for sidebar items + submenus

**shadcn component:** `DropdownMenu`

**Where:**

- Sidebar tools submenu
- User profile menu
- Admin action menus

**Usage:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">ابزارها</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>RAID Calculator</DropdownMenuItem>
    <DropdownMenuItem>Subnet Calculator</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>انتخاب‌گرها</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>NAS Selector</DropdownMenuItem>
        <DropdownMenuItem>NVR Selector</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 22. Empty component for admin content uploads

**shadcn component:** `Empty`

**Where:**

- Admin pages before first content is added
- Empty module pages
- Empty search results

**Usage:**

```tsx
<Empty>
  <EmptyIcon />
  <EmptyTitle>محتوایی یافت نشد</EmptyTitle>
  <EmptyDescription>اولین مقاله را اضافه کنید.</EmptyDescription>
  <EmptyActions>
    <Button>ایجاد محتوا</Button>
  </EmptyActions>
</Empty>
```

---

### 23. Field component for user profile editor

**shadcn component:** `Field`

**Where:**

- `/account` page
- Admin user editor
- Profile forms

**Usage:**

```tsx
<Field>
  <FieldLabel>نام</FieldLabel>
  <FieldDescription>نام نمایشی شما</FieldDescription>
  <Input />
  <FieldError>{errors.name}</FieldError>
</Field>
```

---

### 24. Hover Card for every hover design

**shadcn component:** `HoverCard`

**Where:**

- Author preview on cards
- Product quick preview
- User preview in forum
- Tool tip-like previews

**Usage:**

```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <Link href="/author/hooman">@hooman</Link>
  </HoverCardTrigger>
  <HoverCardContent>
    <Avatar /><span>هومان نقی‌زاده</span>
  </HoverCardContent>
</HoverCard>
```

---

### 25. Input for any input

**shadcn component:** `Input`

**Where:** all text inputs.

**Note:** replace all raw `<input className="input" ... />` across the project.

---

### 26. Input Group for inputs that need it

**shadcn component:** `InputGroup`

**Where:**

- Search input with icon/button
- Password input with show/hide toggle
- Price input with currency suffix
- Email input with @ prefix

**Usage:**

```tsx
<InputGroup>
  <InputLeftElement><SearchIcon /></InputLeftElement>
  <Input placeholder="جستجو…" />
  <InputRightElement><Button size="sm">جستجو</Button></InputRightElement>
</InputGroup>
```

---

### 27. Item component wherever needed

**shadcn component:** `Item`

**Where:**

- List items with consistent spacing and hover state
- Sidebar menu items
- Settings list
- Notification list items

**Usage:**

```tsx
<Item>
  <ItemIcon><BellIcon /></ItemIcon>
  <ItemContent>
    <ItemTitle>اعلان جدید</ItemTitle>
    <ItemDescription>توضیحات</ItemDescription>
  </ItemContent>
  <ItemAction><Button size="icon" variant="ghost"><ChevronLeft /></Button></ItemAction>
</Item>
```

---

### 28. Navigation Menu for tools submenu on sidebar hover

**shadcn component:** `NavigationMenu`

**Where:**

- Main sidebar tools item
- Optional top navigation

**Usage:**

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>ابزارها</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/tools/raid-calculator">RAID Calculator</NavigationMenuLink>
        <NavigationMenuLink href="/tools/subnet-calculator">Subnet Calculator</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

---

### 29. Pagination for pages that need it

**shadcn component:** `Pagination`

**Where:**

- `/blog`, `/news`, `/shop`, `/forum`, `/review`, `/download`, `/search`, admin tables

**Usage:**

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="?page=1" />
    </PaginationItem>
    <PaginationItem><PaginationLink href="?page=2">2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem>
      <PaginationNext href="?page=3" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

### 30. Progress for loading states

**shadcn component:** `Progress`

**Where:**

- File uploads
- Form submission loading
- Data loading indicators
- Checkout flow

**Usage:**

```tsx
<Progress value={uploadProgress} />
```

---

### 31. Radio Group for every radio button

**shadcn component:** `RadioGroup`

**Where:**

- Tool calculators (RAID type, subnet mode)
- Admin forms (publish status)
- Filters with single choice

**Usage:**

```tsx
<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="raid5" id="raid5" />
  <Label htmlFor="raid5">RAID 5</Label>
</RadioGroup>
```

---

### 32. Scroll Area for everywhere with scroll

**shadcn component:** `ScrollArea`

**Where:**

- News sidebar
- Chatbot messages
- Admin tables
- Filters dropdown
- Search results
- Mobile drawers

---

### 33. Separator anywhere needed

**shadcn component:** `Separator`

**Where:**

- Sidebar sections
- Card footers
- Page headers
- Footer
- Between rows

---

### 34. shadcn Sidebar component as main sidebar

**shadcn component:** `Sidebar`

**Where:** `components/layout/Sidebar.tsx`

**Features to use:**

- `SidebarHeader` (logo)
- `SidebarContent`
- `SidebarGroup`
- `SidebarMenu`
- `SidebarMenuItem`
- `SidebarMenuButton`
- `SidebarMenuSub` (submenus)
- `SidebarFooter` (user profile)
- `SidebarRail`

---

### 35. Skeleton for all pages

**shadcn component:** `Skeleton`

**Where:**

- Every async-loaded section
- Home rows
- Module grids
- Admin tables
- Comments
- Product details

**Usage:**

```tsx
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-32 w-full" />
```

---

### 36. Slider for all sliders

**shadcn component:** `Slider`

**Where:**

- NAS selector (budget, users, capacity)
- NVR selector (cameras, days)
- RAID calculator (disk count)
- Any numeric range input

**Usage:**

```tsx
<Slider value={[value]} onValueChange={([v]) => setValue(v)} max={100} step={1} />
```

---

### 37. Spinner for waiting states

**shadcn component:** `Spinner`

**Where:**

- Comment submit
- Like count loading
- View counter loading
- Form submission
- Button loading states

**Usage:**

```tsx
<Button disabled={loading}>
  {loading && <Spinner className="mr-2" />}
  ارسال
</Button>
```

---

### 38. Switch for all switches

**shadcn component:** `Switch`

**Where:**

- Admin settings
- Theme toggle (light/dark)
- Feature flags
- Publish/unpublish

**Usage:**

```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

---

### 39. Tabs for tab systems

**shadcn component:** `Tabs`

**Where:**

- `/tools` page (different tools)
- Admin pages (posts/users/settings)
- Account page (profile / orders / comments)
- Product detail (specs / reviews / related)

**Usage:**

```tsx
<Tabs defaultValue="raid">
  <TabsList>
    <TabsTrigger value="raid">RAID</TabsTrigger>
    <TabsTrigger value="subnet">Subnet</TabsTrigger>
  </TabsList>
  <TabsContent value="raid">...</TabsContent>
  <TabsContent value="subnet">...</TabsContent>
</Tabs>
```

---

### 40. Textarea for all textareas

**shadcn component:** `Textarea`

**Where:**

- Contact form
- Comment forms
- Admin content editor (simple fields)
- Work-with-us form

---

### 41. Toggle / Toggle Group for review/article writing

**shadcn component:** `Toggle`, `ToggleGroup`

**Where:**

- Text editor toolbar (bold, italic, heading)
- View mode switches (grid/list)
- Admin publish options
- Tool mode selectors

**Usage:**

```tsx
<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
</ToggleGroup>
```

---

### 42. Alert for alert dialogs/messages

**shadcn component:** `Alert`

**Where:**

- Error messages
- Warning banners
- Info boxes in forms
- Success messages

**Usage:**

```tsx
<Alert variant="destructive">
  <AlertTriangle />
  <AlertTitle>خطا</AlertTitle>
  <AlertDescription>اتصال برقرار نشد.</AlertDescription>
</Alert>
```

---

### 43. Alert Dialog for important actions

**shadcn component:** `AlertDialog`

**Where:**

- Delete post
- Logout
- Delete user
- Remove from comparison
- Discard unsaved changes

**Usage:**

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild><Button variant="destructive">حذف</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
      <AlertDialogDescription>این عمل قابل بازگشت نیست.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>انصراف</AlertDialogCancel>
      <AlertDialogAction>حذف</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 44. Shimmer utility for loading texts

**shadcn utility:** `shimmer`

**Where:**

- AI chat "typing…" indicator
- Loading stats labels
- Streaming response text

**Usage:**

```tsx
<p className="shimmer text-sm text-muted-foreground">در حال تولید پاسخ…</p>
```

---

### 45. React Hook Form for any form or dialog/modal

**shadcn form integration:** `Form` + React Hook Form + zod

**Where:**

- Contact form
- Auth modal
- Work-with-us form
- Consultation modal
- Admin forms (posts, users, settings, roles)
- Account page
- Timeline event form

**Usage:**

```tsx
const form = useForm({ resolver: zodResolver(schema) });

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>ایمیل</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

---

### 46. Message Scroller where useful

**Already covered in #3.** Additional uses:

- Live comment threads
- Notification feeds
- Activity logs
- Support ticket history

---

### 47. Typeset as dark/light mode switcher

**Clarification needed.** shadcn `Typeset` is a typography styling system for markdown/rendered HTML, not a theme switcher.

I believe you meant: **use `Typeset` for rendered markdown body styling**, and use a separate component for dark/light mode switching.

**Dark/light mode switcher:** `DropdownMenu` with `next-themes` `setTheme`:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button size="icon"><SunIcon /></Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => setTheme("light")}>روشن</DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme("dark")}>تاریک</DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme("system")}>سیستم</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Typeset for markdown:**

```tsx
<article className="typeset">
  <MarkdownContent content={post.body} />
</article>
```

---

### 48. Radial chart for statistics

**shadcn component:** `Chart` (Recharts-based Radial Bar / Radial Chart)

**Where:**

- Admin dashboard stats
- Landing stats
- Tool result visualizations
- Storage/RAID capacity charts

**Usage:** install `chart` component, then use Recharts `RadialBarChart` with shadcn `ChartContainer` and `ChartTooltip`.

---

### 49. Typeset with Kalameh fonts

**shadcn `Typeset`** uses CSS variables for fonts:

```css
@layer components {
  .typeset {
    --typeset-font-body: var(--font-kalameh-stack);
    --typeset-font-heading: var(--font-kalameh-stack);
    --typeset-font-mono: var(--font-techbox-mono);
  }
}
```

**Apply to:**

- Blog/article detail body
- About page content
- Markdown-rendered content
- Newsletter content

The snippet you provided should be placed in `design/globals.css` after shadcn init, with Kalameh as the font stack.

---

### 50. Mira preset as base style

**Preset:** `b1D0dv72` → Mira style

**Command:**

```bash
pnpm dlx shadcn@latest init --preset b1D0dv72 --rtl --pointer
```

**What Mira brings:**

- Dense, product-focused spacing
- Specific color scale
- Specific radius
- Specific shadows

**What we must override:**

- Font stack → Kalameh/Vazirmatn
- Module accent colors → TechBox colors
- Some public pages may need slightly more breathing room than Mira's density

---

## 4. New component installation list (consolidated)

Install all of these via shadcn CLI:

```bash
pnpm dlx shadcn@latest add \
  accordion alert alert-dialog aspect-ratio attachment avatar badge breadcrumb bubble button button-group \
  calendar card carousel chart checkbox collapsible combobox command context-menu data-table date-picker \
  dialog direction drawer dropdown-menu empty field hover-card input input-group input-otp item kbd label \
  marker menubar message message-scroller navigation-menu pagination popover progress radio-group resizable \
  scroll-area select separator sheet sidebar skeleton slider sonner spinner switch table tabs textarea toast \
  toggle toggle-group tooltip typography
```

Also install utilities:

```bash
pnpm dlx shadcn@latest add scroll-fade shimmer
```

And form dependencies (React Hook Form is already common):

```bash
pnpm add react-hook-form @hookform/resolvers
```

`recharts` comes with `chart` component.

---

## 5. Important considerations

### 5.1 Attachment, Message, MessageScroller, Bubble, Marker are new chat-focused components

These were added to shadcn in June 2026. They are designed specifically for chat interfaces. They will replace the current custom chatbot UI.

### 5.2 `Direction` component for RTL

shadcn has a `Direction` component for RTL. With `--rtl` preset/init flag, components should already be RTL-aware. Still, every overlay component (`Dialog`, `DropdownMenu`, `Sheet`, `Drawer`, `Popover`) must be tested in RTL.

### 5.3 `Sheet` vs `Drawer`

- `Sheet` → slides from any edge, good for side panels on desktop + tablet.
- `Drawer` → mobile-focused bottom sheet.

For main sidebar on mobile, `Drawer` is better. For desktop, `Sidebar`.

### 5.4 Data Table vs Table

- `Table` → simple static table.
- `Data Table` → full-featured table with sorting, filtering, pagination, row selection.

Use `Data Table` for admin; `Table` for simple lists.

### 5.5 Message Scroller from `@shadcn/react`

The styled registry version is `message-scroller`. The headless behavior package is `@shadcn/react`. We will use the registry styled version for consistency.

### 5.6 Typeset is not a theme switcher

As noted in #47, `Typeset` is for markdown typography. The theme switcher should be a `DropdownMenu` + `next-themes`.

### 5.7 Preset Mira might need overrides for public pages

Mira is dense. Public pages like homepage and magazine may need more whitespace. We can add page-level spacing overrides without changing the preset.

---

## 6. Suggested implementation order

### Phase A — shadcn init (no code changes to pages yet)

1. Run baseline: `pnpm lint`, `pnpm typecheck`, `pnpm build`.
2. Delete unused custom primitives.
3. Run `pnpm dlx shadcn@latest init --preset b1D0dv72 --rtl --pointer`.
4. Merge generated tokens/fonts with existing `design/globals.css`.
5. Add Kalameh typeset override.
6. Verify build still passes.

### Phase B — Core primitives

Install and replace:

- `button`, `card`, `badge`, `input`, `textarea`, `select`, `label`
- `checkbox`, `radio-group`, `switch`
- `dialog`, `alert-dialog`, `sheet`, `drawer`, `dropdown-menu`, `popover`
- `tabs`, `separator`, `scroll-area`, `skeleton`, `avatar`, `spinner`

Rebuild composed components:

- `ModuleBadge`, `ForumBadge`, `CardStats`, `AuthorLink`

### Phase C — Layout shell

- Rebuild `Sidebar` with shadcn `Sidebar`.
- Rebuild `Footer`.
- Rebuild `NewsSidebar` with `Drawer` + `Sheet`.
- Rebuild `AuthModal` with `Dialog` + `Form`.
- Add `Breadcrumb` to pages.

### Phase D — Forms

- Replace all raw inputs with shadcn `Form` + React Hook Form.
- Add `DatePicker`, `Calendar`, `Combobox` where needed.

### Phase E — Chat/messaging

- Install `message`, `message-scroller`, `bubble`, `attachment`, `marker`.
- Rebuild `Chatbot`.
- Build future messenger tabs.

### Phase F — Admin

- `Data Table`, `Table`, `Pagination`, `Alert`, `AlertDialog`, `Empty`, `Field`, `Chart`.

### Phase G — Public modules & tools

- `Carousel` for shop
- `AspectRatio` for media
- `Slider` for tools
- `Toggle`/`ToggleGroup` for view modes
- `Accordion` for about Q&A
- `Command` for search
- `HoverCard` for previews
- `Typeset` for markdown body

### Phase H — Homepage & polish

- Rebuild homepage using all stable components.
- Add `Skeleton` loading states everywhere.
- Add `Progress`, `Spinner`, `Sonner` feedback.

### Phase I — Final cleanup

- Remove all remaining custom UI components.
- Final validation.

---

## 7. Open questions

Before starting implementation, please confirm:

1. **Mira preset density:** are you okay with Mira's dense spacing, or should public pages get more whitespace?
2. **Theme switcher:** did you mean `Typeset` for markdown typography and a separate `DropdownMenu` for dark/light?
3. **Calendar localization:** shadcn Calendar uses `date-fns`. Do you want Persian (Jalali) calendar support? If yes, we may need `react-day-picker` with Persian locale or a separate Jalali picker.
4. **Message/messenger scope:** should the future messenger be in scope now, or only the AI chatbot?
5. **Admin Q&A table:** should the about-page Q&A be stored in a new DB table or in `site_settings`?

---

## 8. Next step recommendation

Once you approve this analysis, update `UI_MIGRATION_PLAN.md` to include:

- Mira preset init command
- All 50 component requirements
- The consolidated installation list
- The phased implementation order
- The open questions section

Then proceed to **Phase A** (baseline + shadcn init).
