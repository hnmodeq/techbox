"use client";

import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { RemoteImage } from "@/components/ui/remote-image";
import { RelativeDate } from "@/components/ui/relative-date";

const tabs = [
  { id: "articles", label: "مقاله‌ها", color: "var(--module-blog-color)" },
  { id: "videos", label: "ویدیوها", color: "var(--module-media-color)" },
  { id: "reviews", label: "بررسی‌ها", color: "var(--module-review-color)" },
] as const;
type TabId = (typeof tabs)[number]["id"];

export function EditorialTabs({ articles, videos, reviews }: { articles: ContentItem[]; videos: ContentItem[]; reviews: ContentItem[] }) {
  const [active, setActive] = React.useState<TabId>("articles");
  const items = active === "articles" ? articles : active === "videos" ? videos : reviews;
  const config = tabs.find((tab) => tab.id === active) ?? tabs[0];
  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <section id="v2-editorial" className="bg-white py-14 dark:bg-black" aria-labelledby="v2-editorial-title">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold" style={{ color: config.color }}>انتخاب تحریریه</p>
            <h2 id="v2-editorial-title" className="mt-1 text-3xl font-black text-foreground">بخوان، ببین، ارزیابی کن</h2>
          </div>
          <div className="flex border border-border" role="tablist" aria-label="نوع محتوای تحریریه">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={`min-w-24 px-4 py-2 text-sm font-bold transition-colors ${active === tab.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <article className="group border border-border bg-card">
            <Link href={`/${lead.module}/${lead.slug}`} className="block">
              <div className="relative aspect-[16/8.5] overflow-hidden bg-muted">
                <RemoteImage src={lead.image} alt={lead.title} sizes="(min-width: 1024px) 760px, 100vw" className="transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
              <div className="p-6 sm:p-7">
                <RelativeDate date={lead.date} className="text-xs text-muted-foreground" />
                <h3 className="mt-2 text-2xl font-black leading-9 text-foreground">{lead.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{lead.excerpt}</p>
              </div>
            </Link>
          </article>

          <div className="grid grid-cols-1 divide-y divide-border border-y border-border">
            {rest.slice(0, 4).map((item) => (
              <Link key={`${item.module}-${item.slug}`} href={`/${item.module}/${item.slug}`} className="group grid grid-cols-[7rem_1fr] items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <RemoteImage src={item.image} alt={item.title} sizes="112px" className="transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
                <div className="min-w-0">
                  <RelativeDate date={item.date} className="text-[10px] text-muted-foreground" />
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-foreground">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
