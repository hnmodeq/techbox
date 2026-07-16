"use client";
import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Liked-state cache (localStorage) ─────────────────────────
const LIKED_CACHE_KEY = "tb_liked";

function getLikedCache(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LIKED_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setLikedCache(module: string, slug: string, liked: boolean) {
  if (typeof window === "undefined") return;
  try {
    const cache = getLikedCache();
    const key = `${module}:${slug}`;
    if (liked) {
      cache[key] = true;
    } else {
      delete cache[key];
    }
    localStorage.setItem(LIKED_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getCachedLiked(module: string, slug: string): boolean | undefined {
  return getLikedCache()[`${module}:${slug}`];
}

// ─── Comment-vote cache (localStorage) ────────────────────────
const VOTE_CACHE_KEY = "tb_comment_vote";

function getVoteCache(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VOTE_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setVoteCache(commentId: string, voted: boolean) {
  if (typeof window === "undefined") return;
  try {
    const cache = getVoteCache();
    if (voted) {
      cache[commentId] = true;
    } else {
      delete cache[commentId];
    }
    localStorage.setItem(VOTE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getCachedVote(commentId: string): boolean | undefined {
  return getVoteCache()[commentId];
}

export function LikeButton({ contentType, slug, initial = 0, tooltipLabel }: { contentType: string; slug: string; initial?: number; tooltipLabel?: string }) {
  const cachedLiked = getCachedLiked(contentType, slug);
  const [liked, setLiked] = useState(cachedLiked ?? false);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/like?module=${encodeURIComponent(contentType)}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (active && typeof data.likes === "number") {
          setCount(data.likes);
          setLiked(data.liked);
          setLikedCache(contentType, slug, data.liked);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [contentType, slug]);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setShowLoginPrompt(false);

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount(c => nextLiked ? c + 1 : Math.max(0, c - 1));
    setLikedCache(contentType, slug, nextLiked);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: contentType, slug })
      });

      if (res.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        setLikedCache(contentType, slug, prevLiked);
        setShowLoginPrompt(true);
        setBusy(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likes);
        setLikedCache(contentType, slug, data.liked);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("tb_stats_update", { detail: { module: contentType, slug, likes: data.likes } }));
        }
      } else {
        setLiked(prevLiked);
        setCount(prevCount);
        setLikedCache(contentType, slug, prevLiked);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setLikedCache(contentType, slug, prevLiked);
    } finally {
      setBusy(false);
    }
  }, [busy, liked, count, contentType, slug]);

  return (
    <div className="relative inline-flex items-center">
      <Tooltip>
        <TooltipTrigger render={
          <Button
            onClick={toggle}
            disabled={busy}
            variant="ghost"
            size="sm"
            className={`gap-2 text-[length:var(--paragraph-font-size)] disabled:opacity-60 ${liked ? "text-red-500" : "text-[var(--paragraph-color)]"}`}
            aria-pressed={liked}
          />
        }>
          <Heart size={16} fill={liked ? "currentColor" : "none"} strokeWidth={2} className={liked ? "text-red-500" : ""} aria-hidden />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{(count ?? 0).toLocaleString("fa-IR")}</span>
          <span className="hidden sm:inline">پسندیدم</span>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel || "پسندیدن"}</TooltipContent>
      </Tooltip>

      {showLoginPrompt && (
        <div className="absolute bottom-full mb-2 right-0 z-50 w-64 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-3 shadow-[var(--shadow-size)] text-center animate-in fade-in zoom-in-95">
          <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--primary-text)] mb-2">برای پسندیدن مطالب باید وارد حساب کاربری خود شوید.</p>
          <div className="flex justify-center gap-2">
            <Button size="xs" onClick={() => { setShowLoginPrompt(false); window.dispatchEvent(new CustomEvent("tb_open_auth")); }}>ورود / عضویت</Button>
            <Button variant="ghost" size="xs" onClick={() => setShowLoginPrompt(false)}>بستن</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CommentVote({ id, initialLikes = 0 }: { id: string; initialLikes?: number; initialDislikes?: number }) {
  // Read voted state from localStorage cache synchronously for instant render
  const cachedVoted = getCachedVote(id);
  const [l, setL] = useState(initialLikes);
  const [v, setV] = useState<"up" | null>(cachedVoted ? "up" : null);
  const [busy, setBusy] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  // Fetch existing vote state on mount to confirm cache and get accurate count
  useEffect(() => {
    let active = true;
    fetch(`/api/comments/vote?commentId=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (data.voted === true) {
          setV("up");
          setVoteCache(id, true);
        } else {
          setV(null);
          setVoteCache(id, false);
        }
        if (typeof data.likes === "number") setL(data.likes);
      })
      .catch(() => {});

    return () => { active = false; };
  }, [id]);

  const vote = async () => {
    if (busy) return;
    setBusy(true);

    // Optimistic: update UI immediately
    const prevV = v;
    const prevL = l;
    const next = v === "up" ? 0 : 1;
    const nextLiked = next === 1;
    setV(nextLiked ? "up" : null);
    setL(nextLiked ? l + 1 : Math.max(0, l - 1));
    setVoteCache(id, nextLiked);
    setNeedLogin(false);

    try {
      const res = await fetch("/api/comments/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id, vote: next })
      });
      if (res.status === 401) {
        setV(prevV);
        setL(prevL);
        setVoteCache(id, prevV === "up");
        setNeedLogin(true);
        setBusy(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setL(data.likes);
        const serverVoted = next === 1;
        setV(serverVoted ? "up" : null);
        setVoteCache(id, serverVoted);
      } else {
        setV(prevV);
        setL(prevL);
        setVoteCache(id, prevV === "up");
      }
    } catch {
      setV(prevV);
      setL(prevL);
      setVoteCache(id, prevV === "up");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2 text-[length:var(--paragraph-font-size)] paragraph-color">
      <Tooltip>
        <TooltipTrigger render={
          <Button onClick={vote} variant="link" size="xs" className={v === "up" ? "text-red-500" : "paragraph-color hover:text-red-500"} />
        }>
          <Heart size={16} fill={v === "up" ? "currentColor" : "none"} strokeWidth={2} /> {(l ?? 0).toLocaleString("fa-IR")}
        </TooltipTrigger>
        <TooltipContent>پسندیدن این دیدگاه</TooltipContent>
      </Tooltip>
      {needLogin && (
        <div className="absolute bottom-full mb-1 right-0 z-50 w-56 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-2 shadow-[var(--shadow-size)] text-center">
          <p className="text-xs text-[var(--primary-text)] mb-1.5">برای پسندیدن نظر ابتدا وارد شوید</p>
          <Button size="xs" onClick={() => { setNeedLogin(false); window.dispatchEvent(new CustomEvent("tb_open_auth")); }}>ورود</Button>
        </div>
      )}
    </div>
  );
}
