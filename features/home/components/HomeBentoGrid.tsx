"use client";

/**
 * HomeBentoGrid — new homepage layout.
 *
 * Grid: 6 columns × 35 rows, gap 7px.
 * Each row is 72px (fluid via fr units in practice).
 * All positions match the spec exactly (grid-column-start / grid-row-start).
 *
 * Sections (by div number):
 *   19  → Hero            col 1-6  row 1-2
 *   10  → Magazine title  col 1-3  row 3-5
 *   16  → Big article     col 4-6  row 3-8
 *   17  → Small articles  col 1-3  row 6-8   (3 cards)
 *   18  → Big video       col 1-2  row 9-16
 *   20  → Media title     col 3-6  row 9-12
 *   21  → Small videos    col 3-6  row 13-16 (4 cards 2×2)
 *   28  → Forum title     col 1-4  row 17-19
 *   29  → Solved topic    col 5-6  row 17-19
 *   24  → Topic           col 1-2  row 20
 *   23  → Topic           col 3-4  row 20
 *   26  → Topic           col 5-6  row 20
 *   32  → Topic           col 1-2  row 21
 *   33  → Topic           col 3-4  row 21
 *   34  → Topic           col 5-6  row 21
 *   36  → Big product     col 1-2  row 22-25
 *   35  → Shop title      col 3-6  row 22-25
 *   39  → Product         col 1    row 26-27
 *   40  → Product         col 2    row 26-27
 *   37  → Product         col 3    row 26-27
 *   38  → Product         col 4    row 26-27
 *   41  → Product         col 5    row 26-27
 *   42  → Product         col 6    row 26-27
 *   45  → Timeline        col 1-6  row 28-29
 *   43  → Footer          col 1-6  row 30-33
 *   44  → Sub-footer      col 1-6  row 34-35
 */

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useHomeModule } from "@/features/home/lib/home-data";
import { MagazineCard } from "@/components/content/MagazineCard";
import { ForumBadge } from "@/components/ui/forum-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { CardStats } from "@/components/ui/card-stats";
import { TerminalHero } from "@/components/effects/TerminalHero";
import { formatRelativeDate } from "@/lib/date-format";
import { blurProps } from "@/lib/image-placeholder";
import { ButtonLink } from "@/components/ui/button";
import HomeTimelineRow from "@/features/home/components/HomeTimelineRow";
import FooterSection from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatEntry } from "@/providers/stats.provider";

// ─── Row height (px) — each grid row ────────────────────────────────────────
const ROW_H = 72;

// ─── Shared cell style helper ────────────────────────────────────────────────
function cell(
  colStart: number,
  colSpan: number,
  rowStart: number,
  rowSpan: number
): React.CSSProperties {
  return {
    gridColumnStart: colStart,
    gridColumn: `span ${colSpan} / span ${colSpan}`,
    gridRowStart: rowStart,
    gridRow: `span ${rowSpan} / span ${rowSpan}`,
  };
}

// ─── Section title block ─────────────────────────────────────────────────────
function SectionTitle({
  fa,
  href,
  moreLabel,
}: {
  fa: string;
  href: string;
  moreLabel?: string;
}) {
  return (
    <div
      className="flex h-full flex-col justify-between p-4 sm:p-5 rounded-xl border border-border bg-card/50"
      dir="rtl"
    >
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground leading-snug">
        {fa}
      </h2>
      <ButtonLink
        href={href}
        variant="link"
        size="sm"
        className="self-start text-primary font-bold p-0 h-auto"
      >
        {moreLabel || "مشاهده همه ←"}
      </ButtonLink>
    </div>
  );
}

// ─── Small article card ───────────────────────────────────────────────────────
function SmallArticleCard({ item }: { item: any }) {
  return (
    <Link
      href={`/blog/${item.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/40"
    >
      {item.image && (
        <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="300px" />
        </div>
      )}
      <p className="relative z-10 text-xs font-bold text-foreground line-clamp-3 leading-5">
        {item.title}
      </p>
      <div className="relative z-10 mt-2 flex items-center gap-1.5">
        {item.author?.avatar && (
          <Image
            src={item.author.avatar}
            alt={item.author.name || ""}
            width={18}
            height={18}
            className="rounded-full object-cover"
          />
        )}
        <span className="text-[10px] text-muted-foreground truncate">
          {item.author?.name || "تحریریه"}
        </span>
        {item.author?.verifiedType && (
          <VerifiedBadge
            type={item.author.verifiedType as any}
            label={item.author.verifiedLabel}
            size={11}
          />
        )}
      </div>
    </Link>
  );
}

// ─── Video card (thumbnail → opens modal) ────────────────────────────────────
function VideoCard({ item, big = false, onOpen }: { item: any; big?: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex h-full w-full overflow-hidden rounded-xl border border-border bg-card cursor-pointer"
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="400px"
          {...blurProps(item.image)}
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-white/35">
          <svg className="size-5 fill-white ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Duration badge */}
      {item.videoDuration && (
        <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {item.videoDuration}
        </span>
      )}

      {/* Title */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p
          className={`text-right font-bold leading-5 text-white line-clamp-2 ${big ? "text-sm sm:text-base" : "text-xs"}`}
        >
          {item.title}
        </p>
      </div>
    </button>
  );
}

// ─── Video modal (reuses existing pattern from VideoReelsRow) ─────────────────
function VideoModal({
  video,
  onClose,
}: {
  video: any;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-9 right-0 text-sm text-white/70 hover:text-white"
        >
          ✕ بستن
        </button>
        {video.videoUrl ? (
          <video
            src={video.videoUrl}
            controls
            autoPlay
            className="w-full max-h-[80vh] rounded-xl"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">
            ویدیو در دسترس نیست
          </div>
        )}
        <p className="mt-3 text-right text-sm font-bold text-white">{video.title}</p>
      </div>
    </div>
  );
}

// ─── Small forum topic row ────────────────────────────────────────────────────
function SmallTopicRow({ item }: { item: any }) {
  return (
    <Link
      href={`/forum/${item.slug}`}
      className="group flex h-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 transition-colors hover:bg-muted/40"
      dir="rtl"
    >
      <ForumBadge slug={item.slug} fallback={(item as any).solved ?? null} className="shrink-0" />
      <p className="flex-1 text-xs font-semibold text-foreground line-clamp-1 leading-5">
        {item.title}
      </p>
      {item.author?.avatar && (
        <Image
          src={item.author.avatar}
          alt={item.author.name || ""}
          width={22}
          height={22}
          className="shrink-0 rounded-full object-cover"
        />
      )}
      {item.author?.verifiedType && (
        <VerifiedBadge
          type={item.author.verifiedType as any}
          label={item.author.verifiedLabel}
          size={11}
        />
      )}
    </Link>
  );
}

// ─── Solved topic card ────────────────────────────────────────────────────────
function SolvedTopicCard({ item }: { item: any }) {
  return (
    <Link
      href={`/forum/${item.slug}`}
      className="group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
      dir="rtl"
    >
      <div className="space-y-2">
        <ForumBadge slug={item.slug} fallback={true} />
        <p className="text-sm font-bold text-foreground line-clamp-3 leading-6">{item.title}</p>
        {item.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-5">{item.excerpt}</p>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t pt-3">
        {item.author?.avatar && (
          <Image src={item.author.avatar} alt={item.author.name || ""} width={22} height={22} className="rounded-full object-cover" />
        )}
        <span className="text-xs text-muted-foreground">{item.author?.name || "کاربر"}</span>
        {item.author?.verifiedType && (
          <VerifiedBadge type={item.author.verifiedType as any} label={item.author.verifiedLabel} size={12} />
        )}
        <span className="mr-auto text-xs text-muted-foreground">{formatRelativeDate(item.date)}</span>
      </div>
    </Link>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ item, big = false }: { item: any; big?: boolean }) {
  return (
    <Link
      href={`/shop/${item.slug}`}
      className="group relative flex h-full flex-col justify-end overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:shadow-lg"
    >
      {item.image && (
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          sizes="200px"
          {...blurProps(item.image)}
        />
      )}
      <div className="relative z-10 bg-gradient-to-t from-background/95 to-transparent p-3">
        <p className={`font-bold text-foreground line-clamp-2 leading-5 ${big ? "text-sm" : "text-[11px]"}`}>
          {item.title}
        </p>
        {item.brand && <p className="mt-0.5 text-[10px] text-muted-foreground">{item.brand}</p>}
      </div>
    </Link>
  );
}

// ─── Skeleton cell ────────────────────────────────────────────────────────────
function Skel({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-full w-full rounded-xl ${className}`} />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export interface HomeBentoGridProps {
  terminalLines?: string[];
}

export function HomeBentoGrid({ terminalLines }: HomeBentoGridProps) {
  const { items: articles, loading: blogLoading } = useHomeModule("blog");
  const { items: videos, loading: mediaLoading } = useHomeModule("media");
  const { items: forums, loading: forumLoading } = useHomeModule("forum");
  const { items: products, loading: shopLoading } = useHomeModule("shop");

  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  const bigArticle   = articles[0];
  const smallArticles = articles.slice(1, 4);       // 3 small

  const bigVideo    = videos[0];
  const smallVideos  = videos.slice(1, 5);           // 4 small

  const solvedTopic  = forums.find((f) => (f as any).solved) ?? forums[0];
  const topicRows    = forums.filter((f) => f !== solvedTopic).slice(0, 6); // 6 rows

  const bigProduct   = products[0];
  const smallProducts = products.slice(1, 7);        // 6 small

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: `repeat(35, ${ROW_H}px)`,
          gap: "7px",
          padding: "7px",
          width: "100%",
        }}
      >
        {/* ── 19: HERO ── col 1-6, row 1-2 */}
        <div style={cell(1, 6, 1, 2)}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-xl border border-border bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <TerminalHero lines={terminalLines} />
          </div>
        </div>

        {/* ── 10: Magazine title ── col 1-3, row 3-5 */}
        <div style={cell(1, 3, 3, 3)}>
          <SectionTitle fa="آخرین مقالات منتشر شده" href="/blog" moreLabel="مشاهده همه ←" />
        </div>

        {/* ── 16: Big article ── col 4-6, row 3-8 */}
        <div style={cell(4, 3, 3, 6)}>
          {blogLoading ? <Skel /> : bigArticle ? <MagazineCard item={bigArticle} /> : null}
        </div>

        {/* ── 17: 3 small articles ── col 1-3, row 6-8 — split into 3 equal cols */}
        {blogLoading
          ? [0, 1, 2].map((i) => (
              <div key={i} style={{ gridColumnStart: i + 1, gridColumn: "span 1", gridRowStart: 6, gridRow: "span 3" }}>
                <Skel />
              </div>
            ))
          : smallArticles.map((art, i) => (
              <div key={art.slug} style={{ gridColumnStart: i + 1, gridColumn: "span 1", gridRowStart: 6, gridRow: "span 3" }}>
                <SmallArticleCard item={art} />
              </div>
            ))}

        {/* ── 18: Big video ── col 1-2, row 9-16 */}
        <div style={cell(1, 2, 9, 8)}>
          {mediaLoading ? (
            <Skel />
          ) : bigVideo ? (
            <VideoCard item={bigVideo} big onOpen={() => setActiveVideo(0)} />
          ) : null}
        </div>

        {/* ── 20: Media title ── col 3-6, row 9-12 */}
        <div style={cell(3, 4, 9, 4)}>
          <SectionTitle fa="آخرین ویدیوهای کوتاه تکباکسی" href="/media" moreLabel="گشت و گزار در ویدیوها ←" />
        </div>

        {/* ── 21: 4 small videos ── col 3-6, row 13-16 — 2×2 grid */}
        {mediaLoading
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  gridColumnStart: 3 + (i % 2) * 2,
                  gridColumn: "span 2",
                  gridRowStart: 13 + Math.floor(i / 2) * 2,
                  gridRow: "span 2",
                }}
              >
                <Skel />
              </div>
            ))
          : smallVideos.map((vid, i) => (
              <div
                key={vid.slug}
                style={{
                  gridColumnStart: 3 + (i % 2) * 2,
                  gridColumn: "span 2",
                  gridRowStart: 13 + Math.floor(i / 2) * 2,
                  gridRow: "span 2",
                }}
              >
                <VideoCard item={vid} onOpen={() => setActiveVideo(i + 1)} />
              </div>
            ))}

        {/* ── 28: Forum title ── col 1-4, row 17-19 */}
        <div style={cell(1, 4, 17, 3)}>
          <SectionTitle fa="انجمن تخصصی تکباکس" href="/forum" moreLabel="ورود به انجمن ←" />
        </div>

        {/* ── 29: Solved topic ── col 5-6, row 17-19 */}
        <div style={cell(5, 2, 17, 3)}>
          {forumLoading ? <Skel /> : solvedTopic ? <SolvedTopicCard item={solvedTopic} /> : null}
        </div>

        {/* ── 24/23/26: 3 topics row 20 ── */}
        {[
          { col: 1, key: "t0" },
          { col: 3, key: "t1" },
          { col: 5, key: "t2" },
        ].map(({ col, key }, i) => (
          <div key={key} style={{ gridColumnStart: col, gridColumn: "span 2", gridRowStart: 20, gridRow: "span 1" }}>
            {forumLoading ? <Skel /> : topicRows[i] ? <SmallTopicRow item={topicRows[i]} /> : null}
          </div>
        ))}

        {/* ── 32/33/34: 3 topics row 21 ── */}
        {[
          { col: 1, key: "t3" },
          { col: 3, key: "t4" },
          { col: 5, key: "t5" },
        ].map(({ col, key }, i) => (
          <div key={key} style={{ gridColumnStart: col, gridColumn: "span 2", gridRowStart: 21, gridRow: "span 1" }}>
            {forumLoading ? <Skel /> : topicRows[3 + i] ? <SmallTopicRow item={topicRows[3 + i]} /> : null}
          </div>
        ))}

        {/* ── 36: Big product ── col 1-2, row 22-25 */}
        <div style={cell(1, 2, 22, 4)}>
          {shopLoading ? <Skel /> : bigProduct ? <ProductCard item={bigProduct} big /> : null}
        </div>

        {/* ── 35: Shop title ── col 3-6, row 22-25 */}
        <div style={cell(3, 4, 22, 4)}>
          <SectionTitle fa="آخرین محصولات سازمانی" href="/shop" moreLabel="بازدید از فروشگاه ←" />
        </div>

        {/* ── 39-42: 6 small products ── col 1-6, row 26-27 — 1 col × 2 row each */}
        {[1, 2, 3, 4, 5, 6].map((col, i) => (
          <div key={col} style={{ gridColumnStart: col, gridColumn: "span 1", gridRowStart: 26, gridRow: "span 2" }}>
            {shopLoading ? <Skel /> : smallProducts[i] ? <ProductCard item={smallProducts[i]} /> : null}
          </div>
        ))}

        {/* ── 45: Timeline ── col 1-6, row 28-29 */}
        <div style={cell(1, 6, 28, 2)} className="overflow-hidden rounded-xl border border-border">
          <HomeTimelineRow showHomeTitle showHomeMoreLabel />
        </div>

        {/* ── 43: Footer ── col 1-6, row 30-33 */}
        <div style={cell(1, 6, 30, 4)} className="overflow-hidden rounded-xl border border-border">
          <FooterSection />
        </div>

        {/* ── 44: Sub-footer / extra space ── col 1-6, row 34-35 */}
        <div style={cell(1, 6, 34, 2)} className="flex items-center justify-center rounded-xl border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">© تکباکس — هونامیک ارتباط رستاک</p>
        </div>
      </div>

      {/* Video modal */}
      {activeVideo !== null && (
        <VideoModal
          video={activeVideo === 0 ? bigVideo : smallVideos[activeVideo - 1]}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
