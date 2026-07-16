"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";
import { Button } from "@/components/ui/button";

// ─── User rating cache (localStorage) ────────────────────────
// Persists the user's own rating across page loads so stars appear
// filled instantly without waiting for /api/rating to respond.
const RATING_CACHE_KEY = "tb_my_rating";

function getRatingCache(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(RATING_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setRatingCache(module: string, slug: string, value: number | null) {
  if (typeof window === "undefined") return;
  try {
    const cache = getRatingCache();
    const key = `${module}:${slug}`;
    if (value !== null) {
      cache[key] = value;
    } else {
      delete cache[key];
    }
    localStorage.setItem(RATING_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getCachedMyRating(module: string, slug: string): number | undefined {
  return getRatingCache()[`${module}:${slug}`];
}

export function RatingWidget({ module, slug, initialRating, initialCount }: { module: string; slug: string; initialRating?: number | null; initialCount?: number }) {
  const cachedMine = getCachedMyRating(module, slug);
  const [rating, setRating] = useState<number | null>(initialRating ?? null);
  const [count, setCount] = useState(initialCount ?? 0);
  const [mine, setMine] = useState<number | null>(cachedMine ?? null);

  useEffect(() => {
    fetch(`/api/rating?module=${module}&slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        if (typeof d.rating === "number") setRating(d.rating);
        if (typeof d.ratingCount === "number") setCount(d.ratingCount);
        if (typeof d.myRating === "number") {
          setMine(d.myRating);
          setRatingCache(module, slug, d.myRating);
        }
      })
      .catch(() => {});
  }, [module, slug]);

  const submit = async (value: number) => {
    // Optimistic: update immediately
    const prevMine = mine;
    const prevRating = rating;
    const prevCount = count;
    setMine(value);
    setRatingCache(module, slug, value);

    const res = await fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module, slug, value }),
    });
    if (res.status === 401) {
      setMine(prevMine);
      setRatingCache(module, slug, prevMine);
      window.dispatchEvent(new CustomEvent("tb_open_auth"));
      return;
    }
    if (res.ok) {
      const d = await res.json();
      setRating(d.rating);
      setCount(d.ratingCount);
      setMine(d.myRating);
      setRatingCache(module, slug, d.myRating);
      window.dispatchEvent(new CustomEvent("tb_stats_update", { detail: { module, slug, rating: d.rating, ratingCount: d.ratingCount } }));
    } else {
      setMine(prevMine);
      setRating(prevRating);
      setCount(prevCount);
      setRatingCache(module, slug, prevMine);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="paragraph-color text-xs">امتیاز شما:</span>
      {[1, 2, 3, 4, 5].map(v => (
        <Button
          key={v}
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => submit(v)}
          className={v <= (mine || 0) ? "text-[var(--warning)] hover:text-[var(--warning)]" : "text-muted-foreground hover:text-[var(--warning)]"}
        >
          <Icon name="star" size={20} className={v <= (mine || 0) ? "fill-current" : ""} />
        </Button>
      ))}
      <span className="text-xs paragraph-color">
        {rating ? `${rating.toFixed(1)} (${count.toLocaleString("fa-IR")})` : "بدون امتیاز"}
      </span>
    </div>
  );
}
