import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldCheck, Users } from "lucide-react";
import { getHomeV2Data } from "@/lib/home-v2-server";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";
import { Num } from "@/components/ui/num";
import { HomeAdvertisementBanner } from "@/features/home/components/sections/HomeAdvertisement";
import { ToolsSection } from "@/features/home/components/sections/ToolsSection";
import { RoleDesk } from "@/features/home-v2/components/RoleDesk";
import { SolutionComposer } from "@/features/home-v2/components/SolutionComposer";
import { EditorialTabs } from "@/features/home-v2/components/EditorialTabs";
import { KnowledgeGraph } from "@/features/home-v2/components/KnowledgeGraph";
import type { ContentItem } from "@/lib/content";
import type { HomeV2Product } from "@/features/home-v2/lib/home-v2-types";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "نسخه آزمایشی خانه تکباکس V2",
  description: "میز عملیات آزمایشی تکباکس برای متخصصان زیرساخت.",
  robots: { index: false, follow: false },
};

export default async function MakingHomepageVersionTwo() {
  const data = await getHomeV2Data();
  const allContent = dedupe([
    ...data.articles,
    ...data.news,
    ...data.videos,
    ...data.reviews,
    ...(data.community.topics ?? []),
    ...(data.community.featured ? [data.community.featured] : []),
  ]);
  const firstAd = data.advertisements[0];
  const secondAd = data.advertisements[1];

  return (
    <main className="min-h-screen bg-white text-foreground dark:bg-black" dir="rtl">
      <div className="border-b border-amber-500/30 bg-amber-500/10">
        <div className="mx-auto flex min-h-10 w-full max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <span className="font-bold text-foreground">نسخه آزمایشی خانه V2 — ساختار فعلی صفحه اصلی دست‌نخورده است.</span>
          <Link href="/" className="font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">بازگشت به خانه فعلی</Link>
        </div>
      </div>

      <nav className="sticky top-(--header-height) z-30 border-b border-border bg-background/95 backdrop-blur" aria-label="ناوبری نسخه دوم خانه">
        <div className="mx-auto flex w-full max-w-[1280px] gap-5 overflow-x-auto px-4 py-2 text-xs font-bold sm:px-6 lg:px-8">
          <a href="#v2-ops" className="shrink-0 text-foreground">امروز</a>
          <a href="#v2-solve" className="shrink-0 text-muted-foreground hover:text-foreground">حل مسئله</a>
          <a href="#v2-for-you" className="shrink-0 text-muted-foreground hover:text-foreground">برای شما</a>
          <a href="#v2-community" className="shrink-0 text-muted-foreground hover:text-foreground">جامعه</a>
          <a href="#v2-editorial" className="shrink-0 text-muted-foreground hover:text-foreground">تحریریه</a>
          <a href="#v2-products" className="shrink-0 text-muted-foreground hover:text-foreground">انتخاب زیرساخت</a>
          <a href="#v2-graph" className="shrink-0 text-muted-foreground hover:text-foreground">نقشه دانش</a>
        </div>
      </nav>

      <OperationsDesk lead={data.lead} news={data.news} forum={data.community.topics ?? []} generatedAt={data.generatedAt} />
      <SolutionComposer catalog={allContent} />
      {firstAd && <HomeAdvertisementBanner advertisement={firstAd} />}
      <RoleDesk content={allContent} />
      <CommunityPulse data={data} />
      <EditorialTabs articles={data.articles} videos={data.videos} reviews={data.reviews} />

      <div className="border-y border-border">
        <ToolsSection accentColor="var(--module-tools-color)" />
      </div>

      {secondAd && <HomeAdvertisementBanner advertisement={secondAd} />}
      <ProductDecision products={data.products} />
      <KnowledgeGraph content={[...data.articles, ...data.news, ...data.reviews]} forum={data.community.topics ?? []} products={data.products} />
      <CompactTimeline events={data.timeline} />
      <TrustAndPeople authors={data.authors} profiles={data.profiles} />
    </main>
  );
}

function OperationsDesk({ lead, news, forum, generatedAt }: { lead: ContentItem | null; news: ContentItem[]; forum: ContentItem[]; generatedAt: string }) {
  const pulse = [...news.slice(0, 3), ...forum.slice(0, 2)].slice(0, 5);
  return (
    <section id="v2-ops" className="bg-white py-12 dark:bg-black" aria-labelledby="v2-ops-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-black text-[color:var(--module-news-color)]">TECHBOX OPERATIONS DESK / BETA</p>
            <h1 id="v2-ops-title" className="mt-2 text-4xl font-black leading-[1.25] text-foreground sm:text-5xl">
              میز روزانهٔ متخصصان زیرساخت
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
              خبر مهم، مسئله واقعی، ابزار محاسبه و تصمیم خرید—در یک مسیر به‌هم‌پیوسته، نه چند ماژول جدا از هم.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            آخرین گردآوری: <RelativeDate date={generatedAt} />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          {lead ? (
            <article className="group border border-border bg-card">
              <Link href={`/${lead.module}/${lead.slug}`} className="grid h-full md:grid-cols-[1.2fr_.8fr]">
                <div className="relative min-h-[320px] overflow-hidden bg-muted md:min-h-[470px]">
                  <RemoteImage src={lead.image} alt={lead.title} sizes="(min-width: 1024px) 650px, 100vw" priority className="transition-transform duration-500 group-hover:scale-[1.015]" />
                </div>
                <div className="flex flex-col justify-end p-6 sm:p-8">
                  <span className="text-xs font-bold text-[color:var(--module-blog-color)]">مهم‌ترین انتخاب تحریریه</span>
                  <h2 className="mt-2 text-2xl font-black leading-9 text-foreground">{lead.title}</h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">{lead.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-foreground">مطالعه <ArrowLeft className="size-4" /></span>
                </div>
              </Link>
            </article>
          ) : (
            <div className="flex min-h-96 items-center justify-center border border-dashed border-border text-muted-foreground">هنوز محتوای اصلی آماده نیست.</div>
          )}

          <aside className="border border-border bg-transparent p-5 sm:p-6" aria-label="نبض عملیات">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[color:var(--module-news-color)]">نبض عملیات</p>
                <h2 className="mt-1 text-xl font-black text-foreground">آنچه امروز باید ببینی</h2>
              </div>
              <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
            </div>
            <div className="mt-5 divide-y divide-border">
              {pulse.map((item, index) => (
                <Link key={`${item.module}-${item.slug}`} href={`/${item.module}/${item.slug}`} className="group grid grid-cols-[2rem_1fr] gap-3 py-4 first:pt-0">
                  <span className="font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[10px] font-bold text-muted-foreground">{item.module === "forum" ? "مسئله باز جامعه" : "به‌روزرسانی تحریریه"}</span>
                    <span className="mt-1 line-clamp-2 block text-sm font-bold leading-6 text-foreground group-hover:underline">{item.title}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Link href="/forum?new=1" className="border border-border px-3 py-2 text-center text-xs font-bold text-foreground">طرح مسئله</Link>
              <Link href="/tools" className="border border-border px-3 py-2 text-center text-xs font-bold text-foreground">اجرای ابزار</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CommunityPulse({ data }: { data: Awaited<ReturnType<typeof getHomeV2Data>> }) {
  const featured = data.community.featured;
  const open = data.community.topics.slice(0, 3);
  return (
    <section id="v2-community" className="bg-white py-14 dark:bg-black" aria-labelledby="v2-community-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric value={data.metrics.solvedTopics} label="مسئله حل‌شده" />
          <Metric value={data.metrics.approvedForumAnswers} label="پاسخ تأییدشده" />
          <Metric value={data.metrics.activeMembers} label="عضو فعال" />
          <Metric value={data.metrics.publishedReviews} label="بررسی منتشرشده" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-emerald-50 p-6 dark:bg-emerald-950/25">
            <p className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-4" /> پاسخ قابل اتکا</p>
            <h2 id="v2-community-title" className="mt-3 text-2xl font-black leading-9 text-foreground">{featured?.title || "جامعهٔ حل مسئله تکباکس"}</h2>
            <p className="mt-3 line-clamp-5 text-sm leading-7 text-muted-foreground">{featured?.excerpt || "پرسش‌های واقعی و پاسخ‌هایی که تجربه اجرایی را به دانش قابل استفاده تبدیل می‌کنند."}</p>
            <Link href={featured ? `/forum/${featured.slug}` : "/forum"} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">مشاهده راه‌حل <ArrowLeft className="size-4" /></Link>
          </div>
          <div className="border-y border-border">
            {open.map((topic) => (
              <Link key={topic.slug} href={`/forum/${topic.slug}`} className="grid gap-1 border-b border-border py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>
                  <span className="line-clamp-2 text-sm font-bold leading-6 text-foreground">{topic.title}</span>
                  <span className="mt-1 line-clamp-1 block text-xs text-muted-foreground">{topic.excerpt}</span>
                </span>
                <span className="text-[11px] text-[color:var(--module-forum-color)]">{topic.comments ?? 0} پاسخ</span>
              </Link>
            ))}
            <Link href="/forum" className="inline-flex py-4 text-sm font-bold text-foreground underline underline-offset-4">همه بحث‌های جامعه</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="border border-border p-5">
      <div className="text-3xl font-black text-foreground"><Num>{value}</Num></div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProductDecision({ products }: { products: HomeV2Product[] }) {
  return (
    <section id="v2-products" className="bg-white py-14 dark:bg-black" aria-labelledby="v2-products-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[color:var(--module-shop-color)]">انتخاب مبتنی بر داده</p>
            <h2 id="v2-products-title" className="mt-1 text-3xl font-black text-foreground">زیرساخت مناسب، نه صرفاً تخفیف بیشتر</h2>
            <p className="mt-2 text-sm text-muted-foreground">شش رک‌مونت و دو تاور؛ ترکیبی از فروش واقعی، تخفیف و تازگی موجودی.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-foreground underline underline-offset-4">مشاهده فروشگاه</Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {products.length === 0 && <p className="mt-7 border border-dashed border-border p-8 text-center text-sm text-muted-foreground">موجودی مناسب برای این چیدمان پیدا نشد.</p>}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: HomeV2Product }) {
  return (
    <article className="group border border-border bg-card">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <RemoteImage src={product.image} alt={product.title} sizes="(min-width: 1024px) 300px, 50vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-[color:var(--module-shop-color)]">{product.formFactor === "rackmount" ? "رک‌مونت" : "تاور"}</span>
            {product.discountPercent ? <span className="text-[10px] font-bold text-destructive">{product.discountPercent.toLocaleString("fa-IR")}٪ تخفیف</span> : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-foreground">{product.model || product.title}</h3>
          <div className="mt-3 flex items-end justify-between gap-2 border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">{product.salesCount > 0 ? `${product.salesCount.toLocaleString("fa-IR")} فروش` : "منتخب تحریریه"}</span>
            <span className="text-sm font-black text-foreground">{product.priceAmount ? `${product.priceAmount.toLocaleString("fa-IR")} تومان` : "استعلام"}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CompactTimeline({ events }: { events: Awaited<ReturnType<typeof getHomeV2Data>>["timeline"] }) {
  if (!events.length) return null;
  return (
    <section className="bg-white py-12 dark:bg-black" aria-labelledby="v2-timeline-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[color:var(--module-timeline-color)]">از امروز به گذشته</p>
            <h2 id="v2-timeline-title" className="mt-1 text-2xl font-black text-foreground">سه ایستگاه نزدیک گاه‌شمار</h2>
          </div>
          <Link href="/timeline" className="text-sm font-bold text-foreground underline underline-offset-4">گاه‌شمار کامل</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <article key={event.id} className="grid grid-cols-[5rem_1fr] gap-4 border-t border-border pt-4">
              <span className="text-2xl font-black text-[color:var(--module-timeline-color)]"><Num>{event.year}</Num></span>
              <span>
                <h3 className="text-sm font-bold text-foreground">{event.title}</h3>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{event.description}</p>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustAndPeople({ authors, profiles }: { authors: Awaited<ReturnType<typeof getHomeV2Data>>["authors"]; profiles: Awaited<ReturnType<typeof getHomeV2Data>>["profiles"] }) {
  const people = authors.length ? authors : profiles;
  return (
    <section className="border-t border-border bg-white py-14 dark:bg-black" aria-labelledby="v2-trust-title">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <ShieldCheck className="size-7 text-[color:var(--module-review-color)]" />
          <h2 id="v2-trust-title" className="mt-4 text-3xl font-black text-foreground">اعتماد باید قابل بررسی باشد</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">نسخه دوم، تحریریه، جامعه و تجارت را کنار هم می‌آورد اما مرز آن‌ها را پنهان نمی‌کند.</p>
          <ul className="mt-5 space-y-2 text-sm text-foreground">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" /> نویسنده و تاریخ انتشار مشخص</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" /> بررسی مستقل از جایگاه فروش</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" /> تبلیغات با برچسب و مقصد مشخص</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" /> مسیر اصلاح و بازخورد عمومی</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2"><Users className="size-5 text-muted-foreground" /><h3 className="text-lg font-black text-foreground">آدم‌های پشت تکباکس</h3></div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {people.slice(0, 6).map((person) => {
              const subtitle = "role" in person ? person.role : person.job;
              return (
                <Link key={person.username} href={`/author/${person.username}`} className="group flex items-center gap-3 border-t border-border pt-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
                    <RemoteImage src={person.avatar} alt={person.name} sizes="44px" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground group-hover:underline">{person.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{subtitle || "عضو جامعه"}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/about" className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-bold text-foreground">درباره تیم <ExternalLink className="size-3.5" /></Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-bold text-foreground">گزارش خطا یا بازخورد</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function dedupe(items: ContentItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.module}:${item.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
