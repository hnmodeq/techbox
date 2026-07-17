"use client";

import type { ContentItem, ModuleSlug } from "@/lib/content";
import { useDbPost } from "@/hooks/useDbPosts";
import ContentDetail from "./ContentDetail";
import { SpinnerCenter } from "@/components/ui/spinner";
import { useModuleEnabled } from "@/providers/module-config.provider";

export default function DbContentDetail({ module, slug, fallback }: { module: ModuleSlug; slug: string; fallback: ContentItem | null }) {
  const { item, loading } = useDbPost(module, slug, fallback);
  const isEnabled = useModuleEnabled(module as any);

  if (!isEnabled) {
    return <main className="mx-auto max-w-3xl px-5 py-16 paragraph-color" dir="rtl">این بخش در حال حاضر فعال نیست.</main>;
  }

  if (loading && !item) {
    return <SpinnerCenter />;
  }
  if (!item) {
    return <main className="mx-auto max-w-3xl px-5 py-16 paragraph-color" dir="rtl">این محتوا در دیتابیس پیدا نشد.</main>;
  }
  return <ContentDetail item={item} />;
}
