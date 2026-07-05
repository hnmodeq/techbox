"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";

const moduleIconColors: Record<string, string> = {
  blog: "text-[var(--blog)]",
  news: "text-[var(--news)]",
  media: "text-[var(--media)]",
  review: "text-[var(--review)]",
  tools: "text-[var(--tools)]",
  download: "text-[var(--download)]",
  shop: "text-[var(--shop)]",
  forum: "text-[var(--forum)]",
  timeline: "text-[var(--timeline)]"
};

export function LiveViewCounter({
  module,
  slug,
  initialViews = 0,
  showLabel = false
}: {
  module: string;
  slug: string;
  initialViews?: number;
  showLabel?: boolean;
}) {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    let mounted = true;
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module, slug })
    })
      .then(res => res.json())
      .then(data => {
        if (mounted && data.ok && typeof data.views === "number") {
          setViews(data.views);
          // dispatch global event or update local storage so cards sync instantly
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("tb_stats_update", { detail: { module, slug, views: data.views } }));
          }
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [module, slug]);

  const iconColor = moduleIconColors[module] || "text-[var(--home)]";

  return (
    <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm paragraph-color" style={{ fontVariantNumeric: "tabular-nums" }}>
      <Icon name="view" size={16} strokeWidth={2} className={iconColor} />
      <span className="font-extrabold text-[var(--primary-text)]">{views.toLocaleString("fa-IR")}</span>
      {showLabel && <span className="font-sans ms-1 font-normal paragraph-color">بازدید</span>}
    </span>
  );
}
