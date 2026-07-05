"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";

const moduleIconColors: Record<string, string> = {
  blog: "text-[var(--tb-blog)]",
  news: "text-[var(--tb-news)]",
  media: "text-[var(--tb-media)]",
  review: "text-[var(--tb-review)]",
  tools: "text-[var(--tb-tools)]",
  download: "text-[var(--tb-download)]",
  shop: "text-[var(--tb-shop)]",
  forum: "text-[var(--tb-forum)]",
  timeline: "text-[var(--tb-timeline)]"
};

// Simple memory cache so multiple cards on one page don't spam requests
let statsCache: Record<string, { views: number; likes: number; comments: number }> | null = null;
let statsFetchPromise: Promise<any> | null = null;

export function CardStats({
  module,
  slug,
  initialViews = 0,
  initialLikes = 0,
  initialComments = 0,
  showComments = false,
  showLabel = false
}: {
  module: string;
  slug: string;
  initialViews?: number;
  initialLikes?: number;
  initialComments?: number;
  showComments?: boolean;
  showLabel?: boolean;
}) {
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    let mounted = true;
    const key = `${module}:${slug}`;

    const updateFromData = (data: any) => {
      if (!mounted || !data || !data[key]) return;
      const s = data[key];
      if (typeof s.views === "number") setViews(s.views);
      if (typeof s.likes === "number") setLikes(s.likes);
      if (typeof s.comments === "number") setComments(s.comments);
    };

    if (statsCache && statsCache[key]) {
      updateFromData(statsCache);
    } else {
      if (!statsFetchPromise) {
        statsFetchPromise = fetch("/api/stats")
          .then(r => r.json())
          .then(data => {
            statsCache = data;
            return data;
          })
          .catch(() => null);
      }
      statsFetchPromise.then(data => updateFromData(data));
    }

    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.module === module && e.detail.slug === slug) {
        if (typeof e.detail.views === "number") setViews(e.detail.views);
        if (typeof e.detail.likes === "number") setLikes(e.detail.likes);
        if (typeof e.detail.comments === "number") setComments(e.detail.comments);
      }
    };
    window.addEventListener("tb_stats_update", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("tb_stats_update", handleUpdate);
    };
  }, [module, slug]);

  const iconColor = moduleIconColors[module] || "text-[var(--home)]";

  return (
    <div className="flex items-center gap-3 text-xs paragraph-color font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
      <span className="inline-flex items-center gap-1" title="بازدید">
        <Icon name="view" size={16} strokeWidth={2} className={iconColor} />
        <span className="text-[var(--primary-text)]">{views.toLocaleString("fa-IR")}</span>
        {showLabel && <span className="font-normal ms-0.5">بازدید</span>}
      </span>
      <span className="inline-flex items-center gap-1" title="پسند">
        <Icon name="like" size={16} strokeWidth={2} className="text-red-400 fill-current" />
        <span className="text-[var(--primary-text)]">{likes.toLocaleString("fa-IR")}</span>
      </span>
      {showComments && (
        <span className="inline-flex items-center gap-1" title="دیدگاه">
          <Icon name="comment" size={16} strokeWidth={2} className="text-cyan-400" />
          <span className="text-[var(--primary-text)]">{comments.toLocaleString("fa-IR")}</span>
        </span>
      )}
    </div>
  );
}
