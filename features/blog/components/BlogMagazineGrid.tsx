"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock3, Eye, MessageCircle, UserRound } from "lucide-react";
import { type ContentItem } from "@/lib/content";
import { ArticleModal } from "@/features/blog/components/ArticleModal";
import { formatRelativeDate } from "@/lib/date-format";
import { Card } from "@/components/ui/card";
import { blurProps } from "@/lib/image-placeholder";
import { UserAvatar } from "@/components/ui/user-avatar";

interface BlogMagazineGridProps {
  serverItems?: ContentItem[];
}

const EMPTY_ITEMS: ContentItem[] = [];
const PEOPLE_TAGS = new Set(["people", "people!", "person", "persons", "people-section", "شخصیت", "شخصیت‌ها", "شخصیت ها", "افراد"]);

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}

function isPeopleArticle(item: ContentItem) {
  return item.tags?.some((tag) => PEOPLE_TAGS.has(normalizeTag(tag))) ?? false;
}

function getItemKey(item: ContentItem) {
  return `${item.module}:${item.slug}`;
}

function getItemIndex(items: ContentItem[], item: ContentItem) {
  const key = getItemKey(item);
  return items.findIndex((candidate) => getItemKey(candidate) === key);
}

function formatCount(value?: number) {
  if (!value || value < 1) return null;
  return value.toLocaleString("fa-IR");
}

export default function BlogMagazineGrid({ serverItems }: BlogMagazineGridProps) {
  const items = serverItems ?? EMPTY_ITEMS;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { regularArticles, peopleArticles } = useMemo(() => {
    const people: ContentItem[] = [];
    const regular: ContentItem[] = [];

    for (const item of items) {
      if (isPeopleArticle(item)) people.push(item);
      else regular.push(item);
    }

    return { regularArticles: regular, peopleArticles: people };
  }, [items]);

  const leadArticles = regularArticles.slice(0, 3);
  const magazineArticles = regularArticles.slice(3, 9);
  const gridArticles = regularArticles.slice(9);
  const newestArticle = items[0];

  const openItem = useCallback(
    (item: ContentItem) => {
      const index = getItemIndex(items, item);
      if (index >= 0) setActiveIndex(index);
    },
    [items]
  );
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : i > 0 ? i - 1 : items.length - 1)),
    [items.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : i < items.length - 1 ? i + 1 : 0)),
    [items.length]
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-8" dir="rtl">
        <Card className="border-dashed p-12 text-center">
          <h3 className="text-lg font-black">هنوز مقاله‌ای منتشر نشده</h3>
          <p className="mt-2 text-sm text-muted-foreground">به محض انتشار اولین مقاله، مجله اینجا نمایش داده می‌شود.</p>
        </Card>
      </main>
    );
  }

  return (
    <>
      <main className="overflow-hidden" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
          <MagazineMasthead total={items.length} newest={newestArticle} />

          {leadArticles.length > 0 && (
            <section className="mt-8 border-y border-foreground/15 py-4 md:py-6" aria-labelledby="blog-lead-stories">
              <SectionKicker id="blog-lead-stories" eyebrow="Top Stories" title="آخرین روایت‌های مجله" />
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)_minmax(0,1fr)] lg:items-stretch">
                {leadArticles[1] && (
                  <StoryButton item={leadArticles[1]} onOpen={openItem} className="lg:order-1">
                    <LeadSideCard item={leadArticles[1]} align="top" />
                  </StoryButton>
                )}

                {leadArticles[0] && (
                  <StoryButton item={leadArticles[0]} onOpen={openItem} className="lg:order-2">
                    <LeadMainCard item={leadArticles[0]} />
                  </StoryButton>
                )}

                {leadArticles[2] && (
                  <StoryButton item={leadArticles[2]} onOpen={openItem} className="lg:order-3">
                    <LeadSideCard item={leadArticles[2]} align="bottom" />
                  </StoryButton>
                )}
              </div>
            </section>
          )}
        </div>

        {magazineArticles.length > 0 && (
          <section className="relative bg-foreground text-background" aria-labelledby="blog-magazine-strip">
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-background/20 pb-5">
                <SectionKicker id="blog-magazine-strip" eyebrow="Magazine" title="پرونده‌های منتخب" inverted />
                <p className="max-w-xl text-sm leading-7 text-background/65">
                  چینش تمام‌عرض برای خواندن سریع‌تر تازه‌ترین تحلیل‌ها، آموزش‌ها و تجربه‌های اجرایی تکباکس.
                </p>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <StoryButton item={magazineArticles[0]} onOpen={openItem}>
                  <MagazineWideCard item={magazineArticles[0]} />
                </StoryButton>

                {magazineArticles.length > 1 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {magazineArticles.slice(1, 4).map((item) => (
                      <StoryButton key={getItemKey(item)} item={item} onOpen={openItem}>
                        <MagazineListCard item={item} />
                      </StoryButton>
                    ))}
                  </div>
                )}
              </div>

              {magazineArticles.length > 4 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {magazineArticles.slice(4).map((item) => (
                    <StoryButton key={getItemKey(item)} item={item} onOpen={openItem}>
                      <DarkCompactCard item={item} />
                    </StoryButton>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          {peopleArticles.length > 0 && (
            <section className="border-y border-foreground/15 py-8" aria-labelledby="blog-people">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionKicker id="blog-people" eyebrow="People" title="People؛ آدم‌های اثرگذار IT" />
                <Link
                  href="/blog/tag/people"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary underline-offset-4 hover:underline"
                >
                  همه People
                  <ArrowLeft className="size-3" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {peopleArticles.slice(0, 8).map((item) => (
                  <StoryButton key={getItemKey(item)} item={item} onOpen={openItem}>
                    <PeopleStoryCard item={item} />
                  </StoryButton>
                ))}
              </div>
            </section>
          )}

          {gridArticles.length > 0 && (
            <section className={peopleArticles.length > 0 ? "mt-12" : ""} aria-labelledby="blog-all-stories">
              <SectionKicker id="blog-all-stories" eyebrow="Archive" title="مطالب بیشتر مجله" />
              <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gridArticles.map((item) => (
                  <StoryButton key={getItemKey(item)} item={item} onOpen={openItem}>
                    <ArchiveCard item={item} />
                  </StoryButton>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {activeIndex !== null && items[activeIndex] && (
        <ArticleModal
          item={items[activeIndex] as ContentItem}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}

function MagazineMasthead({ total, newest }: { total: number; newest?: ContentItem }) {
  return (
    <header className="border-b-4 border-foreground pb-5 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-y border-foreground/15 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        <span>TechBox Magazine</span>
        <span className="hidden h-1 w-1 rounded-full bg-muted-foreground sm:block" />
        <span>{total.toLocaleString("fa-IR")} مقاله</span>
        {newest?.date && (
          <>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground sm:block" />
            <span>{formatRelativeDate(newest.date)}</span>
          </>
        )}
      </div>
      <h1 className="mt-5 text-4xl font-black tracking-tighter text-foreground sm:text-6xl lg:text-8xl">
        مجله تکباکس
      </h1>
      <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
        خواندنی‌های عملی و به‌روز درباره زیرساخت، شبکه، امنیت، ذخیره‌سازی و آدم‌های پشت فناوری.
      </p>
    </header>
  );
}

function SectionKicker({
  id,
  eyebrow,
  title,
  inverted = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <p className={`text-[11px] font-black uppercase tracking-[0.24em] ${inverted ? "text-background/55" : "text-primary"}`}>
        {eyebrow}
      </p>
      <h2 id={id} className="mt-1 text-xl font-black tracking-tight md:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function StoryButton({
  item,
  onOpen,
  className = "",
  children,
}: {
  item: ContentItem;
  onOpen: (item: ContentItem) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`group block h-full w-full text-right outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${className}`}
    >
      {children}
    </button>
  );
}

function LeadMainCard({ item }: { item: ContentItem }) {
  return (
    <article className="flex h-full min-h-[420px] flex-col overflow-hidden border border-foreground/15 bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl lg:min-h-[610px]">
      <ImageFrame item={item} className="min-h-[260px] flex-1" sizes="(max-width: 1024px) 100vw, 48vw" priority />
      <div className="space-y-4 p-5 md:p-6">
        <StoryMeta item={item} />
        <h3 className="text-2xl font-black leading-tight tracking-tight md:text-4xl">{item.title}</h3>
        {item.excerpt && <p className="line-clamp-3 text-sm leading-7 text-muted-foreground md:text-base">{item.excerpt}</p>}
        <AuthorLine item={item} />
      </div>
    </article>
  );
}

function LeadSideCard({ item, align }: { item: ContentItem; align: "top" | "bottom" }) {
  return (
    <article className="flex h-full min-h-[300px] flex-col overflow-hidden border border-foreground/15 bg-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl lg:min-h-[520px]">
      {align === "top" && <ImageFrame item={item} className="h-56 lg:h-72" sizes="(max-width: 1024px) 100vw, 25vw" />}
      <div className="flex flex-1 flex-col justify-between gap-4 p-4 md:p-5">
        <div className="space-y-3">
          <StoryMeta item={item} compact />
          <h3 className="text-lg font-black leading-tight md:text-2xl">{item.title}</h3>
          {item.excerpt && <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>}
        </div>
        <AuthorLine item={item} compact />
      </div>
      {align === "bottom" && <ImageFrame item={item} className="h-56 lg:h-72" sizes="(max-width: 1024px) 100vw, 25vw" />}
    </article>
  );
}

function MagazineWideCard({ item }: { item: ContentItem }) {
  return (
    <article className="relative min-h-[440px] overflow-hidden border border-background/20 bg-background/5 text-background transition duration-300 group-hover:-translate-y-1">
      <ImageFrame item={item} className="absolute inset-0" sizes="(max-width: 1024px) 100vw, 58vw" dark />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
      <div className="relative flex min-h-[440px] flex-col justify-end p-5 md:p-8">
        <StoryMeta item={item} inverted />
        <h3 className="mt-3 max-w-3xl text-2xl font-black leading-tight md:text-4xl">{item.title}</h3>
        {item.excerpt && <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 md:text-base">{item.excerpt}</p>}
      </div>
    </article>
  );
}

function MagazineListCard({ item }: { item: ContentItem }) {
  return (
    <article className="grid min-h-32 grid-cols-[112px_minmax(0,1fr)] overflow-hidden border border-background/20 bg-background/5 text-background transition duration-300 group-hover:bg-background/10 sm:grid-cols-[136px_minmax(0,1fr)]">
      <ImageFrame item={item} className="h-full min-h-32" sizes="160px" dark />
      <div className="flex flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <StoryMeta item={item} compact inverted />
          <h3 className="line-clamp-2 text-base font-black leading-tight">{item.title}</h3>
        </div>
        <AuthorLine item={item} compact inverted />
      </div>
    </article>
  );
}

function DarkCompactCard({ item }: { item: ContentItem }) {
  return (
    <article className="overflow-hidden border border-background/20 bg-background/5 text-background transition duration-300 group-hover:-translate-y-1 group-hover:bg-background/10">
      <ImageFrame item={item} className="h-44" sizes="(max-width: 1024px) 50vw, 33vw" dark />
      <div className="space-y-3 p-4">
        <StoryMeta item={item} compact inverted />
        <h3 className="line-clamp-2 text-lg font-black leading-tight">{item.title}</h3>
      </div>
    </article>
  );
}

function PeopleStoryCard({ item }: { item: ContentItem }) {
  return (
    <article className="h-full overflow-hidden border border-foreground/15 bg-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
      <div className="p-3">
        <ImageFrame item={item} className="aspect-[4/5] rounded-sm" sizes="(max-width: 1024px) 50vw, 25vw" />
      </div>
      <div className="space-y-3 px-4 pb-5">
        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          <UserRound className="size-3" />
          People
        </div>
        <h3 className="line-clamp-3 text-lg font-black leading-tight">{item.title}</h3>
        {item.excerpt && <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>}
      </div>
    </article>
  );
}

function ArchiveCard({ item }: { item: ContentItem }) {
  return (
    <article className="h-full border-t-4 border-foreground bg-card pt-3 transition duration-300 group-hover:-translate-y-1">
      <ImageFrame item={item} className="aspect-[16/10]" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw" />
      <div className="space-y-3 pt-4">
        <StoryMeta item={item} compact />
        <h3 className="line-clamp-3 text-lg font-black leading-tight">{item.title}</h3>
        {item.excerpt && <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>}
      </div>
    </article>
  );
}

function ImageFrame({
  item,
  className,
  sizes,
  priority = false,
  dark = false,
}: {
  item: ContentItem;
  className: string;
  sizes: string;
  priority?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${dark ? "bg-white/10" : "bg-muted"} ${className}`}>
      {item.image ? (
        <Image
          src={item.image}
          alt={item.title}
          fill
          priority={priority}
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes={sizes}
          {...blurProps(item.image)}
        />
      ) : (
        <div className={`absolute inset-0 grid place-items-center ${dark ? "bg-white/10" : "bg-muted"}`}>
          <span className={`px-4 text-center text-xs font-bold ${dark ? "text-white/55" : "text-muted-foreground"}`}>{item.category || item.title}</span>
        </div>
      )}
    </div>
  );
}

function StoryMeta({ item, compact = false, inverted = false }: { item: ContentItem; compact?: boolean; inverted?: boolean }) {
  const views = formatCount(item.views);
  const comments = formatCount(item.comments);
  const textColor = inverted ? "text-white/65" : "text-muted-foreground";
  const categoryColor = inverted ? "text-white" : "text-foreground";

  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] font-bold ${textColor}`}>
      {item.category && <span className={`uppercase tracking-[0.16em] ${categoryColor}`}>{item.category}</span>}
      {item.category && <span className="opacity-40">/</span>}
      <span>{formatRelativeDate(item.date)}</span>
      {!compact && item.readingTimeLabel && (
        <>
          <span className="opacity-40">/</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{item.readingTimeLabel}</span>
        </>
      )}
      {!compact && views && (
        <>
          <span className="opacity-40">/</span>
          <span className="inline-flex items-center gap-1"><Eye className="size-3" />{views}</span>
        </>
      )}
      {!compact && comments && (
        <>
          <span className="opacity-40">/</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" />{comments}</span>
        </>
      )}
    </div>
  );
}

function AuthorLine({ item, compact = false, inverted = false }: { item: ContentItem; compact?: boolean; inverted?: boolean }) {
  const name = item.author?.name;
  if (!name) return null;

  return (
    <div className={`flex items-center gap-2 text-xs font-bold ${inverted ? "text-white/70" : "text-muted-foreground"}`}>
      <UserAvatar
        name={name}
        username={item.author?.username}
        src={item.author?.avatar}
        sizes="28px"
        className="size-7 text-[10px] ring-1 ring-foreground/10"
      />
      <span className={compact ? "line-clamp-1" : ""}>{name}</span>
    </div>
  );
}
