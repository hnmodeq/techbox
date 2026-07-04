"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";

export function LiveViewCounter({ module, slug, initialViews = 0, showLabel = false }: { module: string; slug: string; initialViews?: number; showLabel?: boolean }) {
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
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [module, slug]);

  return (
    <span className="inline-flex items-center gap-1 font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
      <Icon name="view" size={15} strokeWidth={1.75} />
      <span>{views.toLocaleString("fa-IR")}</span>
      {showLabel && <span className="font-sans ms-1">بازدید</span>}
    </span>
  );
}
