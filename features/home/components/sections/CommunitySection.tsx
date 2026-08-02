"use client";

/**
 * §9 · Community — a working IT knowledge base, not a generic content rail.
 *
 * The homepage balances proof and participation: one real resolved topic
 * shows the value of the forum, while a compact activity list shows where
 * members are currently talking. Every route remains a normal forum URL —
 * technical threads need deep links, long-form answers, and shareability.
 *
 * RTL: active topics sit on the right; featured resolution and direct composer
 * sit on the left.
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { SectionShell, SectionHeader } from "../primitives";
import { AuthorLink } from "@/components/ui/author-link";
import { Num } from "@/components/ui/num";
import { RelativeDate } from "@/components/ui/relative-date";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";
import { ForumQuestionPanel } from "@/features/forum/components/ForumQuestionPanel";

/** findPosts() in lib/home-server.ts attaches these forum-only fields. */
type WithForumActivity = ContentItem & {
  solved?: boolean;
  acceptedAnswer?: {
    text: string;
    author: { name: string; username?: string; avatar?: string };
  };
  lastActivity?: {
    date: string;
    author: { name: string; username?: string; avatar?: string; verifiedType?: string | null };
  };
};

export type CommunitySectionProps = {
  topics: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-community-heading";
type CommunityStyle = React.CSSProperties & { "--community-accent"?: string };

export function CommunitySection({
  topics,
  title = "انجمن تکباکس",
  moreLabel = "ورود به انجمن",
  showTitle = true,
  showMore = true,
  accentColor,
}: CommunitySectionProps) {
  // getCommunityTopics() puts a random pick from the hottest seven-day
  // pool first, then appends a four-topic activity snapshot. The rail
  // prioritises unanswered work but can also show genuinely solved threads
  // when that is what keeps the homepage useful and full.
  // Even an empty community renders its real ask/browse affordances instead
  // of silently vanishing from the homepage.
  const list = (topics ?? []) as WithForumActivity[];
  const featured = list[0] ?? null;
  const activeTopics = list.slice(1, 5);
  const style: CommunityStyle = { "--community-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="پرسش‌های فنی، تجربه‌های اجرایی و پاسخ‌های قابل اتکای جامعهٔ زیرساخت و فناوری اطلاعات."
          href={showMore ? "/forum" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
          actions={<CommunityActions showBrowse={showMore} moreLabel={moreLabel} />}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      {/* In RTL, the first grid child lands on the physical right. The open
          questions therefore lead on the right and the featured topic plus
          direct question composer form the left participation column. */}
      <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(360px,.95fr)_minmax(0,1.05fr)] lg:gap-10">
        <div className="flex min-w-0 flex-col lg:h-full">
          <ActiveTopicList topics={activeTopics} />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:h-full">
          {featured ? <FeaturedTopic topic={featured} /> : <EmptyCommunityFeature />}
          <ForumQuestionPanel />
        </div>
      </div>
    </SectionShell>
  );
}

function CommunityActions({
  showBrowse,
  moreLabel,
}: {
  showBrowse: boolean;
  moreLabel: string;
}) {
  if (!showBrowse) return null;

  return (
    <Link
      href="/forum"
      className="inline-flex min-h-10 items-center px-2 text-[12px] font-bold text-muted-foreground transition-colors hover:text-[color:var(--community-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {moreLabel}
    </Link>
  );
}

function FeaturedTopic({ topic }: { topic: WithForumActivity }) {
  const answer = topic.acceptedAnswer;
  const isSolved = Boolean(topic.solved && answer?.text);

  return (
    <article className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[color:var(--hp-surface)] p-6">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[color:var(--community-accent)]" aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TopicActivity topic={topic} />
        <TopicState solved={isSolved} />
      </div>

      <h3 className="mt-3 text-[22px] font-bold leading-[34px] text-[color:var(--hp-ink)]">
        <Link
          href={`/${topic.module}/${topic.slug}`}
          className="transition-colors hover:text-[color:var(--community-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {topic.title}
        </Link>
      </h3>

      {topic.excerpt && (
        <p className="mt-3 line-clamp-3 text-[15px] leading-[27px] text-[color:var(--hp-ink-3)]">
          {topic.excerpt}
        </p>
      )}

      {answer?.text ? (
        <div className="mt-5 rounded-[var(--hp-r-sm)] border-s-[3px] border-[color:var(--hp-solved)] bg-[color:var(--hp-solved)]/[0.08] p-4">
          <p className="flex items-center gap-1.5 text-[12px] font-bold text-[color:var(--hp-solved)]">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            پاسخ برتر
          </p>
          <p className="mt-2 line-clamp-3 text-[14px] leading-[24px] text-[color:var(--hp-ink-2)]">
            {answer.text}
          </p>
          <div className="mt-3">
            <AuthorLink
              name={answer.author.name}
              username={answer.author.username}
              avatar={answer.author.avatar}
              className="[&>div:last-child>div>span]:text-[12px]"
            />
          </div>
        </div>
      ) : (
        <p className="mt-5 text-[13px] leading-6 text-[color:var(--hp-ink-3)]">
          هنوز پاسخ برتری برای این موضوع ثبت نشده است؛ تجربهٔ شما می‌تواند راه‌حل بعدی باشد.
        </p>
      )}

    </article>
  );
}

function EmptyCommunityFeature() {
  return (
    <div className="border border-dashed border-[color:var(--hp-border)] p-6 text-center">
      <p className="text-[18px] font-bold text-[color:var(--hp-ink)]">هنوز موضوعی در انجمن ثبت نشده است</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[color:var(--hp-ink-3)]">
        اولین پرسش فنی را ثبت کنید تا گفتگوی بعدی جامعهٔ تکباکس از همین‌جا شروع شود.
      </p>
      <a
        href="#hp-forum-question"
        className="mt-5 inline-block text-[13px] font-bold text-[color:var(--community-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        طرح پرسش جدید
      </a>
    </div>
  );
}

function ActiveTopicList({
  topics,
}: {
  topics: WithForumActivity[];
}) {
  return (
    <div className="flex h-full flex-col">
      {topics.length === 0 ? (
        <p className="py-5 text-[13px] leading-6 text-[color:var(--hp-ink-3)]">
          فعلاً پرسش بازی برای نمایش نیست؛ شما می‌توانید گفتگوی بعدی را شروع کنید.
        </p>
      ) : (
        <ul
          className="grid flex-1 divide-y divide-[color:var(--hp-border)]"
          style={{ gridTemplateRows: `repeat(${topics.length}, minmax(0, 1fr))` }}
        >
          {topics.map((topic) => (
            <li key={`${topic.module}-${topic.slug}`} className="flex min-h-0 py-4 first:pt-0 last:pb-0">
              <TopicRow topic={topic} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopicRow({ topic }: { topic: WithForumActivity }) {
  return (
    <article className="group flex h-full w-full items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-[16px] font-bold leading-[25px] text-[color:var(--hp-ink)]">
          <Link
            href={`/${topic.module}/${topic.slug}`}
            className="line-clamp-2 transition-colors group-hover:text-[color:var(--community-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {topic.title}
          </Link>
        </h3>

        <div className="mt-3">
          <TopicActivity topic={topic} />
        </div>
      </div>

      {/* In RTL this compact control column sits on the physical left edge. */}
      <div className="w-52 shrink-0 pt-1 text-left">
        <TopicState solved={Boolean(topic.solved)} compact />
      </div>
    </article>
  );
}

function TopicActivity({ topic }: { topic: WithForumActivity }) {
  const activity = topic.lastActivity;
  const author = activity?.author ?? topic.author;
  const date = activity?.date ?? topic.date;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[color:var(--hp-ink-3)]">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <AuthorLink
          name={author?.name}
          username={author?.username}
          avatar={author?.avatar}
          verifiedType={author?.verifiedType}
          className="[&>div:first-child]:size-7 [&>div:last-child>div>span]:text-[12px]"
        />
        <span aria-hidden="true">•</span>
        <RelativeDate date={date} label="آخرین فعالیت" className="text-[12px] text-[color:var(--hp-ink-3)]" />
      </div>
      <TopicCounters topic={topic} />
    </div>
  );
}

function TopicCounters({ topic }: { topic: WithForumActivity }) {
  return (
    <div className="ms-auto flex shrink-0 items-center whitespace-nowrap text-[11px] font-bold text-[color:var(--community-accent)]">
      <Tooltip>
        <TooltipTrigger render={<span className="cursor-default" />}>
          <Num>{topic.comments ?? 0}</Num> پاسخ ثبت شده
        </TooltipTrigger>
        <TooltipContent>تعداد پاسخ‌های ثبت‌شده برای این مسئله</TooltipContent>
      </Tooltip>
    </div>
  );
}

function TopicState({ solved, compact = false }: { solved: boolean; compact?: boolean }) {
  if (solved) {
    return (
      <span className={`inline-flex items-center gap-1 text-[color:var(--hp-solved)] ${compact ? "text-[11px]" : "text-[12px] font-bold"}`}>
        <CheckCircle2 className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />
        حل‌شده
      </span>
    );
  }

  return (
    <span className={`block whitespace-nowrap text-[var(--warning)] ${compact ? "text-[11px] leading-5" : "text-[12px] font-bold"}`}>
      هنوز کسی این مسئله را حل نکرده
    </span>
  );
}

export default CommunitySection;
