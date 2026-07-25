"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { type ContentItem } from "@/lib/content";
import { ArticleModal } from "@/features/blog/components/ArticleModal";
import { formatRelativeDate } from "@/lib/date-format";
import { Card } from "@/components/ui/card";
import { blurProps } from "@/lib/image-placeholder";
import { ArrowLeft } from "lucide-react";

// ─── Time.com-style Magazine Layout ──────────────────────────────────────────

interface BlogMagazineGridProps {
  serverItems?: ContentItem[];
}

const PEOPLE_TAG = "people";

export default function BlogMagazineGrid({ serverItems }: BlogMagazineGridProps) {
  const items = serverItems ?? [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Separate people articles from regular articles
  const peopleArticles = items.filter((item) =>
    item.tags?.some((tag) => tag.toLowerCase() === PEOPLE_TAG)
  );
  const regularArticles = items.filter((item) =>
    !item.tags?.some((tag) => tag.toLowerCase() === PEOPLE_TAG)
  );

  // Featured: first 3 articles (1 large + 2 small)
  const featuredArticles = regularArticles.slice(0, 3);
  // Full-width magazine: next 4 articles
  const magazineArticles = regularArticles.slice(3, 7);
  // Grid: rest of articles
  const gridArticles = regularArticles.slice(7);

  const open = useCallback((idx: number) => setActiveIndex(idx), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : i > 0 ? i - 1 : items.length - 1)),
    [items.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : i < items.length - 1 ? i + 1 : 0)),
    [items.length]
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
        <Card className="p-12 text-center">
          <div className="text-4xl">📝</div>
          <h3 className="text-lg font-semibold mt-4">هنوز مقاله‌ای منتشر نشده</h3>
          <p className="text-sm text-muted-foreground mt-2">به زودی مقالات تخصصی منتشر خواهد شد.</p>
        </Card>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-16" dir="rtl">

        {/* ── Hero: Time.com-style Bento Grid ── */}
        {/* 1 large (left) + 2 stacked (right) */}
        {featuredArticles.length >= 3 && (
          <section className="relative">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                ── ویژه
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Large Featured Article */}
              <div 
                className="lg:col-span-2 group cursor-pointer"
                onClick={() => open(0)}
              >
                <MagazineFeatureCard 
                  item={featuredArticles[0]} 
                  aspect="landscape"
                  showExcerpt
                />
              </div>

              {/* Two stacked smaller articles */}
              <div className="flex flex-col gap-4">
                {featuredArticles.slice(1, 3).map((item, idx) => (
                  <div 
                    key={item.slug} 
                    className="flex-1 group cursor-pointer"
                    onClick={() => open(idx + 1)}
                  >
                    <MagazineFeatureCard 
                      item={item} 
                      aspect="portrait"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Handle case with fewer than 3 articles */}
        {featuredArticles.length > 0 && featuredArticles.length < 3 && (
          <section className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredArticles.map((item, idx) => (
                <div key={item.slug} className="group cursor-pointer" onClick={() => open(idx)}>
                  <MagazineFeatureCard item={item} aspect="landscape" showExcerpt />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Full-Width Magazine Row ── */}
        {magazineArticles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                ── مجله
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {magazineArticles.map((item, idx) => {
                const globalIndex = regularArticles.indexOf(item);
                return (
                  <div key={item.slug} className="group cursor-pointer" onClick={() => open(globalIndex)}>
                    <MagazineCard item={item} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── People Section ── */}
        {peopleArticles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                ── شخصیت‌ها
              </span>
              <Link 
                href="/blog/tag/people" 
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                همه
                <ArrowLeft className="size-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {peopleArticles.slice(0, 6).map((item) => {
                const globalIndex = regularArticles.indexOf(item);
                return (
                  <div key={item.slug} className="group cursor-pointer" onClick={() => open(globalIndex)}>
                    <PeopleCard item={item} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Article Grid ── */}
        {gridArticles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                ── همه مقالات
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gridArticles.map((item) => {
                const globalIndex = regularArticles.indexOf(item);
                return (
                  <div key={item.slug} className="group cursor-pointer" onClick={() => open(globalIndex)}>
                    <MagazineCard item={item} compact />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Load More ── */}
        {items.length > 10 && (
          <div className="text-center py-8">
            <button className="px-8 py-3 rounded-lg border border-border hover:bg-muted transition-colors">
              مقالات بیشتر
            </button>
          </div>
        )}
      </main>

      {/* Article Modal */}
      {activeIndex !== null && items[activeIndex] && (
        <ArticleModal
          item={items[activeIndex] as ContentItem}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}

// ─── Magazine Feature Card (Hero) ──────────────────────────────────────────────

function MagazineFeatureCard({ 
  item, 
  aspect = "landscape",
  showExcerpt = false
}: { 
  item: ContentItem; 
  aspect?: "landscape" | "portrait";
  showExcerpt?: boolean;
}) {
  const aspectClass = aspect === "landscape" ? "aspect-[16/10]" : "aspect-[4/3]";

  return (
    <Card className={`relative overflow-hidden group ${aspectClass} transition-all duration-300 hover:shadow-xl`}>
      {/* Image */}
      <Image
        src={item.image || "/assets/blog-1.jpg"}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        {...blurProps(item.image || "/assets/blog-1.jpg")}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Category badge */}
      {item.category && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
            {item.category}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        {/* Date */}
        <div className="text-xs text-white/70 mb-2">
          {formatRelativeDate(item.date)}
        </div>

        {/* Title */}
        <h2 className={`font-black text-white leading-tight mb-2 group-hover:text-primary-foreground transition-colors ${
          aspect === "landscape" ? "text-xl md:text-2xl lg:text-3xl" : "text-sm md:text-base"
        }`}>
          {item.title}
        </h2>

        {/* Excerpt */}
        {showExcerpt && aspect === "landscape" && item.excerpt && (
          <p className="text-sm text-white/80 line-clamp-2 mt-2 hidden md:block">
            {item.excerpt}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center gap-2 mt-3">
          {item.author?.avatar && (
            <div className="relative size-8 rounded-full overflow-hidden ring-1 ring-white/30">
              <Image
                src={item.author.avatar}
                alt={item.author.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span className="text-sm font-medium text-white/90">
            {item.author?.name || "تحریریه"}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ─── Magazine Card (Standard) ─────────────────────────────────────────────────

function MagazineCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  return (
    <Card className={`relative overflow-hidden group transition-all duration-300 hover:shadow-lg ${
      compact ? "aspect-[4/3]" : "aspect-[3/4]"
    }`}>
      {/* Image */}
      <Image
        src={item.image || "/assets/blog-1.jpg"}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        {...blurProps(item.image || "/assets/blog-1.jpg")}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Category */}
      {item.category && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full backdrop-blur-sm">
            {item.category}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary-foreground transition-colors">
          {item.title}
        </h3>
        {!compact && (
          <p className="text-xs text-white/70 line-clamp-2 mt-1 hidden sm:block">
            {item.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/60">
          <span>{formatRelativeDate(item.date)}</span>
          <span>·</span>
          <span>{item.readingTimeLabel}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── People Card ────────────────────────────────────────────────────────────────

function PeopleCard({ item }: { item: ContentItem }) {
  return (
    <Card className="relative overflow-hidden group aspect-[3/4] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <Image
        src={item.image || "/assets/avatar-placeholder.jpg"}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
        {...blurProps(item.image || "/assets/avatar-placeholder.jpg")}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
          {item.title}
        </h3>
        <p className="text-xs text-white/70 mt-1">
          {item.author?.name || item.author?.job || "IT متخصص"}
        </p>
      </div>
    </Card>
  );
}
