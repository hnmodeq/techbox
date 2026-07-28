/**
 * §6 · Timeline — TechBox original
 *
 * Deliberately NOT copied from Spiceworks or Tom's Guide. This is the
 * section that makes the homepage feel like TechBox rather than a clone,
 * and it is the palate cleanser between Top Picks (white cards) and the
 * commerce run that follows.
 *
 * A dark full-bleed band with a horizontal year rail. Cards alternate
 * above and below a centre line — the classic timeline zigzag.
 *
 * RTL: oldest event sits on the RIGHT, newer ones scroll leftward, which
 * matches the reading direction.
 *
 * Server Component (ScrollRail is the client part).
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §6
 */
import * as React from "react";
import type { TimelineCard } from "@/features/home/lib/home-types";
import { ScrollRail, SectionHeader } from "../primitives";
import { Num } from "@/components/ui/num";

export type TimelineSectionProps = {
  events: TimelineCard[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-timeline-heading";
/** Fewer than this and a "timeline" reads as a couple of stray cards. */
const MIN_EVENTS = 4;
/** Events at or above this importance get the accent treatment. */
const HIGHLIGHT = 9;

export function TimelineSection({
  events,
  title = "گاه‌شمار فناوری اطلاعات",
  moreLabel = "ورود به گاه‌شمار کامل",
  showTitle = true,
  showMore = true,
  accentColor,
}: TimelineSectionProps) {
  if (!events || events.length < MIN_EVENTS) return null;

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative w-full overflow-hidden bg-[color:var(--hp-brand-ink)] py-14 lg:py-20"
    >
      {/* Faint grid texture; purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
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

        <div className="relative">
          {/* The spine the year chips sit on. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/20"
          />
          <ScrollRail label={title} gap={16} railClassName="items-stretch py-2">
            {events.map((e, i) => (
              <TimelineItem key={e.id} event={e} flip={i % 2 === 1} />
            ))}
          </ScrollRail>
        </div>

      </div>
    </section>
  );
}

function TimelineItem({ event, flip }: { event: TimelineCard; flip: boolean }) {
  const highlight = event.importance >= HIGHLIGHT;

  return (
    <article className={`flex w-[260px] flex-col ${flip ? "justify-end" : "justify-start"}`}>
      {/* Zigzag: alternate cards sit below the spine. */}
      {flip && <YearMarker year={event.yearFa} highlight={highlight} />}

      <div
        className={`hp-card rounded-[var(--hp-r-md)] border bg-white/[0.06] p-4 backdrop-blur-sm transition-colors dark:bg-white/[0.04] ${
          highlight
            ? "border-white/45 shadow-[0_0_24px_oklch(1_0_0/0.12)]"
            : "border-white/[0.12] hover:border-white/25"
        }`}
      >
        {event.image && (
          <div
            className="relative mb-3 w-full overflow-hidden rounded-[var(--hp-r-sm)] bg-white/10"
            style={{ aspectRatio: "16/9" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt={event.title}
              sizes="260px"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}

        <h3 className="line-clamp-2 text-[15px] font-bold leading-[22px] text-[color:var(--hp-on-brand)]">
          {event.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-[20px] text-[color:var(--hp-on-brand-mut)]">
          {event.description}
        </p>

        <div className="mt-3 flex items-center gap-3 text-[12px] text-[color:var(--hp-on-brand-mut)]">
          <span lang="en" dir="ltr">{event.year}</span>
          {event.likes > 0 && (
            <span className="flex items-center gap-1">
              <span aria-hidden="true">♥</span>
              <Num>{event.likes}</Num>
            </span>
          )}
        </div>
      </div>

      {!flip && <YearMarker year={event.yearFa} highlight={highlight} />}
    </article>
  );
}

function YearMarker({ year, highlight }: { year: number; highlight: boolean }) {
  return (
    <div className="flex flex-col items-center py-2">
      <span aria-hidden="true" className="h-6 w-px bg-white/30" />
      <span
        className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-[12px] font-bold ${
          highlight
            ? "bg-white text-[color:var(--hp-brand-ink)]"
            : "bg-white/15 text-[color:var(--hp-on-brand)]"
        }`}
      >
        <Num>{year}</Num>
      </span>
    </div>
  );
}

export default TimelineSection;
