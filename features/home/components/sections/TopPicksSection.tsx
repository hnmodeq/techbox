/** Review homepage: product-led review cards plus real reader comments. */
import * as React from "react";
import Link from "next/link";
import type { ReviewHomeCard, ReviewHomeComment } from "@/features/home/lib/home-types";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ShopCardCommerce, ShopInlinePrice } from "@/features/shop/components/ShopProductCard";
import { SectionShell, SectionHeader, Byline } from "../primitives";

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
  const style: TopPicksStyle = { "--top-picks-accent": accentColor || "var(--primary)" };
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

        <div className="border border-border p-4 sm:p-5">
          <h3 className="text-base font-black text-foreground">دیدگاه خوانندگان درباره بررسی‌ها</h3>
          <div className="mt-3 grid gap-3">
            {comments.map((comment) => <ReviewCommentCard key={comment.id} comment={comment} />)}
            {comments.length === 0 && (
              <p className="flex min-h-40 items-center justify-center border border-dashed border-border text-center text-sm text-muted-foreground">
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
  return (
    <article className="grid overflow-hidden border border-border bg-card md:grid-cols-[1.2fr_.8fr]">
      <Link href={`/review/${item.slug}`} className="group relative min-h-[300px] md:min-h-[460px]">
        <RemoteImage
          src={item.product.image || item.image}
          alt={item.product.title}
          sizes="(min-width: 1024px) 730px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
        />
      </Link>
      <div className="flex flex-col p-6 sm:p-8">
        <span className="text-5xl font-black leading-none text-[color:var(--top-picks-accent)]/15 sm:text-7xl">بررسی</span>
        <RelativeDate date={item.date} className="mt-4 text-xs text-muted-foreground" />
        <h3 className="mt-2 text-2xl font-bold leading-9 text-foreground sm:text-3xl sm:leading-10">
          <Link href={`/review/${item.slug}`} className="transition-colors hover:text-[color:var(--top-picks-accent)]">
            {item.product.title}
          </Link>
        </h3>
        {item.excerpt && <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>}
        <div className="mt-5"><Byline author={item.author} date={item.date_fa} size="sm" hideRole /></div>
        <div className="mt-auto border-t border-border pt-3">
          <ShopCardCommerce product={item.product} />
          <Link href={`/shop/${item.product.slug}`} className="mt-2 flex h-10 items-center justify-center bg-[color:var(--module-shop-color,var(--primary))] px-4 text-sm font-bold text-white">
            مشاهده این محصول در فروشگاه
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactReviewCard({ item }: { item: ReviewHomeCard }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card">
      <Link href={`/review/${item.slug}`} className="group relative aspect-[16/10] overflow-hidden bg-muted">
        <RemoteImage
          src={item.product.image || item.image}
          alt={item.product.title}
          sizes="(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
        />
        <span className="absolute inset-x-3 bottom-2 z-10 text-4xl font-black text-white/65 drop-shadow">بررسی</span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <RelativeDate date={item.date} className="text-[11px] text-muted-foreground" />
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-foreground">
          <Link href={`/review/${item.slug}`} className="transition-colors hover:text-[color:var(--top-picks-accent)]">
            {item.product.title}
          </Link>
        </h3>
        {item.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.excerpt}</p>}
        <div className="mt-auto border-t border-border pt-2">
          <ShopCardCommerce product={item.product} />
          <Link href={`/shop/${item.product.slug}`} className="mt-2 flex h-9 items-center justify-center bg-[color:var(--module-shop-color,var(--primary))] px-3 text-xs font-bold text-white">
            مشاهده این محصول در فروشگاه
          </Link>
        </div>
      </div>
    </article>
  );
}

function ReviewCommentCard({ comment }: { comment: CommentWithReview }) {
  return (
    <Link href={`/review/${comment.reviewSlug}`} className="group grid min-h-32 grid-cols-[4.5rem_1fr] gap-3 border border-border p-3 transition-colors hover:bg-muted/30">
      <div className="relative aspect-square overflow-hidden bg-white">
        <RemoteImage src={comment.product.image} alt={comment.product.title} sizes="72px" className="object-contain p-1" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="line-clamp-1 text-xs font-bold text-foreground group-hover:underline">{comment.product.title}</span>
          <ShopInlinePrice product={comment.product} />
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{comment.text}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <UserAvatar name={comment.author.name} username={comment.author.username} src={comment.author.avatar} sizes="24px" className="size-6 text-[10px]" />
            <span className="truncate text-[11px] font-bold text-foreground">{comment.author.name}</span>
          </span>
          <RelativeDate date={comment.date} className="shrink-0 text-[10px] text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

function pickDistinctComments(picks: ReviewHomeCard[], take: number): CommentWithReview[] {
  const seen = new Set<string>();
  const output: CommentWithReview[] = [];
  for (const review of picks) {
    for (const comment of review.highlightComments) {
      const authorKey = comment.author.username || comment.author.name;
      if (seen.has(authorKey)) continue;
      seen.add(authorKey);
      output.push({ ...comment, reviewSlug: review.slug, product: review.product });
      if (output.length >= take) return output;
    }
  }
  return output;
}

export default TopPicksSection;
