/**
 * §6 · Timeline — TechBox original
 *
 * Absolute black in dark mode, absolute light in light mode, grid background
 * with top/bottom and left/right smooth fadeouts.
 */
import * as React from "react";
import type { TimelineCard } from "@/features/home/lib/home-types";
import { TimelineContainer } from "@/features/timeline/components/TimelineContainer";
import type { TimelineEvent } from "@/types/timeline";
import { SectionHeader } from "../primitives";

export type TimelineSectionProps = {
  events: TimelineCard[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-timeline-heading";
const MIN_EVENTS = 4;

export function TimelineSection({
  events,
  title = "گاه‌شمار فناوری اطلاعات",
  moreLabel = "ورود به گاه‌شمار کامل",
  showTitle = true,
  showMore = true,
  accentColor,
}: TimelineSectionProps) {
  if (!events || events.length < MIN_EVENTS) return null;

  const timelineEvents: TimelineEvent[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    image: e.image,
    dateGr: e.dateGr || new Date(),
    dateFa: e.dateFa || "",
    year: e.year || 1400,
    yearFa: e.yearFa || 1400,
    importance: e.importance || 5,
    tags: e.tags || [],
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    likesCount: (e as any).likesCount ?? e.likes ?? 0,
    commentsCount: (e as any).commentsCount ?? 0,
  }));

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative w-full overflow-hidden bg-white dark:bg-black py-14 lg:py-20 text-foreground"
    >
      {/* Grid texture with smoothly faded top, bottom, left, and right */}
      <div
        aria-hidden="true"
        className="hp-grid-texture pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.14]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <SectionHeader
            headingId={HEADING_ID}
            title={title}
            description="از ترانزیستور تا دیتاسنترهای هوش مصنوعی — نقاط عطفی که زیرساخت امروز را ساختند."
            href={showMore ? "/timeline" : undefined}
            linkLabel={moreLabel}
            accentColor={accentColor}
            className="mb-8"
          />
        )}
        {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

        <div className="relative p-0">
          <TimelineContainer events={timelineEvents} />
        </div>
      </div>
    </section>
  );
}

export default TimelineSection;
