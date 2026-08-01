"use client";

/**
 * §3 · آخرین خبر امروز — the day's lead news item and its discussion
 *
 * News here is SHORT-FORM: the excerpt is the whole story, not a teaser, so
 * the card shows it in full (capped at five lines by the editor's character
 * limit) and there is nothing further to read on the card.
 *
 * Nothing in this section navigates away. Comments expand in place using the
 * same mechanism as the news sidebar, and the reply box is the same
 * `CommentSection` used everywhere else. The only ways out are deliberate:
 * a full-screen view, a share link, the 24h sidebar, and the archive.
 *
 * Client Component — owns the comment disclosure.
 */
import * as React from "react";
import Link from "next/link";
import type { LatestInsights } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader } from "../primitives";
import { NewsletterCard } from "./NewsletterCard";
import { Num } from "@/components/ui/num";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";
import { ShareButton } from "@/components/ui/share-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CommentSection from "@/features/comment/components/CommentSection";
import { MessageCircle, Maximize2 } from "lucide-react";

export type InsightsSectionProps = {
  data?: LatestInsights;
  title?: string;
  accentColor?: string;
};

const HEADING_ID = "hp-insights-heading";

type InsightsStyle = React.CSSProperties & { "--insights-accent"?: string };

export function InsightsSection({
  data,
  title = "آخرین خبر امروز",
  accentColor,
}: InsightsSectionProps) {
  const story = data?.story ?? null;

  if (!story) return null;

  const style: InsightsStyle = { "--insights-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {/* No `href`: SectionHeader hides its action when one is not given. */}
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="تازه‌ترین خبر امروز، همراه با گفتگوی خوانندگان دربارهٔ آن."
        accentColor={accentColor}
      />

      {/* Two tracks: the story on the right (first in RTL), the discussion
          and newsletter stacked on the left. The story column carries its
          own actions underneath, so the eye finishes the article and then
          meets the ways out. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:gap-10">
        <div className="min-w-0">
          <LatestStory story={story} />
          <NewsActions />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <NewsDiscussion story={story} />
          <NewsletterCard accentColor={accentColor} />
        </div>
      </div>
    </SectionShell>
  );
}

/**
 * The two ways out of this section.
 *
 * The sidebar has no external trigger of its own — LayoutShell owns that
 * state — so this dispatches the event LayoutShell listens for. No network,
 * no query: the sidebar's data is already loaded by the layout.
 */
function NewsActions() {
  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent("tb_open_news_sidebar"));
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
      <button
        type="button"
        onClick={openSidebar}
        className="inline-flex min-h-11 items-center gap-2 rounded-[var(--hp-r-sm)] border border-[color:var(--insights-accent)] px-4 text-[13px] font-bold text-[color:var(--insights-accent)] transition-colors hover:bg-[color:var(--insights-accent)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        اخبار ۲۴ ساعت گذشته
      </button>

      <Link
        href="/news"
        className="inline-flex min-h-11 items-center gap-2 rounded-[var(--hp-r-sm)] border border-border px-4 text-[13px] font-bold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        بایگانی خبرهای قدیمی‌تر
      </Link>
    </div>
  );
}

function LatestStory({ story }: { story: NonNullable<LatestInsights["story"]> }) {
  const fullScreenHref = `/${story.module}/${story.slug}`;

  return (
    // The card does not navigate. `group` drives a lift on hover so it reads
    // as an object you can act on, without implying it is a link.
    <article className="group">
      {/* Square at lg and up.
          The left column carries the discussion panel stacked above the
          newsletter, which together run far taller than a 16/9 poster — so
          the story column ran out of content and left a band of empty space
          under its actions. A 1:1 image absorbs most of that height.

          Below lg the columns stack and there is nothing to match, so the
          wider 16/9 crop reads better on a phone. */}
      <div
        className="relative overflow-hidden bg-background max-lg:aspect-video lg:aspect-square"
      >
        <RemoteImage
          src={story.image}
          alt={story.title}
          sizes="(min-width: 1024px) 760px, 100vw"
          priority
          className="transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
        />
      </div>

      <div className="pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <RelativeDate date={story.date} label="تاریخ انتشار" />
          {(story.comments ?? 0) > 0 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="cursor-default font-semibold text-[color:var(--insights-accent)]" />
                }
              >
                <Num>{story.comments}</Num> دیدگاه
              </TooltipTrigger>
              <TooltipContent>تعداد دیدگاه‌های این خبر</TooltipContent>
            </Tooltip>
          )}
        </div>

        <h3 className="mt-2 text-[26px] font-bold leading-[38px] text-foreground md:text-[30px] md:leading-[42px]">
          {story.title}
        </h3>

        {/* Short-form: this IS the story, so it is shown in full. The five
            line cap is enforced by the editor's character limit rather than
            a clamp, so nothing is ever silently truncated. */}
        {story.excerpt && (
          <p className="mt-3 line-clamp-5 text-[15px] leading-[28px] text-muted-foreground">
            {story.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={fullScreenHref}
                  className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-bold text-muted-foreground transition-colors hover:text-[color:var(--insights-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              }
            >
              <Maximize2 className="size-4" aria-hidden="true" />
              نمای تمام‌صفحه
            </TooltipTrigger>
            <TooltipContent>باز کردن خبر در صفحهٔ اختصاصی</TooltipContent>
          </Tooltip>

          <ShareButton url={fullScreenHref} label="اشتراک‌گذاری" />
        </div>
      </div>
    </article>
  );
}

/**
 * Reader discussion — the live thread plus a box to add to it.
 *
 * Always open, matching the news sidebar: the comments ARE the point of
 * this column, so hiding them behind a toggle would be busywork.
 *
 * `CommentSection` owns the thread outright rather than being paired with a
 * separate server-rendered rail. An earlier version did exactly that, with
 * the rail showing the ten comments delivered with the page and
 * CommentSection mounted for its composer only. It was wrong: posting a
 * comment refetched CommentSection's own state, which was hidden, while the
 * visible rail came from an hour-cached server payload that cannot change
 * client-side. You posted, saw a success toast, and your comment appeared
 * nowhere.
 *
 * One list, one source of truth, and it updates the moment you post. It
 * also brings replies, voting, sorting and AuthorLink profile links, none
 * of which the rail had.
 */
function NewsDiscussion({
  story,
}: {
  story: NonNullable<LatestInsights["story"]>;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-[var(--hp-r-md)] border border-border bg-[color:var(--hp-surface)] p-5">
      <h4 className="mb-1 flex items-center gap-2 text-[13px] font-bold text-foreground">
        <MessageCircle className="size-4 text-[color:var(--insights-accent)]" aria-hidden="true" />
        گفتگوی خوانندگان
        {(story.comments ?? 0) > 0 && (
          <span className="font-normal text-muted-foreground">
            (<Num>{story.comments}</Num>)
          </span>
        )}
      </h4>

      {/* The composer renders above the list and stays outside the scroll
          region, so it is reachable however long the thread grows. */}
      <CommentSection
        module={story.module}
        slug={story.slug}
        initialComments={story.comments ?? 0}
        compact
        listMaxHeight="360px"
      />
    </section>
  );
}

export default InsightsSection;
