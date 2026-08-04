"use client";

import * as React from "react";
import { Film, Images, RefreshCw } from "lucide-react";
import { extractVideoFramesFromUrl } from "@/components/admin/video-frame-extractor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type StoryboardMediaPost = {
  slug: string;
  title: string;
  videoUrl?: string | null;
  gallery?: string[];
};

export function hasVideoStoryboard(gallery?: string[] | null) {
  return (gallery ?? []).filter((url) =>
    typeof url === "string"
    && /\/videos\/storyboards\/[^/]+\/frame-\d+\.webp(?:\?|$)/i.test(url)
  ).length >= 10;
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (message.includes("too_many_requests")) return "محدودیت موقت آپلود؛ یک دقیقه بعد دوباره تلاش کنید.";
  if (message.includes("video_decode") || message.includes("video_seeked") || message.includes("loadedmetadata")) {
    return "مرورگر نتوانست این کُدک ویدیو را بخواند.";
  }
  if (message.includes("webp_encode") || message.includes("canvas")) {
    return "مرورگر نتوانست فریم WebP بسازد؛ CORS یا پشتیبانی مرورگر را بررسی کنید.";
  }
  return "ساخت یا ذخیره فریم‌ها ناموفق بود.";
}

/** One-click migration for media posts created before storyboard extraction.
 * Decoding happens in the authenticated admin's browser because Vercel has no
 * ffmpeg binary. Existing videos are streamed, never uploaded a second time. */
export function LegacyVideoStoryboardBackfill() {
  const [posts, setPosts] = React.useState<StoryboardMediaPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [running, setRunning] = React.useState(false);
  const [activeTitle, setActiveTitle] = React.useState("");
  const [processed, setProcessed] = React.useState(0);
  const [queueTotal, setQueueTotal] = React.useState(0);
  const [failures, setFailures] = React.useState<Array<{ title: string; message: string }>>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/posts?module=media&admin=1&take=200", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || "media_posts_unavailable");
      setPosts(data);
    } catch {
      setLoadError("فهرست ویدیوهای رسانه دریافت نشد یا دسترسی ویرایش رسانه ندارید.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const pending = React.useMemo(
    () => posts.filter((post) => post.videoUrl?.startsWith("https://") && !hasVideoStoryboard(post.gallery)),
    [posts],
  );
  const completedCount = posts.filter((post) => hasVideoStoryboard(post.gallery)).length;

  const backfill = async () => {
    if (running || pending.length === 0) return;
    const queue = [...pending];
    setRunning(true);
    setProcessed(0);
    setQueueTotal(queue.length);
    setFailures([]);

    for (const post of queue) {
      setActiveTitle(post.title);
      try {
        const extracted = await extractVideoFramesFromUrl(post.videoUrl!, 10);
        const body = new FormData();
        body.set("mediaSlug", post.slug);
        body.set("durationSeconds", String(extracted.duration));
        for (const frame of extracted.frames) body.append("frames", frame);

        const response = await fetch("/api/admin/video-frames", {
          method: "POST",
          body,
          credentials: "include",
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.persisted || !Array.isArray(data.urls)) {
          throw new Error(data?.error || "storyboard_backfill_failed");
        }

        setPosts((current) => current.map((item) =>
          item.slug === post.slug ? { ...item, gallery: data.urls } : item
        ));
      } catch (error) {
        setFailures((current) => [...current, { title: post.title, message: friendlyError(error) }]);
      } finally {
        setProcessed((value) => value + 1);
      }
    }

    setActiveTitle("");
    setRunning(false);
  };

  const progress = queueTotal > 0 ? Math.min(100, Math.round((processed / queueTotal) * 100)) : 100;

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300">
              <Images className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold">ساخت فریم هاور برای ویدیوهای قدیمی</h2>
              <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
                ویدیوهای فعلی از Storage در همین مرورگر خوانده می‌شوند، ۱۰ فریم WebP از آن‌ها ساخته و مستقیم به همان مطلب متصل می‌شود. خود ویدیو دوباره آپلود نمی‌شود.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => void load()} disabled={loading || running}>
              <RefreshCw className="size-3" />
              بررسی دوباره
            </Button>
            <Button type="button" size="sm" onClick={() => void backfill()} disabled={loading || running || pending.length === 0}>
              <Film className="size-3" />
              {running ? "در حال ساخت…" : `ساخت برای ${pending.length.toLocaleString("fa-IR")} ویدیو`}
            </Button>
          </div>
        </div>

        {loading && <p className="text-xs text-muted-foreground">در حال بررسی ویدیوهای رسانه…</p>}
        {loadError && <p className="text-xs text-destructive">{loadError}</p>}

        {!loading && !loadError && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>{completedCount.toLocaleString("fa-IR")} ویدیو دارای فریم هاور</span>
            <span>{pending.length.toLocaleString("fa-IR")} ویدیو در انتظار ساخت</span>
          </div>
        )}

        {running && (
          <div className="space-y-2" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate">در حال پردازش: {activeTitle}</span>
              <span className="shrink-0 tabular-nums">{processed.toLocaleString("fa-IR")} / {queueTotal.toLocaleString("fa-IR")}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-purple-500 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">تا پایان پردازش این صفحه را باز نگه دارید.</p>
          </div>
        )}

        {!running && !loading && !loadError && pending.length === 0 && posts.length > 0 && (
          <p className="text-xs font-medium text-emerald-600">همه ویدیوهای دارای فایل، ۱۰ فریم هاور دارند.</p>
        )}

        {failures.length > 0 && (
          <div className="space-y-1 text-xs text-destructive">
            <p className="font-bold">موارد ناموفق:</p>
            {failures.map((failure) => (
              <p key={failure.title}>{failure.title}: {failure.message}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LegacyVideoStoryboardBackfill;
