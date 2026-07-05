"use client";
import { useEffect, useState } from "react";
import { type ContentItem } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";

export default function SuggestionGrid({ current }: { current: ContentItem }) {
  const [related, setRelated] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Fetch related via the posts API filtered by module
    fetch(`/api/posts?take=10`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (!mounted) return;
        const filtered = data
          .filter((p: any) => p.slug !== current.slug)
          .slice(0, 6);
        setRelated(filtered);
      })
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [current.slug]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-16 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-10">
      <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-5">پیشنهاد مرتبط از همه ماژول‌ها</h3>
      <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mb-4">
        بر اساس برچسب‌ها: {(current.tags || []).map(t=>`#${t}`).join(" ")}
      </p>
      {loading ? (
        <p className="text-center paragraph-color py-4 animate-pulse">در حال بارگذاری...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r: any) => (
            <ContentCard key={r.module + r.slug} item={r} />
          ))}
        </div>
      )}
    </section>
  );
}