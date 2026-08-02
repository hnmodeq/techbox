"use client";

/**
 * §2 · Video Hub
 *
 * One latest portrait reel anchors the left at desktop. The current quick
 * takes remain compact portrait cards in the right-bottom rail, while one
 * real approved comment on that newest video uses the supplied Spiceworks
 * testimonial anatomy in the right-top slot. Every click opens the existing
 * VideoModal rather than navigating away from the homepage.
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { RemoteImage } from "@/components/ui/remote-image";
import type { VideoHighlightComment } from "@/features/home/lib/home-types";
import { VideoModal, useVideoModal } from "@/components/content/VideoCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RelativeDate } from "@/components/ui/relative-date";
import { SectionShell, SectionHeader, ScrollRail } from "../primitives";

export type VideoSectionProps = {
  videos: ContentItem[];
  highlightComments?: VideoHighlightComment[];
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
  highlightComments,
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

  // Quotes are sampled from ALL videos, so each card must open the video it
  // actually belongs to. Comments whose video is not in this section's slice
  // are dropped rather than opening the wrong one.
  const comments = (highlightComments ?? [])
    .map((comment) => ({ comment, index: items.findIndex((v) => v.slug === comment.videoSlug) }))
    .filter((entry) => entry.index >= 0)
    .slice(0, 4);
  const style: VideoStyle = { "--video-accent": accentColor || "var(--primary)" };

  const openVideo = (index: number, commentId?: string) => {
    setCommentToReveal(commentId ?? null);
    modal.open(index);
  };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
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

      {/* items-stretch (grid default) + h-full on the video makes the poster
          span the full row height, so the section has no dead band under it. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)] lg:gap-8">
        {/* First in RTL is right: comments on top, compact video rail below.
            justify-between distributes the slack between the two blocks so
            this column ends level with the tall portrait video beside it,
            instead of leaving a gap under the rail. */}
        <div className="flex min-w-0 flex-col justify-between gap-5">
          {comments.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {comments.map(({ comment, index }) => (
                <VideoCommentCard
                  key={comment.id}
                  comment={comment}
                  onOpen={() => openVideo(index, comment.id)}
                />
              ))}
            </div>
          )}

          {/* Slider: the quick takes are the only way to reach these videos,
              so the arrows stay available on touch too and appear as soon as
              the rail overflows rather than only past four items. */}
          <ScrollRail
            label="ویدیوهای کوتاه"
            gap={12}
            bareArrows
            arrowsOnMobile
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
    // h-full so the poster matches the section height instead of leaving a
    // gap. The 9/16 ratio stays as a MIN on small screens, where the column
    // stacks and there is no sibling to match.
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col lg:max-w-none">
      <button
        type="button"
        onClick={onOpen}
        className="group relative block min-h-0 flex-1 w-full overflow-hidden text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative h-full w-full overflow-hidden bg-background max-lg:aspect-9/16 lg:min-h-[520px]">
          {/* Above the fold whenever Video is ordered near the top, and the
              browser reports this poster as the LCP element there. Marked
              priority so it is not lazy-loaded on the critical path. */}
          <RemoteImage
            src={item.image}
            alt={item.title}
            sizes="(min-width: 1024px) 390px, 100vw"
            priority
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
          <PlayAffordance />
          <div className="absolute inset-x-5 bottom-5 text-white">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/75">
              <RelativeDate date={item.date} />
              {item.videoDuration && (
                <Tooltip>
                  <TooltipTrigger render={<span dir="ltr" className="cursor-default" />}>
                    {item.videoDuration}
                  </TooltipTrigger>
                  <TooltipContent>مدت زمان ویدیو</TooltipContent>
                </Tooltip>
              )}
            </div>
            <h3 className="text-[22px] font-bold leading-[32px] transition-colors group-hover:text-[color:var(--video-accent)]">{item.title}</h3>
          </div>
        </div>
      </button>
      <div aria-hidden="true" className="h-1 shrink-0 bg-[color:var(--video-accent)]" />
    </div>
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
      <RemoteImage
        src={item.image}
        alt={item.title}
        sizes="200px"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      {item.videoDuration && (
        <Tooltip>
          <TooltipTrigger
            render={<span className="absolute top-2 end-2 rounded-[4px] bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm" dir="ltr" />}
          >
            {item.videoDuration}
          </TooltipTrigger>
          <TooltipContent>مدت زمان ویدیو</TooltipContent>
        </Tooltip>
      )}

      <PlayAffordance />

      <div className="absolute inset-x-3 bottom-3">
        <RelativeDate date={item.date} className="mb-1 block text-[11px] leading-4 text-white/70" />
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
      className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm"
    >
      <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
        <path d="M15 7.27a2 2 0 0 1 0 3.46L3 17.66A2 2 0 0 1 0 15.93V2.07A2 2 0 0 1 3 .34l12 6.93Z" fill="currentColor" />
      </svg>
    </span>
  );
}

/** One-card version of the supplied three-column Spiceworks testimonial. */
function VideoCommentCard({ comment, onOpen }: { comment: VideoHighlightComment; onOpen: () => void }) {
  // `block` is load-bearing. This span is not always a flex item — when the
  // author has a username it is wrapped in a <Link>, and that Link becomes
  // the flex item instead. A default-inline span ignores width/height, so
  // the avatar rendered at the image's natural size and blew the card open.
  const avatar = (
    <span className="block size-11 shrink-0 overflow-hidden rounded-[var(--hp-r-sm)] bg-muted">
      {comment.author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={comment.author.avatar} alt={comment.author.name} width={44} height={44} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-base font-bold text-muted-foreground">
          {comment.author.name.trim()[0] ?? "؟"}
        </span>
      )}
    </span>
  );

  return (
    // Square by request. min-h-0 lets the quote block actually shrink inside
    // the fixed ratio, and line-clamp keeps a long comment from demanding
    // more height than the square allows.
    <article
      className="flex w-full flex-col overflow-hidden rounded-[var(--hp-r-md)] border border-border bg-background p-5 shadow-[var(--hp-shadow-card)] transition-shadow hover:shadow-[var(--hp-shadow-hover)]"
      style={{ aspectRatio: "2/1" }}
    >
      {/* Most of the card opens the existing modal at this real comment. */}
      <button
        type="button"
        onClick={onOpen}
        className="group min-h-0 min-w-0 flex-1 overflow-hidden text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden="true" className="text-3xl font-black leading-none text-[color:var(--video-accent)]">“</span>
        <p className="mt-1 line-clamp-4 text-[14px] leading-[24px] text-foreground">{comment.text}</p>
      </button>

      <div className="mt-auto flex shrink-0 items-center gap-3 pt-4">
        {comment.author.username ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/author/${comment.author.username}`}
                  aria-label={`بازدید از حساب کاربری ${comment.author.name}`}
                  className="block shrink-0 rounded-[var(--hp-r-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              }
            >
              {avatar}
            </TooltipTrigger>
            <TooltipContent>{`بازدید از حساب کاربری ${comment.author.name}`}</TooltipContent>
          </Tooltip>
        ) : avatar}
        <button type="button" onClick={onOpen} className="min-w-0 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="block truncate text-[15px] font-bold text-[color:var(--video-accent)]">{comment.author.name}</span>
          <RelativeDate date={comment.date} className="mt-0.5 block text-[12px] text-muted-foreground" />
        </button>
      </div>
    </article>
  );
}

export default VideoSection;
