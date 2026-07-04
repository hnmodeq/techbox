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
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: contentType, slug })
      });

      if (res.status === 401) {
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
      }
    } catch {
    } finally {
      setBusy(false);
    }
  }, [busy, contentType, slug]);

  return (
    <div className="relative inline-flex items-center">
      <Button
        onClick={toggle}
        disabled={busy}
        variant={liked ? "primary" : "ghost"}
        size="sm"
        className="gap-2 tb-text-sm disabled:opacity-60"
        aria-pressed={liked}
      >
        <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={2} className={liked ? "text-white" : ""} aria-hidden />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{(count ?? 0).toLocaleString("fa-IR")}</span>
        <span className="hidden sm:inline">پسندیدم</span>
      </Button>

      {showLoginPrompt && (
        <div className="absolute bottom-full mb-2 right-0 z-50 w-64 rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-3 shadow-[var(--tb-shadow-lg)] text-center animate-in fade-in zoom-in-95">
          <p className="tb-text-sm text-[var(--tb-fg-primary)] mb-2">برای پسندیدن مطالب باید وارد حساب کاربری خود شوید.</p>
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
    <div className="relative inline-flex items-center gap-3 tb-text-sm text-[var(--tb-fg-muted)]">
      <Button onClick={() => vote("up")} variant="link" size="xs" className={v === "up" ? "text-[var(--tb-success)]" : "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]"}>▲ {(l ?? 0).toLocaleString("fa-IR")}</Button>
      <Button onClick={() => vote("down")} variant="link" size="xs" className={v === "down" ? "text-[var(--tb-danger)]" : "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]"}>▼ {(d ?? 0).toLocaleString("fa-IR")}</Button>
      {needLogin && (
        <div className="absolute bottom-full mb-1 right-0 z-50 w-56 rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] p-2 shadow-[var(--tb-shadow-md)] text-center">
          <p className="text-xs text-[var(--tb-fg-primary)] mb-1.5">برای امتیاز به نظر ابتدا وارد شوید</p>
          <div className="flex justify-center gap-2">
            <Button size="xs" onClick={() => { setNeedLogin(false); window.dispatchEvent(new CustomEvent("tb_open_auth")); }}>ورود</Button>
            <Button variant="ghost" size="xs" onClick={() => setNeedLogin(false)}>بستن</Button>
          </div>
        </div>
      )}
    </div>
  );
}
