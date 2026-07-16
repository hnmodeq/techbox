"use client";
import Image from "next/image";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardStats } from "@/components/ui/card-stats";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function stripPreviewText(value?: string) {
  return (value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\-[\]()]/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function articlePreview(item: { excerpt?: string; content?: string }) {
  const content = stripPreviewText(item.content);
  const excerpt = stripPreviewText(item.excerpt);

  // The card preview should be article body text, not just the short excerpt.
  // If body content is unavailable, fall back to the DB excerpt.
  let text = content || excerpt;

  if (content && excerpt && content.length < 220 && !content.includes(excerpt)) {
    text = `${content} ${excerpt}`.trim();
  }

  if (!text) return '';
  return text.endsWith('...') || text.endsWith('…') ? text : `${text}...`;
}
function compactReadingTimeLabel(value?: string) {
  return (value || '').replace(/\s*مطالعه\s*$/, '');
}

function getAuthorSlug(author?: { name?: string; username?: string }) {
  const value = author?.username || author?.name || 'editorial';
  return value.trim().toLowerCase().replace(/[^a-z0-9_\u0600-\u06FF]+/g, '-');
}

function ArticleAuthorMeta({ author, className = '' }: { author?: { name?: string; username?: string; avatar?: string; job?: string; role?: string }; className?: string }) {
  const name = author?.name || 'تحریریه';
  const job = author?.job || author?.role || '';
  const slug = getAuthorSlug(author);

  return (
    <Link
      href={`/author/${encodeURIComponent(slug)}`}
      onClick={(event) => event.stopPropagation()}
      className={`grid grid-cols-[minmax(0,1fr)_2rem] grid-rows-2 items-center gap-x-2 text-right transition-opacity hover:opacity-90 ${className}`}
      dir="ltr"
    >
      <div className="col-start-1 row-start-1 min-w-0 self-end truncate text-xs font-extrabold text-foreground sm:text-sm" dir="rtl">
        {name}
      </div>
      {job && (
        <div className="col-start-1 row-start-2 min-w-0 self-start truncate text-[10px] text-muted-foreground sm:text-[11px]" dir="rtl">
          {job}
        </div>
      )}
      <div className="relative col-start-2 row-span-2 row-start-1 size-8 overflow-hidden rounded-full ring-1 ring-border transition-all group-hover:ring-primary">
        <Image src={author?.avatar || '/assets/hooman.png'} alt={name} fill sizes="32px" className="object-cover" />
      </div>
    </Link>
  );
}

export default function BlogGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("blog");
  const { items: dbItems, loading } = useDbPosts("blog", fallbackItems, 100);

  // Prefer server-fetched items when available
  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;
  
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="blog" title="مجله تکباکس" description={`مقالات تخصصی زیرساخت • ${items.length.toLocaleString("fa-IR")} مطلب`} />
      
      {loading ? (
        <div className="responsive-card-grid-lg grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-2 pt-3">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="responsive-card-grid-lg grid gap-6">
          {items.map((p) => (
            <Card
              key={p.slug}
              className="group h-full gap-0 overflow-hidden p-0 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={p.image || "/assets/blog-1.jpg"}
                    alt={p.title}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem] transition-colors duration-300 group-hover:text-[var(--blog)]">
                      {p.title}
                    </h3>
                    {p.readingTimeLabel && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="shrink-0 pt-1 text-xs font-medium text-muted-foreground" />}>
                          {compactReadingTimeLabel(p.readingTimeLabel)}
                        </TooltipTrigger>
                        <TooltipContent>زمان مطالعه</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[5.25rem] mt-2 leading-7">
                    {articlePreview(p)}
                  </p>
                </CardContent>
              </Link>
              <div className="mt-auto border-t px-4 pb-4 pt-3" dir="ltr">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-3 gap-y-1">
                  <Tooltip>
                    <TooltipTrigger render={<span className="col-start-1 row-start-1 justify-self-start text-xs font-bold text-muted-foreground" dir="rtl" />}>
                      {p.date_fa}
                    </TooltipTrigger>
                    <TooltipContent>تاریخ انتشار این مقاله</TooltipContent>
                  </Tooltip>
                  <div className="col-start-1 row-start-2 justify-self-start">
                    <CardStats module="blog" slug={p.slug} initialViews={p.views} initialLikes={p.likes} initialComments={p.comments || 0} showComments={true} />
                  </div>
                  <ArticleAuthorMeta author={p.author} className="col-start-2 row-span-2 row-start-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {items.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <CardContent className="space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-semibold">هنوز مقاله‌ای منتشر نشده</h3>
            <p className="text-sm text-muted-foreground">
              به زودی مقالات تخصصی زیرساخت و شبکه منتشر خواهد شد.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
