"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";
import { useStatEntry } from "@/providers/stats.provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function StatTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex items-center gap-1" />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function CardStats({
  module,
  slug,
  initialViews = 0,
  initialLikes = 0,
  initialComments,
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
  // null = not yet loaded; avoids showing "0" before the real count arrives
  const [comments, setComments] = useState<number | null>(initialComments ?? null);
  const { entry: shared, status } = useStatEntry(module, slug);

  useEffect(() => {
    if (!shared) return;
    if (typeof shared.views === "number") setViews(shared.views);
    if (typeof shared.likes === "number") setLikes(shared.likes);
    if (typeof shared.comments === "number") setComments(shared.comments);
  }, [shared]);

  useEffect(() => {
    let mounted = true;
    if (status === "loading" || shared) return () => { mounted = false; };
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
      <StatTooltip label="تعداد بازدید">
        <Icon name="view" size={16} strokeWidth={2} className="text-muted-foreground" />
        <span className="text-foreground">{views.toLocaleString("fa-IR")}</span>
        {showLabel && <span className="font-normal ms-0.5">بازدید</span>}
      </StatTooltip>
      <StatTooltip label="تعداد پسندها">
        <Icon name="like" size={16} strokeWidth={2} className="text-muted-foreground" />
        <span className="text-foreground">{likes.toLocaleString("fa-IR")}</span>
      </StatTooltip>
      {showComments && comments !== null && (
        <StatTooltip label="دیدگاه کاربران">
          <Icon name="comment" size={16} strokeWidth={2} className="text-muted-foreground" />
          <span className="text-foreground">{comments.toLocaleString("fa-IR")}</span>
        </StatTooltip>
      )}
    </div>
  );
}
