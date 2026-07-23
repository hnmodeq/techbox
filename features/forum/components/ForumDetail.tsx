"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRelativeDate } from "@/lib/date-format";
import { ForumBadge } from "@/components/ui/forum-badge";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { ForumJsonLd } from "@/components/seo/StructuredData";
import { ShareButton } from "@/components/ui/share-button";
import { SaveButton } from "@/components/ui/save-button";
import { AuthorLink } from "@/components/ui/author-link";

type ForumDetailProps = {
  slug: string;
  initialItem?: any | null;
};

function ForumDetailSkeleton() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
      <article className="border border-border rounded-xl bg-card p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </article>
    </main>
  );
}

export default function ForumDetail({ slug, initialItem = null }: ForumDetailProps) {
  const [item, setItem] = useState<any | null>(initialItem);
  const [loading, setLoading] = useState(!initialItem);
  const [notFound, setNotFound] = useState(false);

  // Use initialItem immediately — no flash of skeleton when we already have data
  useEffect(() => {
    if (initialItem && !item) {
      setItem(initialItem);
      setLoading(false);
    }
  }, [initialItem, item]);

  useEffect(() => {
    let mounted = true;

    fetch(`/api/posts?module=forum&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("forum_topic_unavailable");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setItem(data);
          setNotFound(false);
        } else if (initialItem) {
          setItem(initialItem);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        if (initialItem) {
          setItem(initialItem);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, initialItem]);

  if (loading && !item) return <ForumDetailSkeleton />;

  if (notFound || !item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center" dir="rtl">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-black text-foreground">موضوع پیدا نشد</h1>
        <p className="mt-3 text-sm text-muted-foreground">این موضوع وجود ندارد یا موقتاً در دسترس نیست.</p>
        <Link href="/forum" className="mt-6 inline-flex text-primary font-bold hover:underline text-sm">
          بازگشت به انجمن
        </Link>
      </main>
    );
  }

  const viewCount = item.views ?? 0;

  return (
    <>
    <ForumJsonLd item={item} />
    <main className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
      {/* Topic Card */}
      <article className="border border-border rounded-xl bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-start gap-3.5">
            <AuthorLink
              name={item.author?.name || "کاربر انجمن"}
              username={item.author?.username}
              avatar={item.author?.avatar || "/assets/hooman.png"}
              verifiedType={(item.author as any)?.verifiedType}
              verifiedLabel={(item.author as any)?.verifiedLabel}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-foreground leading-7">{item.title}</h1>
                <ForumBadge slug={item.slug} fallback={typeof item.solved === "boolean" ? item.solved : null} />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>
                  ایجاد شده توسط{" "}
                  <span className="font-semibold text-foreground/80">{item.author?.name || "کاربر انجمن"}</span>
                </span>
                <span className="text-border">•</span>
                <span>{formatRelativeDate(item.date)}</span>
                <span className="text-border">•</span>
                <span>{viewCount.toLocaleString("fa-IR")} بازدید</span>
              </div>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <LikeButton contentType="forum" slug={item.slug} initial={item.likes || 0} />
            <SaveButton module="forum" slug={item.slug} />
            <ShareButton />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="prose prose-sm max-w-none leading-8 text-[15px] text-foreground whitespace-pre-line">
            {item.content || item.excerpt || "توضیحات تکمیلی برای این پرسش ثبت نشده است."}
          </div>
        </div>
      </article>

      {/* Comments / Replies */}
      <CommentSection module="forum" slug={item.slug} initialComments={item.comments || 0} />
    </main>
    </>
  );
}
