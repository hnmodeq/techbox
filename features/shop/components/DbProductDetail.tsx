"use client";

import type { ContentItem } from "@/lib/content";
import { useDbPost } from "@/hooks/useDbPosts";
import ProductDetail from "./ProductDetail";

export default function DbProductDetail({ slug, fallback }: { slug: string; fallback: ContentItem | null }) {
  const { item, loading } = useDbPost("shop", slug, fallback);
  if (loading && !item) return <main className="mx-auto max-w-4xl px-4 py-16 paragraph-color" dir="rtl">در حال دریافت محصول از دیتابیس…</main>;
  if (!item) return <main className="mx-auto max-w-4xl px-4 py-16 paragraph-color" dir="rtl">این محصول در دیتابیس پیدا نشد.</main>;
  return <ProductDetail item={item} />;
}
