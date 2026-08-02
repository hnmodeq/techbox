"use client";

/**
 * §9 · Community — a working IT knowledge base, not a generic content rail.
 *
 * The homepage balances proof and participation: one real resolved topic
 * shows the value of the forum, while a compact activity list shows where
 * members are currently talking. Every route remains a normal forum URL —
 * technical threads need deep links, long-form answers, and shareability.
 *
 * RTL: featured resolution sits on the right; active topics sit on the left.
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { SectionShell, SectionHeader } from "../primitives";
import { AuthorLink } from "@/components/ui/author-link";
import { Num } from "@/components/ui/num";
import { RelativeDate } from "@/components/ui/relative-date";
import { CheckCircle2, MessageCircle, Plus } from "lucide-react";
import { NewForumTopicModal } from "@/features/forum/components/NewForumTopicModal";
import { ForumTopicModal } from "@/features/forum/components/ForumTopicModal";

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
  const [newTopicOpen, setNewTopicOpen] = React.useState(false);
  const [replyTopic, setReplyTopic] = React.useState<WithForumActivity | null>(null);

  // getCommunityTopics() puts a random pick from the hottest seven-day
  // pool first, then appends only still-open topics for this activity list.
  // Even an empty community renders its real ask/browse affordances instead
  // of silently vanishing from the homepage.
  const list = (topics ?? []) as WithForumActivity[];
  const featured = list[0] ?? null;
  const activeTopics = list.slice(1).filter((topic) => !topic.solved).slice(0, 4);
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
          actions={<CommunityActions showBrowse={showMore} moreLabel={moreLabel} onAsk={() => setNewTopicOpen(true)} />}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-10">
        {featured ? <FeaturedTopic topic={featured} /> : <EmptyCommunityFeature onAsk={() => setNewTopicOpen(true)} />}
        <ActiveTopicList topics={activeTopics} onReply={setReplyTopic} />
      </div>

      <NewForumTopicModal open={newTopicOpen} onOpenChange={setNewTopicOpen} />
      {replyTopic && <ForumTopicModal topic={replyTopic} onClose={() => setReplyTopic(null)} />}
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
          className="inline-flex min-h-10 items-center px-2 text-[12px] font-bold text-muted-foreground transition-colors hover:text-[color:var(--community-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {moreLabel}
        </Link>
      )}
    </div>
  );
}

function FeaturedTopic({ topic }: { topic: WithForumActivity }) {
  const answer = topic.acceptedAnswer;
  const isSolved = Boolean(topic.solved && answer?.text);

  return (
    <article className="relative overflow-hidden border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] p-6 shadow-[var(--hp-shadow-card)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[color:var(--community-accent)]" aria-hidden="true" />
      <div className="flex items-center justify-end">
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--hp-border)] pt-4">
        <TopicActivity topic={topic} />
        <Link
          href={`/${topic.module}/${topic.slug}`}
          className="text-[13px] font-bold text-[color:var(--community-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          مشاهدهٔ گفتگو <span aria-hidden="true">←</span>
        </Link>
      </div>
    </article>
  );
}

function EmptyCommunityFeature({ onAsk }: { onAsk: () => void }) {
  return (
    <div className="border border-dashed border-[color:var(--hp-border)] p-6 text-center">
      <p className="text-[18px] font-bold text-[color:var(--hp-ink)]">هنوز موضوعی در انجمن ثبت نشده است</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[color:var(--hp-ink-3)]">
        اولین پرسش فنی را ثبت کنید تا گفتگوی بعدی جامعهٔ تکباکس از همین‌جا شروع شود.
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

function ActiveTopicList({
  topics,
  onReply,
}: {
  topics: WithForumActivity[];
  onReply: (topic: WithForumActivity) => void;
}) {
  return (
    <div>
      <h3 className="mb-4 text-[16px] font-bold text-[color:var(--hp-ink)]">
        برخی از سوالات پرسیده شده در انجمن
      </h3>
      {topics.length === 0 ? (
        <p className="py-5 text-[13px] leading-6 text-[color:var(--hp-ink-3)]">
          فعلاً پرسش بازی برای نمایش نیست؛ شما می‌توانید گفتگوی بعدی را شروع کنید.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--hp-border)]">
          {topics.map((topic) => (
            <li key={`${topic.module}-${topic.slug}`} className="py-4 first:pt-0 last:pb-0">
              <TopicRow topic={topic} onReply={onReply} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopicRow({ topic, onReply }: { topic: WithForumActivity; onReply: (topic: WithForumActivity) => void }) {
  return (
    <article className="group flex items-start justify-between gap-4">
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
        <button
          type="button"
          onClick={() => onReply(topic)}
          className="mt-3 text-[12px] font-bold text-[color:var(--community-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          پاسخ دادن به این پرسش
        </button>
      </div>

      {/* In RTL this compact state column sits on the physical left edge. */}
      <div className="shrink-0 pt-1">
        <TopicState solved={false} compact />
      </div>
    </article>
  );
}

function TopicActivity({ topic }: { topic: WithForumActivity }) {
  const activity = topic.lastActivity;
  const author = activity?.author ?? topic.author;
  const date = activity?.date ?? topic.date;

  return (
    <div className="min-w-0 text-[12px] text-[color:var(--hp-ink-3)]">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 ps-9 text-[11px] text-[color:var(--hp-ink-3)]">
        <span><Num>{topic.comments ?? 0}</Num> پاسخ ثبت شده</span>
        <span><Num>{topic.views ?? 0}</Num> بار بازدید شده</span>
      </div>
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
    <span className={`inline-flex items-center gap-1 text-[var(--warning)] ${compact ? "text-[11px]" : "text-[12px] font-bold"}`}>
      <MessageCircle className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />
      باز
    </span>
  );
}

export default CommunitySection;
