/**
 * §6 · Timeline — TechBox original
 *
 * Uses the full interactive TimelineContainer from /timeline page,
 * backed by the grid background with smoothly faded top and bottom.
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
      className="relative w-full overflow-hidden bg-[color:var(--hp-brand-ink)] py-14 lg:py-20 text-[color:var(--hp-on-brand)]"
    >
      {/* Grid texture with smoothly faded top and bottom */}
      <div
        aria-hidden="true"
        className="hp-grid-texture pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
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
            onDark
            accentColor={accentColor}
            className="mb-8"
          />
        )}
        {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

        <div className="relative rounded-[var(--hp-r-lg)] bg-black/20 p-2 sm:p-6 backdrop-blur-md border border-white/10">
          <TimelineContainer events={timelineEvents} />
        </div>
      </div>
    </section>
  );
}

export default TimelineSection;
