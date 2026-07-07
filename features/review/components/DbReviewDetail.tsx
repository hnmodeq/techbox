"use client";

import type { ContentItem } from "@/lib/content";
import { useDbPost } from "@/hooks/useDbPosts";
import ReviewDetail from "./ReviewDetail";

export default function DbReviewDetail({ slug, fallback }: { slug: string; fallback: ContentItem | null }) {
  const { item, loading } = useDbPost("review", slug, fallback);
  if (loading && !item) return <main className="mx-auto max-w-4xl px-4 py-16 paragraph-color" dir="rtl">در حال دریافت نقد از دیتابیس…</main>;
  if (!item) return <main className="mx-auto max-w-4xl px-4 py-16 paragraph-color" dir="rtl">این نقد در دیتابیس پیدا نشد.</main>;
  return <ReviewDetail item={item} />;
}
