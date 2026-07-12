"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";
import { useStatEntry } from "@/providers/stats.provider";

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

  // Shared stats come from a single bulk /api/stats request made once per
  // page load (see providers/stats.provider.tsx), instead of every card
  // firing its own request. This drastically cuts the number of DB round
  // trips on pages with many cards.
  const { entry: shared, status } = useStatEntry(module, slug);

  useEffect(() => {
    if (!shared) return;
    if (typeof shared.views === "number") setViews(shared.views);
    if (typeof shared.likes === "number") setLikes(shared.likes);
    if (typeof shared.comments === "number") setComments(shared.comments);
  }, [shared]);

  useEffect(() => {
    let mounted = true;

    // Only fall back to the per-item endpoint once the bulk fetch has
    // actually settled (succeeded or failed) and this item still isn't in
    // it - e.g. brand-new content not yet reflected. Waiting on the real
    // status (instead of a guessed timeout) avoids every card racing off
    // its own redundant request whenever the bulk fetch is a bit slow.
    if (status === "loading" || shared) {
      return () => { mounted = false; };
    }

    fetch(`/api/stats?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(s => {
        if (!mounted || !s) return;
        if (typeof s.views === "number") setViews(s.views);
        if (typeof s.likes === "number") setLikes(s.likes);
        if (typeof s.comments === "number") setComments(s.comments);
      })
      .catch(() => null);

    return () => { mounted = false; };
  }, [module, slug, shared, status]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.module === module && e.detail.slug === slug) {
        if (typeof e.detail.views === "number") setViews(e.detail.views);
        if (typeof e.detail.likes === "number") setLikes(e.detail.likes);
        if (typeof e.detail.comments === "number") setComments(e.detail.comments);
      }
    };
    window.addEventListener("tb_stats_update", handleUpdate);
    return () => window.removeEventListener("tb_stats_update", handleUpdate);
  }, [module, slug]);

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
      <span className="inline-flex items-center gap-1" title="بازدید">
        <Icon name="view" size={16} strokeWidth={2} className="text-muted-foreground" />
        <span className="text-foreground">{views.toLocaleString("fa-IR")}</span>
        {showLabel && <span className="font-normal ms-0.5">بازدید</span>}
      </span>
      <span className="inline-flex items-center gap-1" title="پسند">
        <Icon name="like" size={16} strokeWidth={2} className="text-muted-foreground" />
        <span className="text-foreground">{likes.toLocaleString("fa-IR")}</span>
      </span>
      {showComments && (
        <span className="inline-flex items-center gap-1" title="دیدگاه">
          <Icon name="comment" size={16} strokeWidth={2} className="text-muted-foreground" />
          <span className="text-foreground">{comments.toLocaleString("fa-IR")}</span>
        </span>
      )}
    </div>
  );
}
