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
import { Tooltip, TooltipColorScope, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  title = "بحث برانگیزترین خبرها",
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
  const showsCarouselProgress =
    carouselStories.length > 1 &&
    !previewSlug &&
    !selectedComment &&
    !reducedMotion &&
    documentVisible;

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
    <TooltipColorScope color={accentColor}>
      <SectionShell labelledBy={HEADING_ID} style={style}>
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="خبرهای تازه و گفتگوهای واقعی خوانندگان؛ هر دیدگاه شما را به خبر مربوط به آن می‌برد."
          accentColor={accentColor}
        />

        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] lg:gap-10">
          {/* The card is a true 1:1 desktop panel. Its compact image/content
              split keeps the surrounding discussion column level with it. */}
          <div className="flex min-w-0 flex-col lg:aspect-square">
            <LatestStory
              key={activeStory.slug}
              story={activeStory}
              showCarouselProgress={showsCarouselProgress}
              progressKey={carouselIndex}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:h-full">
            <NewsDiscussion
              comments={comments}
              storiesBySlug={storyBySlug}
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
    </TooltipColorScope>
  );
}

/** The deliberate routes out of the homepage section, kept inside its card
 * so the two desktop columns finish at the same height. */
function NewsActions() {
  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent("tb_open_news_sidebar"));
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={openSidebar}
        className="inline-flex min-h-10 items-center gap-2 rounded-[var(--hp-r-sm)] border border-[color:var(--insights-accent)] px-3 text-[12px] font-bold text-[color:var(--insights-accent)] transition-colors hover:bg-[color:var(--insights-accent)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        اخبار ۲۴ ساعت گذشته
      </button>

      <Link
        href="/news"
        className="inline-flex min-h-10 items-center gap-2 rounded-[var(--hp-r-sm)] border border-border px-3 text-[12px] font-bold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        بایگانی خبرهای قدیمی‌تر
      </Link>
    </div>
  );
}

function LatestStory({
  story,
  showCarouselProgress,
  progressKey,
}: {
  story: ContentItem;
  showCarouselProgress: boolean;
  progressKey: number;
}) {
  const fullScreenHref = `/${story.module}/${story.slug}`;

  return (
    <article className="hp-news-card-swap relative flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--hp-r-md)] border border-[color:color-mix(in_oklch,var(--insights-accent)_35%,var(--border))] bg-[color:var(--hp-surface)] shadow-[var(--hp-shadow-card)]">
      <div className="relative shrink-0 overflow-hidden bg-muted max-lg:aspect-video lg:h-[48%]">
        <RemoteImage
          src={story.image}
          alt={story.title}
          sizes="(min-width: 1024px) 700px, 100vw"
          priority
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <RelativeDate date={story.date} label="تاریخ انتشار" />
          {story.source && (
            <>
              <span aria-hidden="true">•</span>
              <span>منبع: {story.source}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 text-[23px] font-bold leading-[34px] text-foreground sm:text-[26px] sm:leading-[38px]">
          {story.title}
        </h3>

        {story.excerpt && (
          <p className="mt-2 line-clamp-3 text-[14px] leading-[25px] text-muted-foreground">
            {story.excerpt}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={fullScreenHref}
                    className="inline-flex min-h-9 items-center gap-1.5 text-[12px] font-bold text-muted-foreground transition-colors hover:text-[color:var(--insights-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                }
              >
                <Maximize2 className="size-4" aria-hidden="true" />
                نمای تمام‌صفحه
              </TooltipTrigger>
              <TooltipContent>باز کردن خبر در صفحهٔ اختصاصی</TooltipContent>
            </Tooltip>

            <ShareButton url={fullScreenHref} label="اشتراک‌گذاری" className="min-h-9 text-[12px]" />
          </div>
          <NewsActions />
        </div>
      </div>

      {showCarouselProgress && (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-[color:color-mix(in_oklch,var(--insights-accent)_18%,transparent)]">
          <span
            key={progressKey}
            className="hp-news-carousel-progress block h-full w-full bg-[color:var(--insights-accent)]"
          />
        </div>
      )}
    </article>
  );
}

function NewsDiscussion({
  comments,
  storiesBySlug,
  activeNewsSlug,
  onPreview,
  onLeavePreview,
  onOpenComment,
}: {
  comments: NewsHighlightComment[];
  storiesBySlug: ReadonlyMap<string, ContentItem>;
  activeNewsSlug: string;
  onPreview: (slug: string) => void;
  onLeavePreview: () => void;
  onOpenComment: (comment: NewsHighlightComment) => void;
}) {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--hp-r-md)] border border-border/70 bg-transparent p-5 sm:p-6"
      onMouseLeave={onLeavePreview}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onLeavePreview();
      }}
      aria-label="گفتگوهای داغ خبرها"
    >
      <h4 className="flex shrink-0 items-center gap-2 border-b border-border pb-4 text-[13px] font-extrabold tracking-[0.04em] text-foreground">
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
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {comments.map((comment) => {
            const isActive = comment.newsSlug === activeNewsSlug;
            const parentStory = storiesBySlug.get(comment.newsSlug);
            return (
              <article
                key={comment.id}
                className={`relative my-1 rounded-[var(--hp-r-sm)] border-b border-[color:var(--hp-rule)] px-3 py-4 transition-[background-color,box-shadow] last:border-b-0 ${
                  isActive
                    ? "bg-[color:color-mix(in_oklch,var(--insights-accent)_16%,transparent)] ring-1 ring-[color:color-mix(in_oklch,var(--insights-accent)_35%,transparent)]"
                    : ""
                }`}
                onMouseEnter={() => onPreview(comment.newsSlug)}
                onFocusCapture={() => onPreview(comment.newsSlug)}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-4 start-2 w-1 rounded-full bg-[color:var(--insights-accent)]"
                  />
                )}

                <button
                  type="button"
                  onClick={() => onOpenComment(comment)}
                  className="block w-full ps-5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`باز کردن گفتگوی خبر: ${comment.text}`}
                >
                  <span className="line-clamp-2 block whitespace-pre-wrap text-[15px] font-bold leading-6 text-foreground">
                    {comment.text}
                  </span>
                  {parentStory && (
                    <span className={`mt-1 line-clamp-1 block text-[11px] font-semibold ${
                      isActive ? "text-[color:var(--insights-accent)]" : "text-muted-foreground"
                    }`}>
                      دربارهٔ: {parentStory.title}
                    </span>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-between gap-3 ps-5">
                  <AuthorLink
                    name={comment.author.name}
                    username={comment.author.username ?? undefined}
                    avatar={comment.author.avatar ?? undefined}
                    verifiedType={comment.author.verifiedType}
                  />
                  <button
                    type="button"
                    onClick={() => onOpenComment(comment)}
                    className="flex shrink-0 items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="باز کردن گفتگوی این خبر"
                  >
                    <span aria-hidden="true">•</span>
                    <span>ارسال‌شده</span>
                    <RelativeDate
                      date={comment.date}
                      label="تاریخ دیدگاه"
                      className="text-[12px] text-muted-foreground"
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
