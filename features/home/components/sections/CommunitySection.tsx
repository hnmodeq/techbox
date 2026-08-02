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
import { SectionShell, SectionHeader, Eyebrow } from "../primitives";
import { AuthorLink } from "@/components/ui/author-link";
import { Num } from "@/components/ui/num";
import { RelativeDate } from "@/components/ui/relative-date";
import { CheckCircle2, Eye, MessageCircle, Plus } from "lucide-react";

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
const MIN_TOPICS = 3;

type CommunityStyle = React.CSSProperties & { "--community-accent"?: string };

export function CommunitySection({
  topics,
  title = "انجمن تکباکس",
  moreLabel = "ورود به انجمن",
  showTitle = true,
  showMore = true,
  accentColor,
}: CommunitySectionProps) {
  if (!topics || topics.length < MIN_TOPICS) return null;

  const list = topics as WithForumActivity[];
  // Prefer a verified resolution. A forum with no resolved topic still gets a
  // useful fallback: the currently most-discussed question, without claiming
  // that it has an accepted answer.
  const featured =
    list.find((topic) => topic.solved && topic.acceptedAnswer?.text) ??
    [...list].sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0))[0];
  const activeTopics = list.filter((topic) => topic.slug !== featured.slug).slice(0, 4);
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-10">
        <FeaturedTopic topic={featured} />
        <ActiveTopicList topics={activeTopics} />
      </div>
    </SectionShell>
  );
}

function CommunityActions({ showBrowse, moreLabel }: { showBrowse: boolean; moreLabel: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/forum?new=1"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--hp-r-sm)] bg-[color:var(--community-accent)] px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-4" aria-hidden="true" />
        طرح پرسش جدید
      </Link>
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
    <article className="relative overflow-hidden rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] p-6 shadow-[var(--hp-shadow-card)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[color:var(--community-accent)]" aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {topic.category ? <Eyebrow>{topic.category}</Eyebrow> : <span />}
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

function ActiveTopicList({ topics }: { topics: WithForumActivity[] }) {
  if (topics.length === 0) return null;

  return (
    <ul className="divide-y divide-[color:var(--hp-border)] border-y border-[color:var(--hp-border)]">
      {topics.map((topic) => (
        <li key={`${topic.module}-${topic.slug}`} className="py-4 first:pt-0 last:pb-0">
          <TopicRow topic={topic} />
        </li>
      ))}
    </ul>
  );
}

function TopicRow({ topic }: { topic: WithForumActivity }) {
  return (
    <article className="group flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {topic.category && <Eyebrow className="!text-[11px] !tracking-[1px]">{topic.category}</Eyebrow>}
          <TopicState solved={Boolean(topic.solved)} compact />
        </div>

        <h3 className="mt-1 text-[16px] font-bold leading-[25px] text-[color:var(--hp-ink)]">
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

      <div className="flex shrink-0 flex-col items-end gap-2 pt-1 text-[12px] text-[color:var(--hp-ink-3)]">
        <span className="flex items-center gap-1.5" aria-label={`${topic.comments ?? 0} پاسخ`}>
          <MessageCircle className="size-3.5" aria-hidden="true" />
          <Num>{topic.comments ?? 0}</Num>
        </span>
        <span className="flex items-center gap-1.5" aria-label={`${topic.views ?? 0} بازدید`}>
          <Eye className="size-3.5" aria-hidden="true" />
          <Num>{topic.views ?? 0}</Num>
        </span>
      </div>
    </article>
  );
}

function TopicActivity({ topic }: { topic: WithForumActivity }) {
  const activity = topic.lastActivity;
  const author = activity?.author ?? topic.author;
  const date = activity?.date ?? topic.date;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[color:var(--hp-ink-3)]">
      <AuthorLink
        name={author?.name}
        username={author?.username}
        avatar={author?.avatar}
        verifiedType={author?.verifiedType}
        className="[&>div:first-child]:size-6 [&>div:last-child>div>span]:text-[12px]"
      />
      <span aria-hidden="true">•</span>
      <RelativeDate date={date} label="آخرین فعالیت" className="text-[12px] text-[color:var(--hp-ink-3)]" />
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
    <span className={`inline-flex items-center gap-1 text-[color:var(--community-accent)] ${compact ? "text-[11px]" : "text-[12px] font-bold"}`}>
      <MessageCircle className={compact ? "size-3.5" : "size-4"} aria-hidden="true" />
      باز
    </span>
  );
}

export default CommunitySection;
