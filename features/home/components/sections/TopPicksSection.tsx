/** Review homepage: product-led review cards plus real reader comments. */
import * as React from "react";
import Link from "next/link";
import type { ReviewHomeCard, ReviewHomeComment } from "@/features/home/lib/home-types";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";
import { UserAvatar } from "@/components/ui/user-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ButtonLink } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShopCardCommerce, ShopInlinePrice } from "@/features/shop/components/ShopProductCard";
import { reviewProductLabel } from "@/features/home/lib/review-label";
import { cn } from "@/lib/utils";
import { SectionShell, SectionHeader } from "../primitives";

export type TopPicksSectionProps = {
  picks: ReviewHomeCard[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-toppicks-heading";
type TopPicksStyle = React.CSSProperties & { "--top-picks-accent"?: string };
type CommentWithReview = ReviewHomeComment & { reviewSlug: string; product: ReviewHomeCard["product"] };
type ReviewAuthorData = ReviewHomeCard["author"];

export function TopPicksSection({
  picks,
  title = "انتخاب‌های برتر ما",
  moreLabel = "همه بررسی‌ها",
  showTitle = true,
  showMore = true,
  accentColor,
}: TopPicksSectionProps) {
  if (!picks?.length) return null;
  const [latest, ...archive] = picks;
  const style: TopPicksStyle = {
    "--top-picks-accent": accentColor || "var(--module-review-color, var(--primary))",
  };
  const comments = pickDistinctComments(picks, 3);

  return (
    <SectionShell labelledBy={HEADING_ID} style={style}>
      {showTitle && (
        <SectionHeader
          headingId={HEADING_ID}
          title={title}
          description="بررسی‌های تخصصی، قیمت زنده محصول و تجربه واقعی خوانندگان در یک قاب."
          href={showMore ? "/review" : undefined}
          linkLabel={moreLabel}
          accentColor={accentColor}
        />
      )}
      {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

      <LatestReviewCard item={latest} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {archive.slice(0, 4).map((item) => (
            <CompactReviewCard key={`${item.module}-${item.slug}`} item={item} />
          ))}
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="text-base font-black text-foreground">دیدگاه خوانندگان درباره بررسی‌ها</h3>
          <div className="mt-3 grid gap-3">
            {comments.map((comment) => <ReviewCommentCard key={comment.id} comment={comment} />)}
            {comments.length === 0 && (
              <p className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">
                هنوز دیدگاهی برای بررسی‌ها ثبت نشده است.
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function LatestReviewCard({ item }: { item: ReviewHomeCard }) {
  const label = reviewProductLabel(item.product);
  return (
    <article className="grid overflow-hidden border border-border bg-card md:grid-cols-[1.2fr_.8fr]">
      <Link
        href={`/review/${item.slug}`}
        className="group relative min-h-[300px] overflow-hidden bg-white md:min-h-[460px] dark:bg-black"
      >
        <RemoteImage
          src={item.product.image || item.image}
          alt={item.product.title}
          sizes="(min-width: 1024px) 730px, 100vw"
          className="object-contain p-8 sm:p-12"
        />
      </Link>
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex min-w-0 items-baseline justify-between gap-4">
          <span className="shrink-0 whitespace-nowrap text-lg font-black leading-8 text-[color:var(--top-picks-accent)] sm:text-2xl">{label}</span>
          <h3 className="min-w-0 flex-1 truncate text-left text-xl font-bold leading-9 text-foreground sm:text-2xl" dir="ltr">
            <Link href={`/review/${item.slug}`} className="block truncate transition-colors hover:text-[color:var(--top-picks-accent)]">
              {item.product.title}
            </Link>
          </h3>
        </div>
        {item.excerpt && <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <ReviewAuthor author={item.author} />
          <RelativeDate date={item.date} className="pb-0.5 text-xs text-muted-foreground" />
        </div>
        <div className="mt-auto pt-3">
          <ReviewCardPrice product={item.product} />
          <ReviewActions item={item} />
        </div>
      </div>
    </article>
  );
}

function CompactReviewCard({ item }: { item: ReviewHomeCard }) {
  const label = reviewProductLabel(item.product);
  return (
    <article className="flex h-full flex-col border border-border bg-card">
      <Link href={`/review/${item.slug}`} className="relative aspect-[16/10] overflow-hidden bg-white dark:bg-black">
        <RemoteImage
          src={item.product.image || item.image}
          alt={item.product.title}
          sizes="(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-5"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <RelativeDate date={item.date} className="text-[11px] text-muted-foreground" />
        <div className="mt-1 flex min-w-0 items-baseline justify-between gap-2">
          <span className="shrink-0 whitespace-nowrap text-[10px] font-black leading-6 text-[color:var(--top-picks-accent)] sm:text-[11px]">{label}</span>
          <h3 className="min-w-0 flex-1 truncate text-left text-sm font-bold leading-6 text-foreground" dir="ltr">
            <Link href={`/review/${item.slug}`} className="block truncate transition-colors hover:text-[color:var(--top-picks-accent)]">
              {item.product.title}
            </Link>
          </h3>
        </div>
        {item.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.excerpt}</p>}
        <div className="mt-auto pt-2">
          <ReviewCardPrice product={item.product} />
          <ReviewActions item={item} compact />
        </div>
      </div>
    </article>
  );
}

function ReviewCardPrice({ product }: { product: ReviewHomeCard["product"] }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="cursor-default" />}>
        <ShopCardCommerce product={product} />
      </TooltipTrigger>
      <TooltipContent>قیمت این محصول در فروشگاه</TooltipContent>
    </Tooltip>
  );
}

function ReviewActions({ item, compact = false }: { item: ReviewHomeCard; compact?: boolean }) {
  return (
    <div className={cn("mt-2 grid gap-1.5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
      <ButtonLink
        href={`/review/${item.slug}`}
        size={compact ? "lg" : "xl"}
        className="bg-[color:var(--top-picks-accent)] font-bold text-white hover:bg-[color:var(--top-picks-accent)] hover:opacity-85"
      >
        مطالعه بررسی
      </ButtonLink>
      <ButtonLink
        href={`/shop/${item.product.slug}`}
        variant="ghost"
        size={compact ? "lg" : "xl"}
        className="bg-transparent font-bold text-muted-foreground hover:bg-transparent! hover:text-[color:var(--top-picks-accent)] dark:hover:bg-transparent!"
      >
        مشاهده این محصول در فروشگاه
      </ButtonLink>
    </div>
  );
}

function ReviewAuthor({ author }: { author: ReviewAuthorData }) {
  const job = author.job?.trim() || author.role?.trim() || "عضو تکباکس";
  const content = (
    <>
      <UserAvatar
        name={author.name}
        username={author.username}
        src={author.avatar}
        sizes="32px"
        className="size-8 text-[11px]"
      />
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1 text-xs font-bold text-foreground transition-colors group-hover/review-author:text-[color:var(--top-picks-accent)]">
          {author.name}
          {author.verifiedType && (
            <VerifiedBadge
              type={author.verifiedType as "content" | "org" | "user"}
              label={author.verifiedLabel}
              size={13}
            />
          )}
        </span>
        <span className="max-w-48 truncate text-[11px] leading-4 text-muted-foreground">{job}</span>
      </span>
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={author.username ? (
          <Link
            href={`/author/${author.username}`}
            className="group/review-author inline-flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <span className="group/review-author inline-flex min-w-0 cursor-default items-center gap-2" />
        )}
      >
        {content}
      </TooltipTrigger>
      <TooltipContent dir="rtl">{author.name} — {job}</TooltipContent>
    </Tooltip>
  );
}

function ReviewCommentCard({ comment }: { comment: CommentWithReview }) {
  const job = comment.author.job?.trim() || "عضو تکباکس";
  return (
    <Link href={`/review/${comment.reviewSlug}`} className="group grid min-h-32 grid-cols-[4.5rem_1fr] gap-3 p-3">
      <div className="relative aspect-square overflow-hidden bg-white dark:bg-black">
        <RemoteImage src={comment.product.image} alt={comment.product.title} sizes="72px" className="object-contain p-1" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="line-clamp-1 text-xs font-bold text-foreground transition-colors group-hover:text-[color:var(--top-picks-accent)]">
            {comment.product.title}
          </span>
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-default" />}>
              <ShopInlinePrice product={comment.product} />
            </TooltipTrigger>
            <TooltipContent>قیمت این محصول در فروشگاه</TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{comment.text}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Tooltip>
            <TooltipTrigger
              render={<span className="flex min-w-0 cursor-default items-center gap-2" />}
            >
              <UserAvatar name={comment.author.name} username={comment.author.username} src={comment.author.avatar} sizes="24px" className="size-6 text-[10px]" />
              <span className="truncate text-[11px] font-bold text-foreground">{comment.author.name}</span>
            </TooltipTrigger>
            <TooltipContent dir="rtl">{comment.author.name} — {job}</TooltipContent>
          </Tooltip>
          <RelativeDate date={comment.date} className="shrink-0 text-[10px] text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

function pickDistinctComments(picks: ReviewHomeCard[], take: number): CommentWithReview[] {
  const seenAuthors = new Set<string>();
  const seenProducts = new Set<string>();
  const output: CommentWithReview[] = [];
  for (const review of picks) {
    if (seenProducts.has(review.product.slug)) continue;
    for (const comment of review.highlightComments) {
      const authorKey = comment.author.username || comment.author.name;
      if (seenAuthors.has(authorKey)) continue;
      seenAuthors.add(authorKey);
      seenProducts.add(review.product.slug);
      output.push({ ...comment, reviewSlug: review.slug, product: review.product });
      break; // exactly one highlighted comment per reviewed product
    }
    if (output.length >= take) return output;
  }
  return output;
}

export default TopPicksSection;
