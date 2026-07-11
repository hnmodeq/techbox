"use client";

import type { ContentItem } from "@/lib/content";
import { useDbPost } from "@/hooks/useDbPosts";
import DownloadDetail from "./DownloadDetail";
import { SpinnerCenter } from "@/components/ui/spinner";

export default function DbDownloadDetail({ slug, fallback }: { slug: string; fallback: ContentItem | null }) {
  const { item, loading } = useDbPost("download", slug, fallback);
  if (loading && !item) return <SpinnerCenter />;
  if (!item) return <main className="mx-auto max-w-4xl px-4 py-16 paragraph-color" dir="rtl">این فایل در دیتابیس پیدا نشد.</main>;
  return <DownloadDetail item={item} />;
}
