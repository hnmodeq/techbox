"use client";

/**
 * §3 · خبرها و گفتگوهای داغ
 *
 * The story card and discussion panel are deliberately one interaction:
 * every row is a real approved comment from a different recent News post.
 * The card automatically cycles through their parent stories, pauses to
 * preview a hovered/focused row, and opens a full NewsModal on selection.
 *
 * Full comment threads are intentionally NOT mounted on the homepage. They
 * load only in NewsModal, where posting/replies/votes have one visible live
 * source of truth and do not compete with the initial homepage render.
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import type { LatestInsights, NewsHighlightComment } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader } from "../primitives";
import { NewsletterCard } from "./NewsletterCard";
import { NewsModal } from "@/features/news/components/NewsModal";
import { Num } from "@/components/ui/num";
import { AuthorLink } from "@/components/ui/author-link";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";
import { ShareButton } from "@/components/ui/share-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageCircle, Maximize2 } from "lucide-react";

export type InsightsSectionProps = {
  data?: LatestInsights;
  title?: string;
  accentColor?: string;
};

const HEADING_ID = "hp-insights-heading";
const CAROUSEL_MS = 5_000;

type InsightsStyle = React.CSSProperties & { "--insights-accent"?: string };

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useDocumentVisible() {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return visible;
}

export function InsightsSection({
  data,
  title = "خبرها و گفتگوهای داغ",
  accentColor,
}: InsightsSectionProps) {
  const fallbackStory = data?.story ?? null;
  const comments = data?.comments ?? [];
  const carouselStories = React.useMemo(() => {
    if (data?.stories?.length) return data.stories;
    return fallbackStory ? [fallbackStory] : [];
  }, [data?.stories, fallbackStory]);

  const storyBySlug = React.useMemo(
    () => new Map(carouselStories.map((story) => [story.slug, story])),
    [carouselStories],
  );
  const reducedMotion = useReducedMotion();
  const documentVisible = useDocumentVisible();
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [previewSlug, setPreviewSlug] = React.useState<string | null>(null);
  const [selectedComment, setSelectedComment] = React.useState<NewsHighlightComment | null>(null);

  const storyKey = carouselStories.map((story) => story.slug).join(",");
  React.useEffect(() => {
    setCarouselIndex(0);
  }, [storyKey]);

  const autoStory = carouselStories.length > 0
    ? carouselStories[carouselIndex % carouselStories.length]
    : fallbackStory;
  const previewStory = previewSlug ? storyBySlug.get(previewSlug) : undefined;
  const activeStory = previewStory ?? autoStory;

  // The rotating default is intentionally paused by any direct interaction,
  // when the modal is open, in a background tab, and for reduced-motion
  // visitors. A reader should always be in control of what they are reading.
  React.useEffect(() => {
    if (
      carouselStories.length < 2 ||
      previewSlug ||
      selectedComment ||
      reducedMotion ||
      !documentVisible
    ) return;

    const timer = window.setInterval(() => {
      setCarouselIndex((index) => (index + 1) % carouselStories.length);
    }, CAROUSEL_MS);
    return () => window.clearInterval(timer);
  }, [carouselStories.length, previewSlug, selectedComment, reducedMotion, documentVisible]);

  if (!activeStory) return null;

  const style: InsightsStyle = { "--insights-accent": accentColor || "var(--primary)" };
  const selectedStory = selectedComment ? storyBySlug.get(selectedComment.newsSlug) : null;

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="خبرهای تازه و گفتگوهای واقعی خوانندگان؛ هر دیدگاه شما را به خبر مربوط به آن می‌برد."
        accentColor={accentColor}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:gap-10">
        <div className="min-w-0">
          {/* A keyed card gives every five-second/hover switch a contained
              crossfade. The section itself never navigates. */}
          <LatestStory
            key={activeStory.slug}
            story={activeStory}
            isDiscussionPreview={carouselStories.length > 1}
          />
          <NewsActions />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <NewsDiscussion
            comments={comments}
            activeNewsSlug={activeStory.slug}
            onPreview={setPreviewSlug}
            onLeavePreview={() => setPreviewSlug(null)}
            onOpenComment={setSelectedComment}
          />
          <NewsletterCard accentColor={accentColor} />
        </div>
      </div>

      {selectedComment && selectedStory && (
        <NewsModal
          story={selectedStory}
          selectedCommentId={selectedComment.id}
          onClose={() => setSelectedComment(null)}
        />
      )}
    </SectionShell>
  );
}

/** The deliberate routes out of the homepage section. */
function NewsActions() {
  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent("tb_open_news_sidebar"));
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
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

function LatestStory({
  story,
  isDiscussionPreview,
}: {
  story: ContentItem;
  isDiscussionPreview: boolean;
}) {
  const fullScreenHref = `/${story.module}/${story.slug}`;

  return (
    <article className="animate-in fade-in-0 duration-300 overflow-hidden rounded-[var(--hp-r-md)] border border-border bg-[color:var(--hp-surface)] shadow-[var(--hp-shadow-card)] motion-reduce:animate-none">
      <div className="relative overflow-hidden bg-muted max-lg:aspect-video lg:aspect-square">
        <RemoteImage
          src={story.image}
          alt={story.title}
          sizes="(min-width: 1024px) 760px, 100vw"
          priority
        />
        {isDiscussionPreview && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-12 text-[12px] font-bold text-white">
            در حال نمایش گفتگوی این خبر
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <RelativeDate date={story.date} label="تاریخ انتشار" />
          {story.source && (
            <>
              <span aria-hidden="true">•</span>
              <span>منبع: {story.source}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 text-[26px] font-bold leading-[38px] text-foreground md:text-[30px] md:leading-[42px]">
          {story.title}
        </h3>

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

function NewsDiscussion({
  comments,
  activeNewsSlug,
  onPreview,
  onLeavePreview,
  onOpenComment,
}: {
  comments: NewsHighlightComment[];
  activeNewsSlug: string;
  onPreview: (slug: string) => void;
  onLeavePreview: () => void;
  onOpenComment: (comment: NewsHighlightComment) => void;
}) {
  return (
    <section
      className="flex h-200 min-h-0 flex-col overflow-hidden rounded-[var(--hp-r-md)] bg-sky-50 p-7 dark:bg-sky-950/30"
      onMouseLeave={onLeavePreview}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onLeavePreview();
      }}
      aria-label="گفتگوهای داغ خبرها"
    >
      <h4 className="flex shrink-0 items-center gap-2 border-b border-slate-400/80 pb-4 text-[13px] font-extrabold tracking-[0.04em] text-foreground dark:border-slate-500/70">
        <MessageCircle className="size-4 text-[color:var(--insights-accent)]" aria-hidden="true" />
        گفتگوهای داغ
        {comments.length > 0 && (
          <span className="font-semibold text-muted-foreground">
            (<Num>{comments.length}</Num> گفتگو)
          </span>
        )}
      </h4>

      {comments.length === 0 ? (
        <p className="my-auto text-center text-sm font-semibold text-muted-foreground">
          هنوز گفتگویی برای خبرهای تازه ثبت نشده است.
        </p>
      ) : (
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {comments.map((comment) => {
            const isActive = comment.newsSlug === activeNewsSlug;
            return (
              <article
                key={comment.id}
                className={`relative border-b border-[color:var(--hp-rule)] py-5 transition-colors last:border-b-0 ${
                  isActive ? "bg-[color:color-mix(in_oklch,var(--insights-accent)_10%,transparent)]" : ""
                }`}
                onMouseEnter={() => onPreview(comment.newsSlug)}
                onFocusCapture={() => onPreview(comment.newsSlug)}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-4 start-0 w-1 rounded-full bg-[color:var(--insights-accent)]"
                  />
                )}

                <button
                  type="button"
                  onClick={() => onOpenComment(comment)}
                  className="block w-full pe-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`باز کردن گفتگوی خبر: ${comment.text}`}
                >
                  <span className="line-clamp-3 block whitespace-pre-wrap text-[14px] font-bold leading-6 text-foreground">
                    {comment.text}
                  </span>
                </button>

                <div className="mt-3 flex items-center justify-between gap-3 pe-3">
                  <AuthorLink
                    name={comment.author.name}
                    username={comment.author.username ?? undefined}
                    avatar={comment.author.avatar ?? undefined}
                    verifiedType={comment.author.verifiedType}
                  />
                  <button
                    type="button"
                    onClick={() => onOpenComment(comment)}
                    className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="باز کردن گفتگوی این خبر"
                  >
                    <span aria-hidden="true">•</span>
                    <span>ارسال‌شده</span>
                    <RelativeDate
                      date={comment.date}
                      label="تاریخ دیدگاه"
                      className="text-[11px] text-muted-foreground"
                    />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default InsightsSection;
