"use client";

import React, { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

// ─── Helpers ────────────────────────────────────────────────────────────────

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
    <div className="flex h-full flex-col justify-between p-5 sm:p-6" dir="rtl">
      <h2 className="text-2xl sm:text-3xl font-black text-foreground leading-snug">{fa}</h2>
      <ButtonLink href={href} variant="link" size="sm" className="self-start text-primary font-bold p-0 h-auto">
        {moreLabel || "مشاهده همه ←"}
      </ButtonLink>
    </div>
  );
}

function SmallArticleCard({ item }: { item: any }) {
  return (
    <Link
      href={`/blog/${item.slug}`}
      className="group flex h-full flex-col justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors overflow-hidden relative"
    >
      {item.image && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity">
          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="200px" />
        </div>
      )}
      <div className="relative z-10">
        <p className="text-xs font-bold text-foreground line-clamp-3 leading-5">{item.title}</p>
      </div>
      <div className="relative z-10 mt-2 flex items-center gap-1.5">
        {item.author?.avatar && (
          <Image src={item.author.avatar} alt={item.author.name || ""} width={20} height={20} className="rounded-full object-cover" />
        )}
        <span className="text-[10px] text-muted-foreground truncate">{item.author?.name || "تحریریه"}</span>
        {item.author?.verifiedType && (
          <VerifiedBadge type={item.author.verifiedType as any} label={item.author.verifiedLabel} size={11} />
        )}
      </div>
    </Link>
  );
}

function VideoCard({ item, big = false }: { item: any; big?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative w-full h-full rounded-xl overflow-hidden border border-border bg-card cursor-pointer`}
      >
        {item.image && (
          <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="400px" {...blurProps(item.image)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-12 sm:size-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <svg className="size-6 text-white fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
        {/* Duration */}
        {item.videoDuration && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {item.videoDuration}
          </span>
        )}
        {/* Title */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <p className={`font-bold text-white line-clamp-2 text-right leading-5 ${big ? "text-sm sm:text-base" : "text-xs"}`}>
            {item.title}
          </p>
        </div>
      </button>

      {/* Video modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm"
            >
              ✕ بستن
            </button>
            {item.videoUrl ? (
              <video
                src={item.videoUrl}
                controls
                autoPlay
                className="w-full rounded-xl max-h-[80vh]"
              />
            ) : (
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                ویدیو در دسترس نیست
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SmallForumTopic({ item }: { item: any }) {
  return (
    <Link
      href={`/forum/${item.slug}`}
      className="group flex items-center gap-3 h-full px-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
      dir="rtl"
    >
      <ForumBadge slug={item.slug} fallback={item.solved ?? null} className="shrink-0" />
      <p className="text-xs font-semibold text-foreground line-clamp-2 flex-1 leading-5">{item.title}</p>
      <div className="shrink-0 flex items-center gap-1">
        {item.author?.avatar && (
          <Image src={item.author.avatar} alt={item.author.name || ""} width={22} height={22} className="rounded-full object-cover" />
        )}
        {item.author?.verifiedType && (
          <VerifiedBadge type={item.author.verifiedType as any} label={item.author.verifiedLabel} size={11} />
        )}
      </div>
    </Link>
  );
}

function SolvedTopicCard({ item }: { item: any }) {
  return (
    <Link
      href={`/forum/${item.slug}`}
      className="group flex flex-col justify-between h-full p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
      dir="rtl"
    >
      <div className="space-y-2">
        <ForumBadge slug={item.slug} fallback={true} />
        <p className="text-sm font-bold text-foreground line-clamp-3 leading-6">{item.title}</p>
        {item.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-5">{item.excerpt}</p>
        )}
      </div>
      <div className="mt-3 pt-3 border-t flex items-center gap-2">
        {item.author?.avatar && (
          <Image src={item.author.avatar} alt={item.author.name || ""} width={24} height={24} className="rounded-full object-cover" />
        )}
        <span className="text-xs text-muted-foreground">{item.author?.name || "کاربر"}</span>
        {item.author?.verifiedType && (
          <VerifiedBadge type={item.author.verifiedType as any} label={item.author.verifiedLabel} size={12} />
        )}
        <span className="text-xs text-muted-foreground mr-auto">{formatRelativeDate(item.date)}</span>
      </div>
    </Link>
  );
}

function ProductCard({ item, big = false }: { item: any; big?: boolean }) {
  return (
    <Link
      href={`/shop/${item.slug}`}
      className={`group relative flex flex-col justify-end h-full rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300`}
    >
      {item.image && (
        <div className="absolute inset-0 bg-white">
          <Image src={item.image} alt={item.title} fill className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" sizes="300px" {...blurProps(item.image)} />
        </div>
      )}
      <div className="relative z-10 p-3 bg-gradient-to-t from-background/95 to-transparent">
        <p className={`font-bold text-foreground line-clamp-2 leading-5 ${big ? "text-sm" : "text-[11px]"}`}>{item.title}</p>
        {item.brand && <p className="text-[10px] text-muted-foreground mt-0.5">{item.brand}</p>}
      </div>
    </Link>
  );
}

// ─── Section loading skeleton ────────────────────────────────────────────────

function BentoSkeleton({ className }: { className?: string }) {
  return <Skeleton className={`rounded-xl ${className}`} />;
}

// ─── Main grid ───────────────────────────────────────────────────────────────

interface HomeBentoGridProps {
  terminalLines?: string[];
}

export function HomeBentoGrid({ terminalLines }: HomeBentoGridProps) {
  const { items: articles, loading: blogLoading } = useHomeModule("blog");
  const { items: videos, loading: mediaLoading } = useHomeModule("media");
  const { items: forums, loading: forumLoading } = useHomeModule("forum");
  const { items: products, loading: shopLoading } = useHomeModule("shop");

  const bigArticle = articles[0];
  const smallArticles = articles.slice(1, 4);
  const bigVideo = videos[0];
  const smallVideos = videos.slice(1, 5);
  const solvedTopic = forums.find((f) => (f as any).solved) || forums[0];
  const smallTopics = forums.filter((f) => f !== solvedTopic).slice(0, 6);
  const bigProduct = products[0];
  const smallProducts = products.slice(1, 7);

  return (
    <div
      className="w-full px-3 sm:px-4 lg:px-6 py-4 space-y-3"
      dir="rtl"
    >
      {/* ── HERO ── */}
      <div className="w-full min-h-[60vh] rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center gap-6 p-6 sm:p-10">
        <TerminalHero lines={terminalLines} />
        <p className="text-center text-muted-foreground text-sm max-w-md" dir="rtl">
          پلتفرم جامع محتوای فناوری اطلاعات — مقاله، ویدیو، انجمن، فروشگاه و بیشتر
        </p>
      </div>

      {/* ── MAGAZINE ── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "120px" }}
      >
        {/* Magazine title — 3 cols × 3 rows */}
        <div style={{ gridColumn: "span 3", gridRow: "span 3" }}>
          <SectionTitle fa="آخرین مقالات منتشر شده" href="/blog" moreLabel="مشاهده همه مقالات ←" />
        </div>

        {/* Big featured article — 3 cols × 6 rows (spans both sub-rows) */}
        <div style={{ gridColumn: "span 3", gridRow: "span 6" }}>
          {blogLoading ? (
            <BentoSkeleton className="h-full" />
          ) : bigArticle ? (
            <MagazineCard item={bigArticle} />
          ) : null}
        </div>

        {/* 3 small articles — 1 col × 3 rows each */}
        {blogLoading
          ? [0, 1, 2].map((i) => (
              <div key={i} style={{ gridColumn: "span 1", gridRow: "span 3" }}>
                <BentoSkeleton className="h-full" />
              </div>
            ))
          : smallArticles.map((art) => (
              <div key={art.slug} style={{ gridColumn: "span 1", gridRow: "span 3" }}>
                <SmallArticleCard item={art} />
              </div>
            ))}
      </div>

      {/* ── MEDIA ── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "120px" }}
      >
        {/* Big video — 2 cols × 8 rows */}
        <div style={{ gridColumn: "span 2", gridRow: "span 8" }}>
          {mediaLoading ? (
            <BentoSkeleton className="h-full" />
          ) : bigVideo ? (
            <VideoCard item={bigVideo} big />
          ) : null}
        </div>

        {/* Media title — 4 cols × 4 rows */}
        <div style={{ gridColumn: "span 4", gridRow: "span 4" }}>
          <SectionTitle fa="آخرین ویدیوهای کوتاه تکباکسی" href="/media" moreLabel="گشت و گزار در ویدیوها ←" />
        </div>

        {/* 4 small videos — 1 col × 4 rows each */}
        {mediaLoading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} style={{ gridColumn: "span 1", gridRow: "span 4" }}>
                <BentoSkeleton className="h-full" />
              </div>
            ))
          : smallVideos.map((vid) => (
              <div key={vid.slug} style={{ gridColumn: "span 1", gridRow: "span 4" }}>
                <VideoCard item={vid} />
              </div>
            ))}
      </div>

      {/* ── FORUM ── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "120px" }}
      >
        {/* Forum title — 4 cols × 3 rows */}
        <div style={{ gridColumn: "span 4", gridRow: "span 3" }}>
          <SectionTitle fa="انجمن تخصصی تکباکس" href="/forum" moreLabel="ورود به انجمن ←" />
        </div>

        {/* Latest solved topic — 2 cols × 3 rows */}
        <div style={{ gridColumn: "span 2", gridRow: "span 3" }}>
          {forumLoading ? (
            <BentoSkeleton className="h-full" />
          ) : solvedTopic ? (
            <SolvedTopicCard item={solvedTopic} />
          ) : null}
        </div>

        {/* 6 small topics — 2 cols × 1 row each (3 per row) */}
        {forumLoading
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ gridColumn: "span 2", gridRow: "span 1" }}>
                <BentoSkeleton className="h-full" />
              </div>
            ))
          : smallTopics.map((topic) => (
              <div key={topic.slug} style={{ gridColumn: "span 2", gridRow: "span 1" }}>
                <SmallForumTopic item={topic} />
              </div>
            ))}
      </div>

      {/* ── SHOP ── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "120px" }}
      >
        {/* Big featured product — 2 cols × 4 rows */}
        <div style={{ gridColumn: "span 2", gridRow: "span 4" }}>
          {shopLoading ? (
            <BentoSkeleton className="h-full" />
          ) : bigProduct ? (
            <ProductCard item={bigProduct} big />
          ) : null}
        </div>

        {/* Shop title — 4 cols × 4 rows */}
        <div style={{ gridColumn: "span 4", gridRow: "span 4" }}>
          <SectionTitle fa="آخرین محصولات سازمانی" href="/shop" moreLabel="بازدید از فروشگاه ←" />
        </div>

        {/* 6 small products — 1 col × 2 rows each */}
        {shopLoading
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ gridColumn: "span 1", gridRow: "span 2" }}>
                <BentoSkeleton className="h-full" />
              </div>
            ))
          : smallProducts.map((p) => (
              <div key={p.slug} style={{ gridColumn: "span 1", gridRow: "span 2" }}>
                <ProductCard item={p} />
              </div>
            ))}
      </div>

      {/* ── TIMELINE ── */}
      <div className="w-full rounded-2xl border border-border overflow-hidden" style={{ minHeight: "480px" }}>
        <HomeTimelineRow showHomeTitle showHomeMoreLabel />
      </div>
    </div>
  );
}
