"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner, SpinnerCenter } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ModuleBadge } from "@/components/ui/module-badge";

import { getCurrentUserClient } from "@/lib/auth";
import { moduleMeta, type ModuleSlug } from "@/lib/content";

// small helper section wrapper
function DSSection({ title, description, children, id }: { title: string; description?: string; children: React.ReactNode; id?: string }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-14 w-full rounded-lg border" style={{ background: `var(${cssVar})` }} />
      <div className="space-y-0.5">
        <div className="text-xs font-medium">{name}</div>
        <div className="text-[10px] text-muted-foreground ltr text-left">{cssVar}</div>
      </div>
    </div>
  );
}

function ModuleSwatch({ slug }: { slug: string }) {
  const color = `var(--${slug})`;
  // @ts-expect-error dynamic index
  const titleFa = moduleMeta[slug]?.titleFa || slug;
  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      <div className="size-8 rounded-full border" style={{ background: color }} />
      <div className="flex-1">
        <div className="text-xs font-medium">{slug}</div>
        <div className="text-[10px] text-muted-foreground ltr">{color}</div>
      </div>
      <Badge variant={slug as ModuleSlug}>{titleFa}</Badge>
    </div>
  );
}

export default function DesignSystemPage() {
  const [user, setUser] = React.useState(() => getCurrentUserClient());
  const [switchOn, setSwitchOn] = useState(true);
  const [radioValue, setRadioValue] = useState("1");

  React.useEffect(() => {
    setUser(getCurrentUserClient());
  }, []);

  if (!user) {
    return (
      <main className="min-h-dvh px-4 py-16" dir="rtl">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader><CardTitle>دسترسی محدود</CardTitle><CardDescription>برای مشاهده سیستم دیزاین وارد شوید.</CardDescription></CardHeader>
            <CardContent className="flex gap-2">
              <ButtonLink href="/admin/login">ورود ادمین</ButtonLink>
              <ButtonLink href="/" variant="ghost">خانه</ButtonLink>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const isAdmin = user.role === "super_admin" || user.role === "editor";
  if (!isAdmin) {
    return (
      <main className="min-h-dvh p-8" dir="rtl">
        <Card className="max-w-xl mx-auto"><CardHeader><CardTitle>عدم دسترسی</CardTitle><CardDescription>فقط super_admin و editor می‌توانند این صفحه را ببینند.</CardDescription></CardHeader></Card>
      </main>
    );
  }

  const themeColors = [
    { name: "Background", var: "--background" },
    { name: "Foreground", var: "--foreground" },
    { name: "Card", var: "--card" },
    { name: "Card Foreground", var: "--card-foreground" },
    { name: "Popover", var: "--popover" },
    { name: "Primary", var: "--primary" },
    { name: "Primary FG", var: "--primary-foreground" },
    { name: "Secondary", var: "--secondary" },
    { name: "Secondary FG", var: "--secondary-foreground" },
    { name: "Muted", var: "--muted" },
    { name: "Muted FG", var: "--muted-foreground" },
    { name: "Accent", var: "--accent" },
    { name: "Accent FG", var: "--accent-foreground" },
    { name: "Destructive", var: "--destructive" },
    { name: "Border", var: "--border" },
    { name: "Input", var: "--input" },
    { name: "Ring", var: "--ring" },
    { name: "Sidebar", var: "--sidebar" },
  ];

  const moduleSlugs = ["blog","news","media","shop","tools","download","forum","review","timeline","home","admin","about","contact","account","raid","subnet","nas","nvr","workwithus","consultation"];

  return (
    <main className="min-h-dvh bg-background text-foreground" dir="rtl">
      <Toaster richColors dir="rtl" />
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">سیستم دیزاین — Mira Preset</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Base-Mira (b1D0dv72) + RTL + Pointer + Tailwind v4 + Base UI. شاخه: <code className="px-1 py-0.5 rounded bg-muted text-xs">feat/shadcn-migration</code>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>RTL ✅</Badge>
              <Badge variant="secondary">Mira preset</Badge>
              <Badge variant="outline">Tailwind v4</Badge>
              <Badge variant="outline">Base UI</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/admin" variant="ghost">بازگشت به ادمین</ButtonLink>
            <ButtonLink href="/" variant="ghost">خانه</ButtonLink>
          </div>
        </div>

        {/* Nav Tabs for quick jump */}
        <Tabs defaultValue="colors">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="colors">رنگ‌ها</TabsTrigger>
            <TabsTrigger value="typography">تایپوگرافی</TabsTrigger>
            <TabsTrigger value="buttons">دکمه‌ها</TabsTrigger>
            <TabsTrigger value="badges">Badge</TabsTrigger>
            <TabsTrigger value="cards">Card</TabsTrigger>
            <TabsTrigger value="forms">فرم‌ها</TabsTrigger>
            <TabsTrigger value="overlays">Overlays</TabsTrigger>
            <TabsTrigger value="navigation">ناوبری</TabsTrigger>
            <TabsTrigger value="data">داده</TabsTrigger>
            <TabsTrigger value="feedback">فیدبک</TabsTrigger>
          </TabsList>

          {/* COLORS */}
          <TabsContent value="colors" className="space-y-6 pt-4">
            <DSSection title="توکن‌های شادکن — Theme" description="canonical tokens. legacy TechBox tokens aliased to these.">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {themeColors.map(c => <ColorSwatch key={c.var} name={c.name} cssVar={c.var} />)}
              </div>
            </DSSection>

            <DSSection title="رنگ‌های ماژولار — Module Accents" description="از config/modules.config.ts و design/globals.css — برای Badge و ModuleBadge">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {moduleSlugs.map(s => <ModuleSwatch key={s} slug={s} />)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {moduleSlugs.map(s => <ModuleBadge key={s} module={s as ModuleSlug}>{s}</ModuleBadge>)}
              </div>
            </DSSection>

            <DSSection title="Chart & Sidebar & Radius" description="--chart-1..5, --sidebar-*, --radius">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[1,2,3,4,5].map(i => <ColorSwatch key={i} name={`Chart ${i}`} cssVar={`--chart-${i}`} />)}
                <ColorSwatch name="Sidebar" cssVar="--sidebar" />
                <ColorSwatch name="Sidebar Primary" cssVar="--sidebar-primary" />
                <ColorSwatch name="Sidebar Accent" cssVar="--sidebar-accent" />
                <ColorSwatch name="Sidebar Border" cssVar="--sidebar-border" />
              </div>
              <div className="mt-4 flex gap-2 items-center text-xs">
                <div className="size-8 rounded-[var(--radius)] bg-primary" /> radius: var(--radius) = 0.625rem
                <Separator orientation="vertical" className="h-6" />
                <div className="size-8 rounded-[var(--radius-sm)] bg-primary" /> sm
                <div className="size-8 rounded-[var(--radius-lg)] bg-primary" /> lg
                <div className="size-8 rounded-[var(--radius-xl)] bg-primary" /> xl
              </div>
            </DSSection>
          </TabsContent>

          {/* TYPOGRAPHY */}
          <TabsContent value="typography" className="space-y-6 pt-4">
            <DSSection title="تایپوگرافی فارسی — Kalameh" description="font-sans = --font-kalameh-stack, مانع FOUC با display swap">
              <div className="space-y-6">
                <div><div className="text-[10px] text-muted-foreground">--hero-font-size</div><div className="hero-title text-[length:var(--hero-font-size)] font-black leading-tight">تکباکس — پلتفرم محتوای فناوری</div></div>
                <div><div className="text-[10px] text-muted-foreground">--h1-font-size / h1</div><h1 className="text-[length:var(--h1-font-size)] font-extrabold">عنوان H1 — چرا مهاجرت به شادکن؟</h1></div>
                <div><div className="text-[10px] text-muted-foreground">--h2-font-size / h2</div><h2 className="text-[length:var(--h2-font-size)] font-bold">عنوان H2 — مزایای Mira Preset</h2></div>
                <div><div className="text-[10px] text-muted-foreground">--h3-font-size / h3</div><h3 className="text-[length:var(--h3-font-size)] font-semibold">عنوان H3 — ترکیب با Tailwind v4</h3></div>
                <div><div className="text-[10px] text-muted-foreground">--paragraph-font-size</div><p className="text-[length:var(--paragraph-font-size)] leading-7 text-muted-foreground">تکباکس یک رسانه فارسی چندماژولی برای زیرساخت، شبکه، سرور، استوریج و امنیت است. متن پاراگراف نمونه برای تست فاصله خطوط و خوانایی در حالت‌های روشن و تاریک.</p></div>
              </div>
            </DSSection>

            <DSSection title="Typeset — Kalameh override" description="کلاس .typeset برای بادی مقالات (markdown)">
              <div className="typeset max-w-none prose prose-neutral dark:prose-invert">
                <h2>نمونه Typeset</h2>
                <p>این یک پاراگراف <strong>بولد</strong> و <em>ایتالیک</em> است. لیست:</p>
                <ul><li>آیتم یک</li><li>آیتم دو با <code>code</code></li></ul>
                <blockquote>نقل قول: طراحی مینیمال اما با دسترسی‌پذیری کامل.</blockquote>
                <p>کد:</p>
                <pre className="p-3 rounded bg-muted text-xs overflow-auto ltr text-left"><code>const cn = (...inputs) =&gt; twMerge(clsx(inputs))</code></pre>
              </div>
            </DSSection>
          </TabsContent>

          {/* BUTTONS */}
          <TabsContent value="buttons" className="space-y-6 pt-4">
            <DSSection title="Button — Variants" description="shadcn + legacy mapping (primary->default, danger->destructive, vip gradient)">
              <div className="flex flex-wrap gap-2">
                <Button>Default / Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Destructive / Danger</Button>
                <Button variant="link">Link</Button>
                <Button variant="vip">VIP Gradient</Button>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2 items-center">
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="default">Default MD</Button>
                <Button size="lg">LG</Button>
                <Button size="icon" aria-label="icon"><span>★</span></Button>
                <Button size="icon-sm" aria-label="icon sm"><span>★</span></Button>
                <Button size="icon-lg" aria-label="icon lg"><span>★</span></Button>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <ButtonLink href="/blog" variant="outline">As Link</ButtonLink>
              </div>
            </DSSection>

            <DSSection title="Button Group — Placeholder" description="shadcn ButtonGroup not installed yet — using flex. Will replace with ButtonGroup primitive.">
              <div className="inline-flex rounded-md border overflow-hidden">
                <Button variant="outline" size="sm" className="rounded-none border-0">کپی</Button>
                <Separator orientation="vertical" />
                <Button variant="outline" size="sm" className="rounded-none border-0">ویرایش</Button>
                <Separator orientation="vertical" />
                <Button variant="outline" size="sm" className="rounded-none border-0">حذف</Button>
              </div>
            </DSSection>
          </TabsContent>

          {/* BADGES */}
          <TabsContent value="badges" className="space-y-6 pt-4">
            <DSSection title="Badge — shadcn variants" description="default, secondary, outline, ghost, link, destructive + legacy mapping">
              <div className="flex flex-wrap gap-2">
                <Badge>default</Badge>
                <Badge variant="secondary">secondary</Badge>
                <Badge variant="outline">outline</Badge>
                <Badge variant="ghost">ghost</Badge>
                <Badge variant="link">link</Badge>
                <Badge variant="destructive">destructive</Badge>
                <Badge variant="brand">brand → default</Badge>
                <Badge variant="success">success → secondary</Badge>
                <Badge variant="warning">warning → outline</Badge>
                <Badge variant="danger">danger → destructive</Badge>
              </div>
            </DSSection>
            <DSSection title="ModuleBadge — TechBox domain wrapper">
              <div className="flex flex-wrap gap-2">
                {Object.keys(moduleMeta).slice(0,12).map(k => <ModuleBadge key={k} module={k as ModuleSlug}>{moduleMeta[k as ModuleSlug]?.titleFa}</ModuleBadge>)}
              </div>
            </DSSection>
          </TabsContent>

          {/* CARDS */}
          <TabsContent value="cards" className="space-y-6 pt-4">
            <DSSection title="Card — Mira">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>کارت ساده</CardTitle><CardDescription>توضیحات کارت</CardDescription><CardAction><Badge>جدید</Badge></CardAction></CardHeader>
                  <CardContent className="text-muted-foreground">محتوای کارت با متن فارسی برای تست RTL.</CardContent>
                  <CardFooter className="gap-2"><Button size="sm">اقدام</Button><Button variant="outline" size="sm">لغو</Button></CardFooter>
                </Card>
                <Card size="sm">
                  <CardHeader><CardTitle>کارت sm</CardTitle><CardDescription>سایز کوچک‌تر</CardDescription></CardHeader>
                  <CardContent>محتوا</CardContent>
                </Card>
                <Card>
                  <div className="relative w-full h-36 overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop" alt="tech" fill className="object-cover" />
                  </div>
                  <CardHeader><CardTitle>با تصویر</CardTitle></CardHeader>
                  <CardContent><p className="text-xs text-muted-foreground">کارت محتوا برای بلاگ / فروشگاه</p></CardContent>
                </Card>
              </div>
            </DSSection>
          </TabsContent>

          {/* FORMS */}
          <TabsContent value="forms" className="space-y-6 pt-4">
            <DSSection title="Input / Textarea / Label / Field" description="shadcn Input, Textarea, Label, Field">
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                <Field>
                  <FieldLabel htmlFor="ds-input">نام</FieldLabel>
                  <Input id="ds-input" placeholder="نام خود را وارد کنید" />
                  <FieldDescription>توضیح فیلد</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="ds-textarea">توضیحات</FieldLabel>
                  <Textarea id="ds-textarea" placeholder="متن چندخطی" rows={3} />
                </Field>
                <Field>
                  <FieldLabel>Select ماژول</FieldLabel>
                  <Select defaultValue="blog">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">مجله</SelectItem>
                      <SelectItem value="news">اخبار</SelectItem>
                      <SelectItem value="shop">فروشگاه</SelectItem>
                      <SelectItem value="forum">انجمن</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Checkbox</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Checkbox id="cb1" defaultChecked /><Label htmlFor="cb1">مرا به خاطر بسپار</Label>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Switch</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Switch checked={switchOn} onCheckedChange={setSwitchOn} id="sw1" /><Label htmlFor="sw1">{switchOn ? "فعال" : "غیرفعال"}</Label>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Radio Group</FieldLabel>
                  <RadioGroup value={radioValue} onValueChange={setRadioValue} className="flex gap-4">
                    <div className="flex items-center gap-1.5"><RadioGroupItem value="1" id="r1" /><Label htmlFor="r1">گزینه ۱</Label></div>
                    <div className="flex items-center gap-1.5"><RadioGroupItem value="2" id="r2" /><Label htmlFor="r2">گزینه ۲</Label></div>
                    <div className="flex items-center gap-1.5"><RadioGroupItem value="3" id="r3" /><Label htmlFor="r3">گزینه ۳</Label></div>
                  </RadioGroup>
                </Field>
              </div>
            </DSSection>
          </TabsContent>

          {/* OVERLAYS */}
          <TabsContent value="overlays" className="space-y-6 pt-4">
            <DSSection title="Dialog / AlertDialog / Drawer / Sheet / Dropdown / Popover / Tooltip / HoverCard">
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
                  <DialogContent>
                    <DialogHeader><DialogTitle>عنوان دیالوگ</DialogTitle><DialogDescription>توضیحات نمونه برای تایید.</DialogDescription></DialogHeader>
                    <div className="py-2 text-sm">محتوای دیالوگ با فرم احتمالی.</div>
                    <DialogFooter><Button>تایید</Button></DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="danger">Alert Dialog</Button>} />
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>آیا مطمئنید؟</AlertDialogTitle><AlertDialogDescription>این عمل قابل بازگشت نیست.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>لغو</AlertDialogCancel><AlertDialogAction>حذف</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Drawer>
                  <DrawerTrigger render={<Button variant="outline">Drawer</Button>} />
                  <DrawerContent>
                    <DrawerHeader><DrawerTitle>Drawer عنوان</DrawerTitle><DrawerDescription>برای موبایل و سایدبار</DrawerDescription></DrawerHeader>
                    <div className="p-4 text-sm">محتوا</div>
                    <DrawerFooter><DrawerClose render={<Button variant="outline">بستن</Button>} /></DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <Sheet>
                  <SheetTrigger render={<Button variant="outline">Sheet</Button>} />
                  <SheetContent>
                    <SheetHeader><SheetTitle>Sheet</SheetTitle><SheetDescription>برای NewsSidebar / Chatbot</SheetDescription></SheetHeader>
                    <div className="p-4 text-sm">محتوای شیت راست/چپ</div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline">Dropdown Menu</Button>} />
                  <DropdownMenuContent>
                    <DropdownMenuLabel>منو</DropdownMenuLabel><DropdownMenuSeparator />
                    <DropdownMenuItem>پروفایل</DropdownMenuItem><DropdownMenuItem>تنظیمات</DropdownMenuItem><DropdownMenuItem>خروج</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                  <PopoverTrigger render={<Button variant="outline">Popover</Button>} />
                  <PopoverContent className="w-64"><div className="text-sm">محتوای پاپ‌آور — تقویم، فیلتر، اطلاعات</div></PopoverContent>
                </Popover>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger render={<Button variant="outline" size="icon">?</Button>} />
                    <TooltipContent>راهنما — Tooltip</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <HoverCard>
                  <HoverCardTrigger render={<Button variant="ghost">Hover Card</Button>} />
                  <HoverCardContent className="w-64"><div className="text-sm"><div className="font-medium">@hnmodeq</div><div className="text-muted-foreground text-xs">نویسنده تکباکس — Hover Preview</div></div></HoverCardContent>
                </HoverCard>
              </div>
            </DSSection>
          </TabsContent>

          {/* NAVIGATION */}
          <TabsContent value="navigation" className="space-y-6 pt-4">
            <DSSection title="Tabs — shadcn Tabs (Base UI)" description="line variant هم موجود است">
              <Tabs defaultValue="tab1">
                <TabsList variant="default"><TabsTrigger value="tab1">تب ۱</TabsTrigger><TabsTrigger value="tab2">تب ۲</TabsTrigger><TabsTrigger value="tab3">تب ۳</TabsTrigger></TabsList>
                <TabsContent value="tab1" className="mt-3 border rounded-md p-3">محتوای تب ۱</TabsContent>
                <TabsContent value="tab2" className="mt-3 border rounded-md p-3">محتوای تب ۲</TabsContent>
                <TabsContent value="tab3" className="mt-3 border rounded-md p-3">محتوای تب ۳</TabsContent>
              </Tabs>
              <Separator className="my-4" />
              <Tabs defaultValue="tab1">
                <TabsList variant="line"><TabsTrigger value="tab1">Line تب ۱</TabsTrigger><TabsTrigger value="tab2">Line تب ۲</TabsTrigger></TabsList>
                <TabsContent value="tab1" className="mt-3">Line style</TabsContent>
                <TabsContent value="tab2" className="mt-3">Line style 2</TabsContent>
              </Tabs>
            </DSSection>

            <DSSection title="Breadcrumb — Missing" description="نیاز به نصب: npx shadcn add breadcrumb">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">خانه</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-foreground">مجله</Link>
                <span>/</span>
                <span className="text-foreground">عنوان مقاله</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">فعلاً پیاده‌سازی سفارشی تا نصب Breadcrumb.</p>
            </DSSection>

            <DSSection title="ScrollArea & Separator" description="برای سایدبار و لیست‌های بلند">
              <ScrollArea className="h-32 rounded border p-2">
                <div className="space-y-2">{Array.from({length:20}).map((_,i)=><div key={i} className="text-xs">آیتم {i+1}</div>)}</div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
              <Separator className="my-3" />
              <div className="flex gap-2 text-xs"><span>اول</span><Separator orientation="vertical" className="h-4" /><span>دوم</span><Separator orientation="vertical" className="h-4" /><span>سوم</span></div>
            </DSSection>
          </TabsContent>

          {/* DATA */}
          <TabsContent value="data" className="space-y-6 pt-4">
            <DSSection title="Avatar / Skeleton / Spinner">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>TB</AvatarFallback></Avatar>
                <Skeleton className="h-8 w-24" />
                <Spinner />
                <SpinnerCenter />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 max-w-md">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </DSSection>

            <DSSection title="Table / Data Table — Missing, Placeholder">
              <div className="rounded border overflow-hidden">
                <div className="grid grid-cols-4 bg-muted p-2 text-xs font-medium"><span>عنوان</span><span>ماژول</span><span>وضعیت</span><span>تاریخ</span></div>
                {[
                  ["راهنمای RAID","tools","منتشر شده","1403/04/12"],
                  ["بررسی سرور HPE","review","پیش‌نویس","1403/04/10"],
                  ["خبر هوش مصنوعی","news","منتشر شده","1403/04/08"],
                ].map((row,i)=><div key={i} className="grid grid-cols-4 p-2 text-xs border-t"><span>{row[0]}</span><span><Badge variant="outline">{row[1]}</Badge></span><span>{row[2]}</span><span>{row[3]}</span></div>)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">برای Data Table اصلی نیاز به نصب: <code>table</code> + <code>data-table</code> (TanStack) و پیاده‌سازی فیلتر/صفحه‌بندی.</p>
            </DSSection>

            <DSSection title="Empty / Progress / Slider / Carousel / Chart / Calendar — Missing placeholders">
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Accordion — برای Q&A درباره ما (admin-editable Faq)",
                  "Carousel — برای گالری محصولات فروشگاه",
                  "Calendar / DatePicker — برای انتشار زمان‌بندی و تایم‌لاین",
                  "Chart Radial — برای آمار و نمودارها",
                  "Command + ScrollArea — برای تاریخچه جستجو",
                  "Empty — برای حالات خالی ادمین",
                  "Progress / Slider — برای آپلود و ابزارها",
                  "Pagination — برای لیست‌های ماژول",
                  "Toggle / ToggleGroup — برای تولبار ادیتور",
                  "Navigation Menu — برای ساب‌منو ابزارها",
                  "Item / Field — برای لیست اعلان‌ها",
                  "Attachment — برای آپلود رزومه work-with-us",
                  "Message / Bubble / MessageScroller — برای چت‌بات",
                ].map(t => (
                  <div key={t} className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">{t} — نیاز به نصب از shadcn registry</div>
                ))}
              </div>
            </DSSection>
          </TabsContent>

          {/* FEEDBACK */}
          <TabsContent value="feedback" className="space-y-6 pt-4">
            <DSSection title="Sonner — Toast">
              <div className="flex flex-wrap gap-2">
                <Button onClick={()=>toast("پیام ساده")}>Toast ساده</Button>
                <Button variant="outline" onClick={()=>toast.success("ذخیره شد!")}>Success</Button>
                <Button variant="outline" onClick={()=>toast.error("خطا در ذخیره")}>Error</Button>
                <Button variant="outline" onClick={()=>toast.info("اطلاعات")}>Info</Button>
                <Button variant="outline" onClick={()=>toast.warning("هشدار")}>Warning</Button>
              </div>
            </DSSection>

            <DSSection title="Focus & Accessibility" description="بررسی focus ring, RTL, dark mode">
              <div className="flex flex-wrap gap-2">
                <Input placeholder="Focus me — باید ring واضح داشته باشد" className="max-w-xs" />
                <Button>Focus Ring Test</Button>
                <Checkbox id="focus-cb" /><Label htmlFor="focus-cb">Checkbox focus</Label>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">در حالت تاریک و روشن، focus states باید دیده شود. دکمه‌ها cursor pointer دارند (به‌خاطر globals).</p>
            </DSSection>

            <DSSection title="RTL & Dark Mode checklist" description="چک‌لیست دستی بعد از هر Phase">
              <ul className="list-disc pr-5 space-y-1 text-xs">
                <li>✅ متن RTL و تراز صحیح؟</li>
                <li>✅ موبایل و دسکتاپ؟ (Drawer vs Sidebar)</li>
                <li>✅ Dark mode رنگ‌ها درست؟ (tokens light/dark)</li>
                <li>✅ Focus visible؟</li>
                <li>✅ No fake data/stats/partners؟</li>
                <li>✅ No console errors؟</li>
                <li>✅ lint + typecheck green؟</li>
              </ul>
            </DSSection>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="text-[10px] text-muted-foreground">
          <p>Next: Phase 3 — Layout shell (Sidebar with shadcn Sidebar + Drawer, theme toggle button, NewsSidebar Sheet, Footer, AuthModal Dialog+Form, Chatbot Sheet)</p>
          <p>Missing installs: npx pnpm dlx shadcn add accordion calendar chart carousel command data-table empty breadcrumb pagination progress slider toggle toggle-group navigation-menu item attachment message bubble etc</p>
          <p>بعد از هر تغییر: pnpm lint + typecheck</p>
        </div>
      </div>
    </main>
  );
}
