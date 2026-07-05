"use client";
import { useEffect, useState, useCallback } from "react";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function LikeButton({ contentType, slug, initial = 0 }: { contentType: string; slug: string; initial?: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch(`/api/like?module=${encodeURIComponent(contentType)}&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (active && typeof data.likes === "number") {
          setCount(data.likes);
          setLiked(data.liked);
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

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: contentType, slug })
      });

      if (res.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        setShowLoginPrompt(true);
        setBusy(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likes);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("tb_stats_update", { detail: { module: contentType, slug, likes: data.likes } }));
        }
      } else {
        setLiked(prevLiked);
        setCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  }, [busy, liked, count, contentType, slug]);

  return (
    <div className="relative inline-flex items-center">
      <Button
        onClick={toggle}
        disabled={busy}
        variant={liked ? "primary" : "ghost"}
        size="sm"
        className="gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] disabled:opacity-60"
        aria-pressed={liked}
      >
        <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={2} className={liked ? "text-white" : ""} aria-hidden />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{(count ?? 0).toLocaleString("fa-IR")}</span>
        <span className="hidden sm:inline">پسندیدم</span>
      </Button>

      {showLoginPrompt && (
        <div className="absolute bottom-full mb-2 right-0 z-50 w-64 rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] p-3 shadow-[var(--shadow-size)] text-center animate-in fade-in zoom-in-95">
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

export function CommentVote({ id, initialLikes = 0, initialDislikes = 0 }: { id: string; initialLikes?: number; initialDislikes?: number }) {
  const [l, setL] = useState(initialLikes);
  const [d, setD] = useState(initialDislikes);
  const [v, setV] = useState<"up" | "down" | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const router = useRouter();

  const vote = async (type: "up" | "down") => {
    const next = v === type ? 0 : (type === "up" ? 1 : -1);
    const prev = v === "up" ? 1 : v === "down" ? -1 : 0;
    try {
      const res = await fetch("/api/comments/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id, vote: next })
      });
      if (res.status === 401) {
        setNeedLogin(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setL(data.likes);
        setD(data.dislikes);
        setV(next === 0 ? null : type);
      }
    } catch {}
  };

  return (
    <div className="relative inline-flex items-center gap-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
      <Button onClick={() => vote("up")} variant="link" size="xs" className={v === "up" ? "text-[var(--tb-success)]" : "paragraph-color hover:text-[var(--primary-text)]"}>▲ {(l ?? 0).toLocaleString("fa-IR")}</Button>
      <Button onClick={() => vote("down")} variant="link" size="xs" className={v === "down" ? "text-[var(--tb-danger)]" : "paragraph-color hover:text-[var(--primary-text)]"}>▼ {(d ?? 0).toLocaleString("fa-IR")}</Button>
      {needLogin && (
        <div className="absolute bottom-full mb-1 right-0 z-50 w-56 rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] p-2 shadow-[var(--shadow-size)] text-center">
          <p className="text-xs text-[var(--primary-text)] mb-1.5">برای امتیاز به نظر ابتدا وارد شوید</p>
          <div className="flex justify-center gap-2">
            <Button size="xs" onClick={() => { setNeedLogin(false); window.dispatchEvent(new CustomEvent("tb_open_auth")); }}>ورود</Button>
            <Button variant="ghost" size="xs" onClick={() => setNeedLogin(false)}>بستن</Button>
          </div>
        </div>
      )}
    </div>
  );
}
