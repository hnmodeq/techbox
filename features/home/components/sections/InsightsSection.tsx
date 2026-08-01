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
import type { LatestInsights, HighlightComment } from "@/features/home/lib/home-types";
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

  // Hooks must run before the empty guard.
  const [showComments, setShowComments] = React.useState(false);

  if (!story) return null;

  const style: InsightsStyle = { "--insights-accent": accentColor || "var(--primary)" };
  const comments = data?.comments ?? [];

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {/* No `href`: SectionHeader hides its action when one is not given. */}
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="تازه‌ترین خبر امروز، همراه با گفتگوی خوانندگان دربارهٔ آن."
        accentColor={accentColor}
      />

      <NewsActions />

      {/* Three tracks at xl: story · discussion · newsletter.
          Stacking the comments under the story left the newsletter column
          almost entirely empty, so the section read as a tall column of
          whitespace. Side by side, the discussion fills that space and the
          reader can see the story and the reaction to it at once.

          At lg the newsletter drops below and story/comments stay paired;
          below lg everything stacks. */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)_minmax(300px,.7fr)]">
        {/* In RTL, the first grid column is the right-hand lead. */}
        <div className="min-w-0">
          <LatestStory story={story} />
        </div>

        <div className="min-w-0">
          <CommentDisclosure
            story={story}
            comments={comments}
            open={showComments}
            onToggle={() => setShowComments((v) => !v)}
          />
        </div>

        <aside className="min-w-0 lg:col-span-2 xl:col-span-1">
          <NewsletterCard accentColor={accentColor} />
        </aside>
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
    <div className="mb-6 flex flex-wrap items-center gap-3">
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
      <div className="relative overflow-hidden bg-background" style={{ aspectRatio: "16/9" }}>
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
 * Comment rail + reply box, expanding in place.
 *
 * Mirrors `components/layout/news-sidebar-card.tsx`: a count button toggles
 * a CSS-grid height transition, and `CommentSection` mounts only once open.
 * That laziness matters — CommentSection fetches on mount, and this sits on
 * the homepage, which has a history of connection-pool exhaustion.
 */
function CommentDisclosure({
  story,
  comments,
  open,
  onToggle,
}: {
  story: NonNullable<LatestInsights["story"]>;
  comments: HighlightComment[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <h4 className="mb-3 text-[13px] font-bold text-muted-foreground">
        گفتگوی خوانندگان
      </h4>
      {comments.length > 0 ? (
        <section
          aria-label="دیدگاه‌های خبر منتخب"
          tabIndex={0}
          className="max-h-[420px] flex-1 overflow-y-auto overscroll-contain focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ scrollbarWidth: "thin" }}
        >
          {comments.map((comment) => (
            <LatestCommentRow key={comment.id} comment={comment} />
          ))}
        </section>
      ) : (
        // The story can fall below the comment threshold, so this column
        // must say something rather than sitting empty next to the card.
        <p className="flex-1 text-[13px] leading-[22px] text-muted-foreground">
          هنوز دیدگاهی برای این خبر ثبت نشده. اولین نفر باشید.
        </p>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[color:var(--insights-accent)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {open
          ? "بستن دیدگاه‌ها"
          : comments.length > 0
            ? "همه دیدگاه‌ها و ثبت دیدگاه"
            : "ثبت دیدگاه"}
      </button>

      {/* Grid-rows transition instead of Motion: this section is in the
          homepage bundle and does not need an animation runtime. */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="max-h-[460px] overflow-y-auto overscroll-contain pt-2" style={{ scrollbarWidth: "thin" }}>
            {open && (
              <CommentSection
                module={story.module}
                slug={story.slug}
                initialComments={story.comments ?? 0}
                compact
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LatestCommentRow({ comment }: { comment: HighlightComment }) {
  const { author } = comment;
  const profileHref = author.username ? `/author/${author.username}` : null;

  const avatar = (
    <span className="block size-10 shrink-0 overflow-hidden rounded-full bg-background">
      {author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground"
        >
          {author.name.trim()[0] ?? "؟"}
        </span>
      )}
    </span>
  );

  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
      {/* Guest comments carry no username, so there is nothing to link to —
          those render as plain text rather than a dead link. */}
      {profileHref ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={profileHref}
                aria-label={`بازدید از حساب کاربری ${author.name}`}
                className="block shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            {avatar}
          </TooltipTrigger>
          <TooltipContent>{`بازدید از حساب کاربری ${author.name}`}</TooltipContent>
        </Tooltip>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 text-[14px] leading-[22px] text-foreground">{comment.text}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] leading-[18px] text-muted-foreground">
          {profileHref ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={profileHref}
                    className="font-semibold text-foreground transition-colors hover:text-[color:var(--insights-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                }
              >
                {author.name}
              </TooltipTrigger>
              <TooltipContent>{`بازدید از حساب کاربری ${author.name}`}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="font-semibold text-foreground">{author.name}</span>
          )}
          <span aria-hidden="true">•</span>
          <RelativeDate date={comment.date} label="تاریخ دیدگاه" />
        </div>
      </div>
    </div>
  );
}

export default InsightsSection;
