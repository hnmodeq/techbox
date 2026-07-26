/**
 * §9 · Community — Spiceworks "Community"
 *
 * Spiceworks renders forum rows as three tight lines with no avatar and
 * no excerpt: [Category] / [Title] / [Author][Age]. That density is the
 * signature of the section, so the rows carry deliberately less than a
 * normal card.
 *
 * Their video slot becomes our best-answer showcase: the most recent
 * SOLVED topic with its accepted answer previewed. If nothing is solved
 * yet we fall back to the most-discussed topic and drop the green strip
 * rather than pretending an answer exists.
 *
 * RTL: featured on the RIGHT, topic list on the LEFT.
 *
 * Server Component.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §9
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { SectionShell, SectionHeader, Eyebrow } from "../primitives";
import { Num } from "@/components/ui/num";

/** findPosts() in lib/home-server.ts attaches this to solved topics. */
type WithAccepted = ContentItem & {
  solved?: boolean;
  acceptedAnswer?: {
    text: string;
    author: { name: string; username?: string; avatar?: string };
  };
};

export type CommunitySectionProps = {
  topics: ContentItem[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
};

const HEADING_ID = "hp-community-heading";
const MIN_TOPICS = 3;

export function CommunitySection({
  topics,
  title = "انجمن تکباکس",
  moreLabel = "ورود به انجمن",
  showTitle = true,
  showMore = true,
}: CommunitySectionProps) {
  if (!topics || topics.length < MIN_TOPICS) return null;

  const list = topics as WithAccepted[];
  // Prefer a solved topic with a real accepted answer; otherwise the
  // most-discussed one, with the answer strip omitted.
  const featured =
    list.find((t) => t.solved && t.acceptedAnswer?.text) ??
    [...list].sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0))[0];

  const rows = list.filter((t) => t.slug !== featured.slug).slice(0, 5);

  return (
    <SectionShell labelledBy={HEADING_ID}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="به هزاران متخصص IT بپیوندید: بپرسید، پیشنهاد بدهید و تجربه‌تان را به اشتراک بگذارید."
          href={showMore ? "/forum" : undefined}
          linkLabel={moreLabel}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <FeaturedTopic topic={featured} />
        {rows.length > 0 && (
          <ul className="flex flex-col">
            {rows.map((t) => (
              <li key={`${t.module}-${t.slug}`}>
                <TopicRow topic={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

function FeaturedTopic({ topic }: { topic: WithAccepted }) {
  const answer = topic.acceptedAnswer;

  return (
    <article className="hp-card group rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] p-5">
      <div>
        {topic.category && <Eyebrow className="mb-2">{topic.category}</Eyebrow>}

        <h3 className="text-[20px] font-bold leading-[30px] text-[color:var(--hp-ink)]">
          <Link
            href={`/${topic.module}/${topic.slug}`}
            className="transition-colors hover:text-[color:var(--hp-brand)] focus-visible:outline-none"
          >
            {topic.title}
          </Link>
        </h3>

        {topic.excerpt && (
          <p className="mt-2 line-clamp-3 text-[15px] leading-[26px] text-[color:var(--hp-ink-3)]">
            {topic.excerpt}
          </p>
        )}

        {/* Only rendered when a real accepted answer exists. */}
        {answer?.text && (
          <div className="mt-4 rounded-[var(--hp-r-sm)] border-s-[3px] border-[color:var(--hp-solved)] bg-[color:var(--hp-solved)]/[0.08] p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-[color:var(--hp-solved)]">
              <span aria-hidden="true">✓</span> پاسخ برتر
            </p>
            <p className="mt-1.5 line-clamp-2 text-[14px] leading-[24px] text-[color:var(--hp-ink-2)]">
              {answer.text}
            </p>
            <p className="mt-2 text-[13px] text-[color:var(--hp-ink-3)]">
              {answer.author.name}
            </p>
          </div>
        )}

        <Link
          href="/forum"
          className="mt-4 inline-block text-[13px] font-bold text-[color:var(--hp-brand)] hover:underline"
        >
          کاوش در انجمن <span aria-hidden="true">←</span>
        </Link>
      </div>
    </article>
  );
}

/** Spiceworks row: category / title / author + age, plus end-aligned stats. */
function TopicRow({ topic }: { topic: WithAccepted }) {
  return (
    <Link
      href={`/${topic.module}/${topic.slug}`}
      className="hp-card group flex items-start justify-between gap-4 border-b border-[color:var(--hp-border)] py-3.5 ps-0 transition-[background-color,padding] duration-200 last:border-b-0 hover:bg-[color:var(--hp-bg)] hover:ps-2 focus-visible:outline-none"
    >
      <div className="min-w-0">
        {topic.category && (
          <Eyebrow className="!text-[11px] !tracking-[1px]">{topic.category}</Eyebrow>
        )}

        <h3 className="mt-0.5 flex items-start gap-1.5 text-[16px] font-bold leading-[24px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
          {topic.solved && (
            <span
              className="mt-0.5 shrink-0 text-[11px] text-[color:var(--hp-solved)]"
              title="حل شده"
            >
              <span aria-hidden="true">✓</span>
              <span className="sr-only">حل شده — </span>
            </span>
          )}
          <span className="line-clamp-2">{topic.title}</span>
        </h3>

        <p className="mt-0.5 text-[13px] leading-[20px] text-[color:var(--hp-ink-3)]">
          {topic.author?.name}
          <span aria-hidden="true" className="mx-1.5">•</span>
          {topic.date_fa}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 text-[12px] text-[color:var(--hp-ink-3)]">
        <span className="flex items-center gap-1">
          <span aria-hidden="true">💬</span>
          <Num>{topic.comments ?? 0}</Num>
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true">👁</span>
          <Num>{topic.views ?? 0}</Num>
        </span>
      </div>
    </Link>
  );
}

export default CommunitySection;
