"use client";

import type { ContentItem } from "@/lib/content";
import { useDbPost } from "@/hooks/useDbPosts";
import ProductDetail from "./ProductDetail";
import { SpinnerCenter } from "@/components/ui/spinner";

export default function DbProductDetail({ slug, fallback }: { slug: string; fallback: ContentItem | null }) {
  const { item, loading } = useDbPost("shop", slug, fallback);
  if (loading && !item) return <SpinnerCenter />;
  if (!item) return <main className="mx-auto max-w-4xl px-4 py-16 paragraph-color" dir="rtl">این محصول در دیتابیس پیدا نشد.</main>;
  return <ProductDetail item={item} />;
}
