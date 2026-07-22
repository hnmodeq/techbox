import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { type ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";

import { LikeButton } from "@/components/ui/like-button";
import { LiveViewCounter } from "@/components/ui/live-view-counter";
import CommentSection from "@/features/comment/components/CommentSection";
import SuggestionGrid from "@/features/content/components/SuggestionGrid";
import Link from "next/link";
import { ShareButton } from "@/components/ui/share-button";
import { SaveButton } from "@/components/ui/save-button";
import { AuthorLink } from "@/components/ui/author-link";
import { ProductGallery } from "@/components/ui/product-gallery";
import VideoPlayer from "@/features/media/components/VideoPlayer";
import MarkdownContent from "@/features/content/components/MarkdownContent";
import { formatRelativeDate } from "@/lib/date-format";
import { ContentJsonLd } from "@/components/seo/StructuredData";
import { getReadingTimeLabel } from "@/lib/reading-time";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export default function ContentDetail({ item }: { item: ContentItem }) {
  const meta = moduleMeta[item.module];
  const videoSrc = (item as any).videoUrl || (item as any).video || (item as any).videoSrc;
  const videoDuration = (item as any).videoDuration;
  const videoMimeType = (item as any).videoMimeType;
  const videoFileSize = (item as any).videoFileSize;
  const gallery = Array.isArray((item as any).gallery) ? (item as any).gallery : [];
  const readingTime = item.readingTimeLabel || getReadingTimeLabel(item.title, item.excerpt, item.content);
  const isBlog = item.module === "blog";

  return (
    <>
      <ContentJsonLd item={item} />
      <article className="mx-auto max-w-3xl px-5 md:px-0 py-10" dir="rtl">

        {/* Hero image */}
        {item.module === "shop" && gallery.length > 0 ? (
          <ProductGallery images={gallery} title={item.title} />
        ) : item.module === "media" && videoSrc ? (
          <div className="space-y-2 mb-8">
            <VideoPlayer src={videoSrc} poster={item.image} title={item.title} />
            <div className="bg-[var(--card-background)] px-4 py-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color flex flex-wrap items-center gap-4">
              <LiveViewCounter module={item.module} slug={item.slug} initialViews={item.views || 0} showLabel />
              <LikeButton contentType={item.module} slug={item.slug} initial={item.likes || 0} />
              {videoDuration && <span dir="ltr">{videoDuration}</span>}
              {videoFileSize && <span dir="ltr">{videoFileSize}</span>}
              {videoMimeType && <span dir="ltr">{videoMimeType}</span>}
            </div>
          </div>
        ) : item.image ? (
          <div className="relative overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] mb-8">
            <div className="relative aspect-[16/9] max-h-[420px]">
              <Image src={item.image} alt={item.title} fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" {...blurProps(item.image)} />
            </div>
            {/* Date + reading time over image bottom */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white/80 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={<span className="cursor-default" />}>
                    {formatRelativeDate(item.date)}
                  </TooltipTrigger>
                  <TooltipContent>تاریخ انتشار</TooltipContent>
                </Tooltip>
                {isBlog && readingTime && (
                  <>
                    <span className="text-white/40">•</span>
                    <Tooltip>
                      <TooltipTrigger render={<span className="cursor-default" />}>
                        {readingTime}
                      </TooltipTrigger>
                      <TooltipContent>زمان مطالعه</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </TooltipProvider>
            </div>
          </div>
        ) : null}

        {/* Author row — author right, view counter + "مجله/..." link left */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]">
          {item.module !== "media" && (
            <AuthorLink
              name={item.author?.name}
              avatar={item.author?.avatar}
              username={item.author?.username}
              role={item.author?.job || item.author?.role}
              verifiedType={(item.author as any)?.verifiedType}
              verifiedLabel={(item.author as any)?.verifiedLabel}
              className="text-foreground"
            />
          )}
          <div className="flex items-center gap-3 ms-auto paragraph-color text-[length:var(--paragraph-font-size)]">
            <LiveViewCounter module={item.module} slug={item.slug} initialViews={item.views || 0} />
            <Link href={`/${item.module}`} className={`${meta.color} hover:underline text-xs`}>
              {meta.titleFa}
            </Link>
            {item.category && <span className="text-xs text-muted-foreground">{item.category}</span>}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mt-5">
          {item.title}
        </h1>

        {/* Article body */}
        <div className="mt-6">
          <MarkdownContent content={item.content || item.excerpt} />
        </div>

        {/* Tags */}
        {item.module !== "media" && (
          <div className="flex flex-wrap gap-2 mt-8">
            {(item.tags || []).map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="transition-opacity hover:opacity-85">
                <span className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-transparent px-2 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                  #{t}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Social actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LikeButton contentType={item.module} slug={item.slug} initial={item.likes || 0} />
          <SaveButton module={item.module} slug={item.slug} />
          <ShareButton />
        </div>

        <CommentSection module={item.module} slug={item.slug} initialComments={item.comments || 0} />
        <SuggestionGrid current={item} />
      </article>
    </>
  );
}
