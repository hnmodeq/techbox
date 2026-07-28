"use client";

/**
 * §2 · Video Hub
 *
 * One latest landscape video anchors the left at desktop. The current quick
 * takes remain compact portrait cards in the right-bottom rail, while one
 * real approved comment on that newest video uses the supplied Spiceworks
 * testimonial anatomy in the right-top slot. Every click opens the existing
 * VideoModal rather than navigating away from the homepage.
 */
import * as React from "react";
import type { ContentItem } from "@/lib/content";
import type { VideoHighlightComment } from "@/features/home/lib/home-types";
import { VideoModal, useVideoModal } from "@/components/content/VideoCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionShell, SectionHeader, ScrollRail } from "../primitives";

export type VideoSectionProps = {
  videos: ContentItem[];
  highlightComment?: VideoHighlightComment | null;
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-video-heading";
const MIN_VIDEOS = 3;

type VideoStyle = React.CSSProperties & {
  "--video-accent"?: string;
};

export function VideoSection({
  videos,
  highlightComment,
  title = "ویدیوهای تکباکس",
  moreLabel = "همه ویدیوها",
  showTitle = true,
  showMore = true,
  accentColor,
}: VideoSectionProps) {
  const items = (videos ?? []).filter((video) => video.videoUrl);
  const [commentToReveal, setCommentToReveal] = React.useState<string | null>(null);
  const modal = useVideoModal(items);

  if (items.length < MIN_VIDEOS) return null;

  const [latest, ...quickTakes] = items;
  const videoComment = highlightComment?.videoSlug === latest.slug ? highlightComment : null;
  const style: VideoStyle = { "--video-accent": accentColor || "var(--primary)" };

  const openVideo = (index: number, commentId?: string) => {
    setCommentToReveal(commentId ?? null);
    modal.open(index);
  };

  return (
    <SectionShell labelledBy={HEADING_ID} className="bg-muted/35" style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="ویدیوهای کوتاه و عملی برای به‌روز ماندن در فناوری اطلاعات."
          href={showMore ? "/media" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.35fr)] lg:gap-8">
        {/* First in RTL is right: comment on top, compact video rail below. */}
        <div className="flex min-w-0 flex-col gap-5">
          {videoComment ? (
            <VideoCommentCard comment={videoComment} onOpen={() => openVideo(0, videoComment.id)} />
          ) : null}

          <ScrollRail
            label="ویدیوهای کوتاه"
            gap={12}
            hideArrows={quickTakes.length < 4}
            bareArrows
            railClassName="pb-1"
          >
            {quickTakes.map((video, index) => (
              <QuickTakeCard key={`${video.module}-${video.slug}`} item={video} onOpen={() => openVideo(index + 1)} />
            ))}
          </ScrollRail>
        </div>

        {/* Second in RTL is left: newest video. */}
        <LatestVideoCard item={latest} onOpen={() => openVideo(0)} />
      </div>

      {modal.activeVideo && (
        <VideoModal
          key={`${modal.activeVideo.slug}-${modal.slideKey}`}
          video={modal.activeVideo}
          onClose={() => {
            setCommentToReveal(null);
            modal.close();
          }}
          onPrev={modal.prev}
          onNext={modal.next}
          slideDirection={modal.slideDirection}
          scrollToCommentId={commentToReveal}
        />
      )}
    </SectionShell>
  );
}

function LatestVideoCard({ item, onOpen }: { item: ContentItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative w-full overflow-hidden bg-background" style={{ aspectRatio: "16/9" }}>
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.title}
            sizes="(min-width: 1024px) 760px, 100vw"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <PlayAffordance />
        <div className="absolute inset-x-5 bottom-5 text-white">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/75">
            <time dateTime={item.date}>{item.date_fa}</time>
            {item.videoDuration && <span dir="ltr">{item.videoDuration}</span>}
          </div>
          <h3 className="text-[22px] font-bold leading-[32px] transition-colors group-hover:text-[color:var(--video-accent)] md:text-[26px] md:leading-[36px]">{item.title}</h3>
        </div>
      </div>
    </button>
  );
}

function QuickTakeCard({ item, onOpen }: { item: ContentItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="hp-card group relative w-[172px] overflow-hidden bg-background text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-[200px]"
      style={{ aspectRatio: "9/16" }}
    >
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.title}
          sizes="200px"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      {item.videoDuration && (
        <Tooltip>
          <TooltipTrigger
            render={<span className="absolute top-2 end-2 rounded-[4px] bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm" dir="ltr" />}
          >
            {item.videoDuration}
          </TooltipTrigger>
          <TooltipContent>زمان ویدیو</TooltipContent>
        </Tooltip>
      )}

      <PlayAffordance />

      <div className="absolute inset-x-3 bottom-3">
        <time dateTime={item.date} className="mb-1 block text-[11px] leading-4 text-white/70">
          {item.date_fa}
        </time>
        <h3 className="line-clamp-2 text-[14px] font-bold leading-[20px] text-white transition-colors group-hover:text-[color:var(--video-accent)]">
          {item.title}
        </h3>
      </div>
    </button>
  );
}

function PlayAffordance() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
        <path d="M15 7.27a2 2 0 0 1 0 3.46L3 17.66A2 2 0 0 1 0 15.93V2.07A2 2 0 0 1 3 .34l12 6.93Z" fill="currentColor" />
      </svg>
    </span>
  );
}

/** One-card version of the supplied three-column Spiceworks testimonial. */
function VideoCommentCard({ comment, onOpen }: { comment: VideoHighlightComment; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-[210px] w-full flex-col border border-border bg-background p-6 text-start transition-colors hover:border-[color:var(--video-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true" className="text-4xl font-black leading-none text-[color:var(--video-accent)]">“</span>
      <p className="mt-2 line-clamp-4 text-[15px] leading-[27px] text-foreground">{comment.text}</p>
      <span className="mt-auto flex items-center gap-3 pt-6">
        <span className="size-11 shrink-0 overflow-hidden rounded-full bg-muted">
          {comment.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.author.avatar} alt="" width={44} height={44} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
              {comment.author.name.trim()[0] ?? "؟"}
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-bold text-[color:var(--video-accent)]">{comment.author.name}</span>
          <time dateTime={comment.date} className="mt-0.5 block text-[12px] text-muted-foreground">{comment.dateFa}</time>
        </span>
      </span>
    </button>
  );
}

export default VideoSection;
