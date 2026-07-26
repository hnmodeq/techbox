/**
 * §2 · Video Hub — Tom's Guide "Quick takes"
 *
 * TG embeds a Firework `<fw-embed-feed mode="row">`: a horizontal rail of
 * 9:16 vertical cards. We own an HLS player already, so this replicates
 * the visual only — the vendor widget is not reproduced.
 *
 * Card anatomy (measured):
 *   172px wide mobile / 200px desktop, aspect 9:16, radius 12px
 *   duration pill top-end, gradient scrim bottom, title over the scrim
 *
 * Cards link to the existing /media/[slug] route rather than opening an
 * inline player — no new player is written for the homepage.
 *
 * Server Component (ScrollRail inside is the only client part).
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §2
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { SectionShell, SectionHeader, ScrollRail } from "../primitives";
import { Num } from "@/components/ui/num";

export type VideoSectionProps = {
  videos: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
};

const HEADING_ID = "hp-video-heading";
/** Below this the rail looks sparse rather than deliberate. */
const MIN_VIDEOS = 3;

export function VideoSection({
  videos,
  title = "ویدیوهای تکباکس",
  moreLabel = "همه ویدیوها",
  showTitle = true,
  showMore = true,
}: VideoSectionProps) {
  const items = (videos ?? []).filter((v) => v.videoUrl);
  if (items.length < MIN_VIDEOS) return null;

  return (
    <SectionShell labelledBy={HEADING_ID}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="نگاه‌های کوتاه؛ در کمتر از دو دقیقه به‌روز شو."
          href={showMore ? "/media" : undefined}
          linkLabel={moreLabel}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <ScrollRail label={title} gap={12} hideArrows={items.length < 5}>
        {items.map((v) => (
          <VideoCard key={`${v.module}-${v.slug}`} item={v} />
        ))}
      </ScrollRail>
    </SectionShell>
  );
}

function VideoCard({ item }: { item: ContentItem }) {
  return (
    <Link
      href={`/${item.module}/${item.slug}`}
      className="hp-card group relative w-[172px] overflow-hidden rounded-[12px] bg-[color:var(--hp-brand-ink)] transition-transform duration-200 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none motion-reduce:transform-none md:w-[200px]"
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

      {/* Scrim so the title stays legible over any poster frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
      />

      {/* Duration pill — hidden when the DB has no duration, never faked. */}
      {item.videoDuration && (
        <span className="absolute top-2 end-2 rounded-[4px] bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          <Num tabular>{item.videoDuration}</Num>
        </span>
      )}

      {/* Play affordance appears on hover/focus. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[color:var(--hp-brand-ink)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
          <path d="M15 7.27a2 2 0 0 1 0 3.46L3 17.66A2 2 0 0 1 0 15.93V2.07A2 2 0 0 1 3 .34l12 6.93Z" fill="currentColor" />
        </svg>
      </span>

      <h3 className="absolute inset-x-3 bottom-3 line-clamp-2 text-[14px] font-bold leading-[20px] text-white">
        {item.title}
      </h3>
    </Link>
  );
}

export default VideoSection;
