"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ModuleSlug } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RelatedPosts({
  module,
  slug,
  tags = [],
  category,
  limit = 6,
}: {
  module: ModuleSlug;
  slug: string;
  tags?: string[];
  category?: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/posts?module=${module}&take=30`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) return;
        const filtered = data
          .filter((p: any) => p.slug !== slug)
          .map((p: any) => ({
            ...p,
            score:
              (tags.length > 0 && p.tags?.some((t: string) => tags.includes(t)) ? 3 : 0) +
              (category && p.category === category ? 1 : 0),
          }))
          .sort((a: any, b: any) => b.score - a.score || b.views - a.views)
          .slice(0, limit);
        setPosts(filtered);
      })
      .catch(() => {});
  }, [module, slug, limit]);

  if (posts.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">مطالب مرتبط</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id || post.slug} href={`/${module}/${post.slug}`} className="group">
            <Card className="overflow-hidden h-full hover:border-primary/30 transition-colors">
              {post.image && (
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardContent className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {post.category && <Badge variant="secondary" className="text-[9px]">{post.category}</Badge>}
                  <span>{post.date_fa || ""}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
