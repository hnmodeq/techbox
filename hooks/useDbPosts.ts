"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentItem, ModuleSlug } from "@/lib/content";

type DbPost = ContentItem & {
  id?: string;
  videoUrl?: string | null;
  gallery?: string[];
  fileName?: string | null;
  fileUrl?: string | null;
  fileSize?: string | null;
  downloadCount?: number;
  rating?: number | null;
  ratingCount?: number;
  solved?: boolean | null;
};

export function useDbPosts(module: ModuleSlug, fallback: ContentItem[], take = 100) {
  const fallbackRef = useRef<ContentItem[]>(fallback);
  useEffect(() => { fallbackRef.current = fallback; });
  const [items, setItems] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/posts?module=${encodeURIComponent(module)}&take=${take}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("posts_unavailable"); return r.json(); })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) { setItems(data); setFromDb(true); }
        else { setItems([]); setFromDb(true); }
      })
      .catch(() => { if (mounted) { setItems(fallbackRef.current as DbPost[]); setFromDb(false); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [module, take]);
  return { items, loading, fromDb };
}

export function useDbPost(module: ModuleSlug, slug: string, fallback: ContentItem | null) {
  const fallbackRef = useRef<ContentItem | null>(fallback);
  useEffect(() => { fallbackRef.current = fallback; });
  const [item, setItem] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/posts?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("post_unavailable"); return r.json(); })
      .then((data) => {
        if (!mounted) return;
        if (data) { setItem(data); setFromDb(true); }
        else { setItem(null); setFromDb(true); }
      })
      .catch(() => { if (mounted) { setItem(fallbackRef.current as DbPost | null); setFromDb(false); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [module, slug]);
  return { item, loading, fromDb };
}
