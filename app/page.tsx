import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Boxes,
  Calculator,
  CircuitBoard,
  Clock3,
  Compass,
  LifeBuoy,
  MessageSquareText,
  PlayCircle,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import { HomeDataProvider, type HomeData } from "@/features/home/lib/home-data";
import { getHomeData } from "@/lib/home-server";
import { getModuleConfig } from "@/lib/module-config";
import type { ContentItem, ModuleSlug } from "@/lib/content";
import { prisma } from "@/lib/db";
import { blurProps } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";

type TimelinePreview = {
  id: string;
  title: string;
  description: string;
  dateFa: string;
  yearFa: number;
  importance: number;
};

type FeaturePath = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const moduleLabels: Partial<Record<ModuleSlug, string>> = {
  blog: "مجله",
  media: "ویدیو",
  shop: "فروشگاه",
  forum: "فروم",
  review: "بررسی",
  download: "دانلود",
  news: "خبر",
  tools: "ابزار",
};

const buyingPaths: FeaturePath[] = [
  { title: "مشاوره خرید سرور", description: "انتخاب نسل، پردازنده، رم، RAID و سناریوی مناسب", href: "/consultation", icon: Server },
  { title: "ذخیره‌سازی و NAS", description: "ظرفیت، بکاپ، RAID، برند و توسعه‌پذیری", href: "/consultation", icon: Boxes },
  { title: "شبکه و امنیت", description: "سوییچ، فایروال، وایرلس، مانیتورینگ و طراحی", href: "/consultation", icon: ShieldCheck },
  { title: "خرید از فروشگاه", description: "محصولات تخصصی زیرساخت و تجهیزات سازمانی", href: "/shop", icon: ShoppingBag },
];

const toolCards: FeaturePath[] = [
  { title: "RAID Calculator", description: "محاسبه ظرفیت قابل استفاده و تحمل خرابی RAID", href: "/tools/raid-calculator", icon: Calculator },
  { title: "Subnet Calculator", description: "محاسبه رنج IP، ماسک، Gateway و Broadcast", href: "/tools/subnet-calculator", icon: CircuitBoard },
  { title: "NAS Selector", description: "انتخاب NAS بر اساس ظرفیت و سناریوی استفاده", href: "/tools/nas-selector", icon: Server },
  { title: "NVR Selector", description: "انتخاب NVR و ظرفیت ذخیره‌سازی دوربین‌ها", href: "/tools/nvr-selector", icon: Wrench },
];

const topicCards: Array<{ title: string; description: string; query: string }> = [
  { title: "شبکه", description: "سوییچ، VLAN، وایرلس و طراحی زیرساخت", query: "شبکه" },
  { title: "ذخیره‌سازی", description: "NAS، SAN، RAID، بکاپ و ظرفیت‌سنجی", query: "ذخیره‌سازی" },
  { title: "امنیت", description: "فایروال، هاردنینگ، مانیتورینگ و ریسک", query: "امنیت" },
  { title: "سرور", description: "سخت‌افزار، مجازی‌سازی، ارتقا و نگهداری", query: "سرور" },
  { title: "ابزارها", description: "محاسبه‌گرها و انتخاب‌گرهای رایگان IT", query: "ابزار" },
  { title: "مشاوره", description: "کمک برای خرید درست تجهیزات IT", query: "مشاوره خرید" },
];

const getTimelinePreview = unstable_cache(
  async (): Promise<TimelinePreview[]> => {
    if (!process.env.DATABASE_URL) return [];

    try {
      const events = await prisma.timelineEvent.findMany({
        where: { published: true },
        orderBy: [{ importance: "desc" }, { dateGr: "desc" }],
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          dateFa: true,
          yearFa: true,
          importance: true,
        },
      });

      return events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        dateFa: event.dateFa,
        yearFa: event.yearFa,
        importance: event.importance,
      }));
    } catch (error) {
      console.error("[home] Failed to load timeline preview:", error);
      return [];
    }
  },
  ["home-timeline-preview-v1"],
  { revalidate: 86400, tags: ["home-data"] }
);

function itemHref(item: ContentItem) {
  return `/${item.module}/${item.slug}`;
}

function byFeatured(items: ContentItem[]) {
  return [...items].sort((a, b) => {
    const aTags = new Set((a.tags || []).map((tag) => tag.toLowerCase()));
    const bTags = new Set((b.tags || []).map((tag) => tag.toLowerCase()));
    const score = (tags: Set<string>) => Number(tags.has("featured")) + Number(tags.has("home")) + Number(tags.has("homepage"));
    return score(bTags) - score(aTags) || new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function collectHighlights(data: HomeData) {
  const modules = data.modules || {};
  const mixed = [
    ...(modules.blog || []),
    ...(modules.media || []),
    ...(modules.review || []),
    ...(modules.forum || []),
    ...(modules.shop || []),
    ...(modules.tools || []),
  ];

  const seen = new Set<string>();
  return byFeatured(mixed).filter((item) => {
    const key = `${item.module}:${item.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function priceText(item: ContentItem) {
  if (item.priceLabel) return item.priceLabel;
  if (typeof item.priceAmount === "number" && item.priceAmount > 0) {
    return `${item.priceAmount.toLocaleString("fa-IR")} تومان`;
  }
  return "مشاهده و مشاوره";
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  inverted = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  inverted?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={cn("text-[11px] font-black uppercase tracking-[0.24em]", inverted ? "text-white/50" : "text-primary")}>
            {eyebrow}
          </p>
        )}
        <h2 className={cn("mt-1 text-2xl font-black tracking-tight md:text-3xl", inverted && "text-white")}>{title}</h2>
        {description && <p className={cn("mt-2 text-sm leading-7", inverted ? "text-white/65" : "text-muted-foreground")}>{description}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className={cn("inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline", inverted ? "text-white" : "text-primary")}>
          {linkLabel}
          <ArrowLeft className="size-4" />
        </Link>
      )}
    </div>
  );
}

function SearchBox() {
  return (
    <form action="/search" className="mx-auto mt-7 flex max-w-3xl items-center gap-2 rounded-2xl border bg-background/90 p-2 shadow-2xl shadow-black/5 backdrop-blur">
      <Search className="ms-3 size-5 shrink-0 text-muted-foreground" />
      <input
        name="q"
        type="search"
        className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder="جستجو در محصولات، مقالات، ابزارها و سوالات..."
      />
      <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground transition hover:bg-primary/85">
        جستجو
      </button>
    </form>
  );
}

function HomeHero({ totalContent }: { totalContent: number }) {
  return (
    <section className="relative overflow-hidden border-b bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_72%),transparent_32rem)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_left,transparent,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,transparent,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 text-center md:px-8 md:py-20">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          TechBox IT Decision Hub
        </div>
        <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-black leading-tight tracking-tighter sm:text-6xl lg:text-7xl">
          تکباکس؛ جایی برای انتخاب، یادگیری و حل مسائل IT
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
          از خرید تجهیزات شبکه و ذخیره‌سازی تا مقالات تخصصی، ابزارهای کاربردی، ویدیوهای کوتاه و جامعه IT؛ همه‌چیز برای تصمیم‌های بهتر فناوری.
        </p>

        <SearchBox />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <HomeButton href="/consultation" primary>شروع مشاوره خرید</HomeButton>
          <HomeButton href="/shop">مشاهده فروشگاه</HomeButton>
          <HomeButton href="/blog">مطالعه مجله</HomeButton>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "خرید هوشمندانه", value: "مشاوره و فروشگاه", icon: ShoppingBag },
            { label: "آموزش تخصصی", value: "مجله و بررسی‌ها", icon: BookOpen },
            { label: "حل سریع‌تر", value: "ابزارها و فروم", icon: Zap },
            { label: "محتوای زنده", value: `${totalContent.toLocaleString("fa-IR")} آیتم تازه`, icon: Compass },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border bg-card/80 p-4 text-start shadow-sm backdrop-blur">
              <item.icon className="size-5 text-primary" />
              <div className="mt-3 text-sm font-black">{item.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeButton({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-black transition",
        primary ? "border-primary bg-primary text-primary-foreground hover:bg-primary/85" : "bg-background hover:bg-muted"
      )}
    >
      {children}
    </Link>
  );
}

function ImagePanel({ item, className = "", sizes = "(max-width: 768px) 100vw, 50vw" }: { item: ContentItem; className?: string; sizes?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {item.image ? (
        <Image src={item.image} alt={item.title} fill sizes={sizes} className="object-cover transition duration-700 group-hover:scale-105" {...blurProps(item.image)} />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-muted p-6 text-center text-xs font-bold text-muted-foreground">
          {moduleLabels[item.module] || "TechBox"}
        </div>
      )}
    </div>
  );
}

function FeaturedStory({ item }: { item: ContentItem }) {
  return (
    <Link href={itemHref(item)} className="group grid min-h-[440px] overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-2xl lg:grid-cols-[1.2fr_.8fr]">
      <ImagePanel item={item} className="min-h-[260px] lg:min-h-full" />
      <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
        <div>
          <StoryMeta item={item} />
          <h3 className="mt-4 text-2xl font-black leading-tight tracking-tight md:text-4xl">{item.title}</h3>
          {item.excerpt && <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>}
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4 text-xs font-bold text-muted-foreground">
          <span>{item.author?.name || "تحریریه تکباکس"}</span>
          <span className="inline-flex items-center gap-1 text-primary">مشاهده <ArrowLeft className="size-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}

function StoryMeta({ item, inverted = false }: { item: ContentItem; inverted?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-[11px] font-black", inverted ? "text-white/65" : "text-muted-foreground")}>
      <span className={cn("rounded-full px-2 py-1", inverted ? "bg-white/10 text-white" : "bg-primary/10 text-primary")}>{moduleLabels[item.module] || item.module}</span>
      {item.category && <span>{item.category}</span>}
      {item.readingTimeLabel && (
        <>
          <span className="opacity-40">/</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{item.readingTimeLabel}</span>
        </>
      )}
    </div>
  );
}

function SmallStoryCard({ item, dark = false }: { item: ContentItem; dark?: boolean }) {
  return (
    <Link href={itemHref(item)} className={cn("group grid grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-2xl border transition hover:-translate-y-0.5", dark ? "border-white/15 bg-white/5 text-white hover:bg-white/10" : "bg-card hover:shadow-lg")}>
      <ImagePanel item={item} className="h-full min-h-32" sizes="140px" />
      <div className="flex flex-col justify-between gap-3 p-4">
        <div>
          <StoryMeta item={item} inverted={dark} />
          <h3 className="mt-2 line-clamp-2 text-sm font-black leading-6">{item.title}</h3>
        </div>
        <span className={cn("text-[11px] font-bold", dark ? "text-white/55" : "text-muted-foreground")}>{item.author?.name || "تکباکس"}</span>
      </div>
    </Link>
  );
}

function TodaySection({ highlights }: { highlights: ContentItem[] }) {
  const [main, ...rest] = highlights;
  if (!main) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeader
        eyebrow="Today"
        title="امروز در تکباکس"
        description="آخرین مطالب، ویدیوها، پرسش‌ها و پیشنهادهای واقعی از محتوای منتشرشده سایت."
        href="/search"
        linkLabel="جستجوی همه محتوا"
      />
      <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]">
        <FeaturedStory item={main} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 4).map((item) => <SmallStoryCard key={`${item.module}:${item.slug}`} item={item} />)}
        </div>
      </div>
    </section>
  );
}

function ConsultationSection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Buying Assistant"
              title="برای خرید تجهیزات IT مطمئن تصمیم بگیر"
              description="اگر بین مدل‌ها، برندها یا ظرفیت‌ها مرددی، تکباکس کمک می‌کند انتخاب درست‌تری داشته باشی."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <HomeButton href="/consultation" primary>شروع مشاوره خرید</HomeButton>
              <HomeButton href="/shop">مشاهده فروشگاه</HomeButton>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {buyingPaths.map((path) => <FeatureCard key={path.title} item={path} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ item, dark = false }: { item: FeaturePath; dark?: boolean }) {
  return (
    <Link href={item.href} className={cn("group rounded-2xl border p-5 transition hover:-translate-y-1", dark ? "border-white/15 bg-white/5 text-white hover:bg-white/10" : "bg-card hover:shadow-xl")}>
      <item.icon className={cn("size-6", dark ? "text-white" : "text-primary")} />
      <h3 className="mt-4 text-base font-black">{item.title}</h3>
      <p className={cn("mt-2 text-sm leading-6", dark ? "text-white/60" : "text-muted-foreground")}>{item.description}</p>
    </Link>
  );
}

function ShopSection({ products }: { products: ContentItem[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeader
        eyebrow="Shop"
        title="محصولات منتخب فروشگاه"
        description="تجهیزات تخصصی برای زیرساخت، شبکه، ذخیره‌سازی و امنیت."
        href="/shop"
        linkLabel="مشاهده همه محصولات"
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((item) => <ProductCard key={item.slug} item={item} />)}
      </div>
    </section>
  );
}

function ProductCard({ item }: { item: ContentItem }) {
  return (
    <Link href={`/shop/${item.slug}`} className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-xl">
      <ImagePanel item={item} className="aspect-[4/3] bg-white" sizes="(max-width: 1024px) 50vw, 25vw" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {item.brand && <span className="rounded-full border px-2 py-1 text-[10px] font-bold text-muted-foreground">{item.brand}</span>}
          {item.category && <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">{item.category}</span>}
        </div>
        <h3 className="line-clamp-2 min-h-12 text-sm font-black leading-6">{item.title}</h3>
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-center text-xs font-black text-primary">{priceText(item)}</div>
      </div>
    </Link>
  );
}

function ToolsForumSection({ forumItems }: { forumItems: ContentItem[] }) {
  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <SectionHeader
          eyebrow="Solve Faster"
          title="مشکلت را سریع‌تر حل کن"
          description="از ابزارهای محاسباتی تا پرسش از جامعه IT؛ راه‌حل را سریع‌تر پیدا کن."
          href="/forum"
          linkLabel="ورود به فروم"
          inverted
        />
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {toolCards.map((tool) => <FeatureCard key={tool.title} item={tool} dark />)}
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-black text-white">آخرین بحث‌های فروم</h3>
              <MessageSquareText className="size-5 text-white/55" />
            </div>
            <div className="space-y-3">
              {forumItems.slice(0, 4).length > 0 ? (
                forumItems.slice(0, 4).map((item) => <SmallStoryCard key={item.slug} item={item} dark />)
              ) : (
                <p className="rounded-2xl border border-white/10 p-5 text-center text-sm text-white/60">هنوز پرسشی برای نمایش وجود ندارد.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MagazineMediaSection({ blogItems, mediaItems }: { blogItems: ContentItem[]; mediaItems: ContentItem[] }) {
  const items = byFeatured([...blogItems.slice(0, 4), ...mediaItems.slice(0, 3)]).slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeader
        eyebrow="Read & Watch"
        title="بخوان، ببین، عمیق‌تر شو"
        description="مقاله‌های تخصصی، ویدیوهای کوتاه و تجربه‌های عملی برای آدم‌های IT."
      />
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={`${item.module}:${item.slug}`}
            href={itemHref(item)}
            className={cn("group relative min-h-72 overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-1 hover:shadow-xl", index === 0 && "lg:col-span-2")}
          >
            <ImagePanel item={item} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <div className="relative flex min-h-72 flex-col justify-end p-5 text-white">
              {item.module === "media" ? <PlayCircle className="mb-3 size-7 text-white/80" /> : <BookOpen className="mb-3 size-7 text-white/80" />}
              <StoryMeta item={item} inverted />
              <h3 className="mt-3 line-clamp-3 text-xl font-black leading-tight">{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <HomeButton href="/blog">ورود به مجله</HomeButton>
        <HomeButton href="/media">مشاهده ویدیوها</HomeButton>
      </div>
    </section>
  );
}

function TopicsSection() {
  return (
    <section className="border-y bg-muted/25">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <SectionHeader eyebrow="Topics" title="بر اساس نیازت وارد شو" description="اگر نمی‌دانی از کدام ماژول شروع کنی، با موضوع شروع کن؛ جستجو همه بخش‌های سایت را پوشش می‌دهد." />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topicCards.map((topic) => (
            <Link key={topic.title} href={`/search?q=${encodeURIComponent(topic.query)}`} className="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-base font-black">{topic.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection({ events }: { events: TimelinePreview[] }) {
  if (events.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <SectionHeader
        eyebrow="Timeline"
        title="تایم‌لاین فناوری"
        description="رویدادهای مهم، عجیب و الهام‌بخش دنیای IT و تکنولوژی."
        href="/timeline"
        linkLabel="مشاهده تایم‌لاین"
      />
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <Link href="/timeline" key={event.id} className="group rounded-3xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="text-3xl font-black text-primary">{event.yearFa.toLocaleString("fa-IR", { useGrouping: false })}</span>
              <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">اهمیت {event.importance.toLocaleString("fa-IR")}</span>
            </div>
            <h3 className="mt-5 line-clamp-2 text-lg font-black leading-tight">{event.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{event.description}</p>
            <div className="mt-5 text-xs font-bold text-primary">{event.dateFa}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 pb-16 md:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_60%),transparent_28rem)] p-8 text-center shadow-sm md:p-12">
        <LifeBuoy className="mx-auto size-9 text-primary" />
        <h2 className="mx-auto mt-5 max-w-3xl text-2xl font-black leading-tight md:text-4xl">هنوز مطمئن نیستی چه تجهیزی مناسب توست؟</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">نیازت را بگو؛ تکباکس کمک می‌کند گزینه مناسب‌تر را انتخاب کنی و بین محصول، آموزش و تجربه واقعی مسیر درست‌تری بروی.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <HomeButton href="/consultation" primary>درخواست مشاوره خرید</HomeButton>
          <HomeButton href="/shop">فروشگاه</HomeButton>
          <HomeButton href="/blog">مجله</HomeButton>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [config, data, timelineEvents] = await Promise.all([getModuleConfig(), getHomeData(), getTimelinePreview()]);
  const modules = data.modules || {};
  const highlights = collectHighlights(data).slice(0, 5);
  const products = byFeatured(modules.shop || []).slice(0, 4);
  const forumItems = byFeatured(modules.forum || []).slice(0, 4);
  const blogItems = modules.blog || [];
  const mediaItems = modules.media || [];
  const totalContent = Object.values(modules).reduce((sum, items) => sum + (items?.length || 0), 0);

  return (
    <HomeDataProvider initialData={data}>
      <main className="flex w-full max-w-full flex-col overflow-x-hidden" dir="rtl">
        <HomeHero totalContent={totalContent} />
        {highlights.length > 0 && <TodaySection highlights={highlights} />}
        <ConsultationSection />
        {config.shop?.enabled !== false && <ShopSection products={products} />}
        <ToolsForumSection forumItems={forumItems} />
        {(config.blog?.enabled !== false || config.media?.enabled !== false) && <MagazineMediaSection blogItems={blogItems} mediaItems={mediaItems} />}
        <TopicsSection />
        {config.timeline?.enabled !== false && <TimelineSection events={timelineEvents} />}
        <FinalCta />
      </main>
    </HomeDataProvider>
  );
}
