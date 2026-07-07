"use client";
import { useEffect, useMemo, useState } from "react";
import type { ContentItem } from "@/lib/content";
import { ContentCard } from "@/features/content/components/ContentCard";

export default function SuggestionGrid({ current }: { current: ContentItem }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  useEffect(() => {
    fetch('/api/posts?take=100', { cache: 'no-store' }).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setItems(d); }).catch(()=>{});
  }, []);
  const related = useMemo(() => {
    const tags = new Set(current.tags || []);
    return items
      .filter(i => !(i.module === current.module && i.slug === current.slug))
      .map(i => ({ item: i, score: (i.tags || []).filter(t => tags.has(t)).length * 3 + (i.module === current.module ? 1 : 0) }))
      .filter(x => x.score > 0)
      .sort((a,b)=>b.score-a.score)
      .slice(0,6)
      .map(x=>x.item);
  }, [items, current]);
  if (!related.length) return null;
  return <section className="mt-16 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-10"><h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-5">پیشنهادهای مرتبط</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map(r => <ContentCard key={r.module + r.slug} item={r} />)}</div></section>;
}
