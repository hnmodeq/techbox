/**
 * §3 · Latest — weekly news and community response
 *
 * The full-width page wash frames one latest-news story on the right. It is
 * selected server-side from the current week by approved-comment count. The
 * left column follows the compact "Trending Right Now" rhythm from the
 * supplied reference: real comment text, author, avatar and date in clean
 * separated rows, then the existing newsletter card.
 */
import * as React from "react";
import Link from "next/link";
import type { LatestInsights, HighlightComment } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader } from "../primitives";
import { NewsletterCard } from "./NewsletterCard";
import { Num } from "@/components/ui/num";
import { RemoteImage } from "@/components/ui/remote-image";

export type InsightsSectionProps = {
  data?: LatestInsights;
  title?: string;
  accentColor?: string;
};

const HEADING_ID = "hp-insights-heading";

type InsightsStyle = React.CSSProperties & { "--insights-accent"?: string };

export function InsightsSection({
  data,
  title = "آخرین خبرها",
  accentColor,
}: InsightsSectionProps) {
  const story = data?.story ?? null;
  if (!story) return null;

  const style: InsightsStyle = { "--insights-accent": accentColor || "var(--primary)" };

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="مهم‌ترین خبر این هفته بر اساس تعداد دیدگاه‌های تأییدشدهٔ خوانندگان انتخاب می‌شود."
        href="/news"
        linkLabel="همه خبرها"
        accentColor={accentColor}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.8fr)] lg:gap-10">
        {/* In RTL, the first grid column is the right-hand lead. */}
        <LatestStory story={story} />

        <aside className="flex min-w-0 flex-col gap-6">
          {data?.comments?.length ? (
            <section aria-label="دیدگاه‌های خبر منتخب" className="border-y border-border">
              {data.comments.map((comment) => (
                <LatestCommentRow key={comment.id} comment={comment} storySlug={story.slug} />
              ))}
            </section>
          ) : null}
          <NewsletterCard />
        </aside>
      </div>
    </SectionShell>
  );
}

function LatestStory({ story }: { story: NonNullable<LatestInsights["story"]> }) {
  const href = `/${story.module}/${story.slug}`;

  return (
    <article className="group">
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative overflow-hidden bg-background" style={{ aspectRatio: "16/9" }}>
          {story.image && (            <RemoteImage
              src={story.image}
              alt={story.title}
              sizes="(min-width: 1024px) 760px, 100vw"
              className="transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
            />
          )}
        </div>
      </Link>

      <div className="pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <time dateTime={story.date}>{story.date_fa}</time>
          {(story.comments ?? 0) > 0 && (
            <span className="font-semibold text-[color:var(--insights-accent)]">
              <Num>{story.comments}</Num> دیدگاه
            </span>
          )}
        </div>
        <h3 className="mt-2 text-[26px] font-bold leading-[38px] text-foreground md:text-[30px] md:leading-[42px]">
          <Link
            href={href}
            className="decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--insights-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {story.title}
          </Link>
        </h3>
        {story.excerpt && (
          <p className="mt-3 line-clamp-3 text-[15px] leading-[28px] text-muted-foreground">
            {story.excerpt}
          </p>
        )}
      </div>
    </article>
  );
}

function LatestCommentRow({ comment, storySlug }: { comment: HighlightComment; storySlug: string }) {
  return (
    <Link
      href={`/news/${storySlug}#comment-${comment.id}`}
      className="group flex gap-3 border-b border-border py-4 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="mt-0.5 size-10 shrink-0 overflow-hidden rounded-full bg-background">
        {comment.author.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.author.avatar} alt="" width={40} height={40} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
            {comment.author.name.trim()[0] ?? "؟"}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block line-clamp-2 text-[14px] font-semibold leading-[22px] text-foreground transition-colors group-hover:text-[color:var(--insights-accent)]">
          {comment.text}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] leading-[18px] text-muted-foreground">
          <span>{comment.author.name}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={comment.date}>{comment.dateFa}</time>
        </span>
      </span>
    </Link>
  );
}

export default InsightsSection;
