"use client";

/**
 * §9 · Community — a working IT knowledge base, not a generic content rail.
 *
 * RTL: unresolved active topics sit on the right; one solved featured
 * resolution occupies the left. Question submission is opened from the header.
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { SectionShell, SectionHeader } from "../primitives";
import { AuthorLink } from "@/components/ui/author-link";
import { Num } from "@/components/ui/num";
import { RelativeDate } from "@/components/ui/relative-date";
import { CheckCircle2, Plus } from "lucide-react";
import { NewForumTopicModal } from "@/features/forum/components/NewForumTopicModal";

type WithForumActivity = ContentItem & {
  solved?: boolean;
  acceptedAnswer?: {
    text: string;
    date?: string;
    author: { name: string; username?: string; avatar?: string; job?: string };
  };
  followUpReplies?: Array<{
    id: string;
    text: string;
    date: string;
    author: { name: string; username?: string; avatar?: string; job?: string; verifiedType?: string | null };
  }>;
  lastActivity?: {
    date: string;
    author: { name: string; username?: string; avatar?: string; job?: string; verifiedType?: string | null };
  };
};

export type CommunitySectionProps = {
  featuredTopic?: ContentItem | null;
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
  featuredTopic,
  topics,
  title = "انجمن تکباکس",
  moreLabel = "ورود به انجمن",
  showTitle = true,
  showMore = true,
  accentColor,
}: CommunitySectionProps) {
  const [questionOpen, setQuestionOpen] = React.useState(false);
  const featured = (featuredTopic ?? null) as WithForumActivity | null;
  const activeTopics = ((topics ?? []) as WithForumActivity[]).slice(0, 4);
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
          actions={<CommunityActions showBrowse={showMore} moreLabel={moreLabel} onAsk={() => setQuestionOpen(true)} />}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(360px,.95fr)_minmax(0,1.05fr)] lg:gap-10">
        <div className="flex min-w-0 flex-col lg:h-full">
          <ActiveTopicList topics={activeTopics} />
        </div>
        <div className="flex min-w-0 flex-col lg:h-full">
          {featured ? <FeaturedTopic topic={featured} /> : <EmptyCommunityFeature onAsk={() => setQuestionOpen(true)} />}
        </div>
      </div>

      <NewForumTopicModal open={questionOpen} onOpenChange={setQuestionOpen} />
    </SectionShell>
  );
}

function CommunityActions({
  showBrowse,
  moreLabel,
  onAsk,
}: {
  showBrowse: boolean;
  moreLabel: string;
  onAsk: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onAsk}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--hp-r-sm)] bg-[color:var(--community-accent)] px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-4" aria-hidden="true" />
        طرح پرسش جدید
      </button>
      {showBrowse && (
        <Link
          href="/forum"
          className="inline-flex min-h-10 items-center px-2 text-[12px] font-bold text-[color:var(--community-accent)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {moreLabel}
        </Link>
      )}
    </div>
  );
}

function FeaturedTopic({ topic }: { topic: WithForumActivity }) {
  const answer = topic.acceptedAnswer;
  const followUpReplies = topic.followUpReplies ?? [];

  return (
    <article className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent p-0">
      {/* Green belongs to the solved QUESTION only; answers remain on the
          section's normal surface so the two content types stay distinct. */}
      <div className="bg-emerald-50 p-6 dark:bg-emerald-950/25">
      <h3 className="text-[22px] font-bold leading-[34px] text-[color:var(--community-accent)]">
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

      {/* Moved from above to below the question */}
      <div className="mt-4">
        <TopicActivity topic={topic} />
      </div>
      </div>

      {answer?.text ? (
        <div className="relative mx-6 mt-5 p-4 ps-6">
          <span
            aria-hidden="true"
            className="absolute inset-y-4 start-2 w-1 rounded-full bg-[color:var(--hp-solved)]"
          />
          <p className="flex items-center gap-1.5 text-[12px] font-bold text-[color:var(--hp-solved)]">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            پاسخ برتر
          </p>
          <p className="mt-2 line-clamp-4 text-[14px] leading-[24px] text-[color:var(--hp-ink-2)]">
            {answer.text}
          </p>
          {/* Best answer publish date on same row with user avatar row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <AuthorLink
              name={answer.author.name}
              username={answer.author.username}
              avatar={answer.author.avatar}
              job={answer.author.job}
              className="[&>div:last-child>div>span]:text-[12px]"
            />
            {answer.date && <RelativeDate date={answer.date} className="-me-2 text-[11px] text-[color:var(--hp-ink-3)]" />}
          </div>
        </div>
      ) : (
        <p className="mx-6 mt-5 text-[13px] leading-6 text-[color:var(--hp-ink-3)]">
          هنوز پاسخ برتری برای این موضوع ثبت نشده است؛ تجربهٔ شما می‌تواند راه‌حل بعدی باشد.
        </p>
      )}

      {followUpReplies.length > 0 && (
        <section className="mx-6 mb-6 mt-auto border-t border-[color:var(--hp-rule)] pt-4 ps-6" aria-label="ادامهٔ گفتگو">
          <div className="divide-y divide-[color:var(--hp-rule)]">
            {followUpReplies.map((reply, index) => (
              <article key={reply.id} className={`py-3 ${index === 0 ? "pt-0" : ""}`}>
                <p className="line-clamp-2 text-[13px] leading-6 text-[color:var(--hp-ink-2)]">
                  {reply.text}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <AuthorLink
                    name={reply.author.name}
                    username={reply.author.username}
                    avatar={reply.author.avatar}
                    job={reply.author.job}
                    verifiedType={reply.author.verifiedType}
                    className="[&>div:first-child]:size-6 [&>div:last-child>div>span]:text-[11px]"
                  />
                  <RelativeDate date={reply.date} className="text-[11px] text-[color:var(--hp-ink-3)]" />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function EmptyCommunityFeature({ onAsk }: { onAsk: () => void }) {
  return (
    <div className="border border-dashed border-[color:var(--hp-border)] p-6 text-center">
      <p className="text-[18px] font-bold text-[color:var(--hp-ink)]">هنوز موضوع حل‌شده‌ای برای نمایش نیست</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[color:var(--hp-ink-3)]">
        با ثبت پرسش و پاسخ‌های دقیق، اولین راه‌حل قابل‌اتکای انجمن از همین‌جا شکل می‌گیرد.
      </p>
      <button
        type="button"
        onClick={onAsk}
        className="mt-5 text-[13px] font-bold text-[color:var(--community-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        طرح پرسش جدید
      </button>
    </div>
  );
}

function ActiveTopicList({ topics }: { topics: WithForumActivity[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
            <li key={`${topic.module}-${topic.slug}`} className="flex min-h-0 py-4 first:pt-0 last:pb-0 items-end">
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
    <article className="group flex h-full w-full items-end justify-between gap-4">
      <div className="min-w-0 w-full flex flex-col justify-end">
        <h3 className="text-[16px] font-bold leading-[25px] text-[color:var(--hp-ink)]">
          <Link
            href={`/${topic.module}/${topic.slug}`}
            className="line-clamp-2 transition-colors group-hover:text-[color:var(--community-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {topic.title}
          </Link>
        </h3>

        {topic.excerpt && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-[color:var(--hp-ink-3)]">
            {topic.excerpt}
          </p>
        )}

        <div className="mt-3">
          <TopicActivity topic={topic} />
        </div>
      </div>
    </article>
  );
}

function TopicActivity({
  topic,
  showSummary = true,
}: {
  topic: WithForumActivity;
  showSummary?: boolean;
}) {
  const activity = topic.lastActivity;
  const author = activity?.author ?? topic.author;
  const date = activity?.date ?? topic.date;

  return (
    <div className="flex min-w-0 w-full flex-wrap items-end gap-x-3 gap-y-1 text-[12px] text-[color:var(--hp-ink-3)] lg:flex-nowrap">
      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
        <AuthorLink
          name={author?.name}
          username={author?.username}
          avatar={author?.avatar}
          job={author?.job}
          verifiedType={author?.verifiedType}
          className="[&>div:first-child]:size-7 [&>div:last-child>div>span]:text-[12px]"
        />
        <RelativeDate date={date} className="text-[12px] text-[color:var(--hp-ink-3)]" />
      </div>
      {showSummary && <TopicSummary topic={topic} />}
    </div>
  );
}

function TopicSummary({ topic }: { topic: WithForumActivity }) {
  const solved = Boolean(topic.solved);
  const stateClass = solved ? "text-[color:var(--hp-solved)]" : "text-[var(--warning)]";

  return (
    <span className={`ms-auto block shrink-0 whitespace-nowrap text-[11px] leading-5 ${stateClass}`}>
      <Num>{topic.comments ?? 0}</Num> پاسخ ثبت شده {solved ? "و این مسئله حل شده است" : "اما هنوز کسی این مسئله را حل نکرده است"}
    </span>
  );
}

export default CommunitySection;
