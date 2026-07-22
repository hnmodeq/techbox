import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import type { ModuleSlug } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { publicPostDateWhere, formatPostDateFa } from "@/lib/post-date";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Server component that fetches and displays related posts.
 * Uses tag matching + same category + same module for relevance.
 */
export async function RelatedPosts({
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
  const meta = moduleMeta[module];

  let posts: any[] = [];

  try {
    // Strategy: find posts with matching tags, then same category, then recent
    const where: any = {
      module,
      published: true,
      deletedAt: null,
      date: publicPostDateWhere(),
      slug: { not: slug }, // Exclude current post
    };

    // First try: posts with matching tags
    if (tags.length > 0) {
      const tagMatches = await prisma.post.findMany({
        where: {
          ...where,
          tags: { array_overlaps: tags },
        },
        orderBy: { views: "desc" },
        take: limit * 2,
        select: {
          id: true, slug: true, title: true, excerpt: true, image: true,
          date: true, category: true, views: true, author: { select: { name: true } },
        },
      });
      posts = tagMatches;
    }

    // If not enough, add same-category posts
    if (posts.length < limit && category) {
      const catMatches = await prisma.post.findMany({
        where: {
          ...where,
          category,
          id: { notIn: posts.map((p) => p.id) },
        },
        orderBy: { views: "desc" },
        take: limit - posts.length,
        select: {
          id: true, slug: true, title: true, excerpt: true, image: true,
          date: true, category: true, views: true, author: { select: { name: true } },
        },
      });
      posts.push(...catMatches);
    }

    // If still not enough, add recent posts from same module
    if (posts.length < limit) {
      const recent = await prisma.post.findMany({
        where: {
          ...where,
          id: { notIn: posts.map((p) => p.id) },
        },
        orderBy: { date: "desc" },
        take: limit - posts.length,
        select: {
          id: true, slug: true, title: true, excerpt: true, image: true,
          date: true, category: true, views: true, author: { select: { name: true } },
        },
      });
      posts.push(...recent);
    }
  } catch {
    // Fail silently — related posts are non-critical
  }

  if (posts.length === 0) return null;

  // JSON-LD ItemList
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hnmodeq-techbox.vercel.app"}/${module}/${post.slug}`,
    })),
  };

  return (
    <section className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />

      <h2 className="text-lg font-bold">مطالب مرتبط</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, limit).map((post) => (
          <Link key={post.id} href={`/${module}/${post.slug}`} className="group">
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
                  <span>{formatPostDateFa(post.date)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
