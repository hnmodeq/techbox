"use client";

import { useEffect, useState } from "react";
import type { ContentItem, ModuleSlug } from "@/lib/content";

type DbPost = ContentItem & {
  id?: string;
  videoUrl?: string | null;
  videoDuration?: string | null;
  videoMimeType?: string | null;
  videoFileSize?: string | null;
  gallery?: string[];
  fileName?: string | null;
  fileUrl?: string | null;
  fileSize?: string | null;
  downloadCount?: number;
  rating?: number | null;
  ratingCount?: number;
  solved?: boolean | null;
};

export function useDbPosts(module: ModuleSlug, _fallback: ContentItem[] = [], take = 100) {
  const [items, setItems] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetch(`/api/posts?module=${encodeURIComponent(module)}&take=${take}`)
      .then((r) => { if (!r.ok) throw new Error("posts_unavailable"); return r.json(); })
      .then((data) => {
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
        setFromDb(true);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
        setFromDb(false);
        setError("db_unavailable");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [module, take]);
  return { items, loading, fromDb, error };
}

export function useDbPost(module: ModuleSlug, slug: string, _fallback: ContentItem | null = null) {
  const [item, setItem] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetch(`/api/posts?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(slug)}`)
      .then((r) => { if (!r.ok) throw new Error("post_unavailable"); return r.json(); })
      .then((data) => {
        if (!mounted) return;
        setItem(data || null);
        setFromDb(Boolean(data));
      })
      .catch(() => {
        if (!mounted) return;
        setItem(null);
        setFromDb(false);
        setError("db_unavailable");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [module, slug]);
  return { item, loading, fromDb, error };
}
