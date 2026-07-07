"use client";

import { useEffect, useState } from "react";
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
  const [items, setItems] = useState<DbPost[]>(fallback as DbPost[]);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/posts?module=${encodeURIComponent(module)}&take=${take}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("posts_unavailable");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          setFromDb(true);
        } else {
          setItems(fallback as DbPost[]);
          setFromDb(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setItems(fallback as DbPost[]);
        setFromDb(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [module, take, fallback]);

  return { items, loading, fromDb };
}

export function useDbPost(module: ModuleSlug, slug: string, fallback: ContentItem | null) {
  const [item, setItem] = useState<DbPost | null>(fallback as DbPost | null);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/posts?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("post_unavailable");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setItem(data);
          setFromDb(true);
        } else {
          setItem(fallback as DbPost | null);
          setFromDb(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setItem(fallback as DbPost | null);
        setFromDb(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [module, slug, fallback]);

  return { item, loading, fromDb };
}
