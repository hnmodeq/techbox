import Link from "next/link";
import Image from "next/image";
import type { ModuleSlug } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { publicPostDateWhere, formatPostDateFa } from "@/lib/post-date";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModuleBadge } from "@/components/ui/module-badge";

type Props = {
  module: ModuleSlug;
  type: "category" | "tag";
  value: string;
};

export function moduleListingMetadata({ module, type, value }: Props) {
  const meta = moduleMeta[module];
  const label = type === "category" ? "دسته" : "برچسب";
  const title = `${value} — ${meta.titleFa} | تکباکس`;
  const description = `مطالب ${meta.titleFa} با ${label} «${value}» در تکباکس. مقالات، اخبار و محتوای تخصصی ${value}.`;
  return pageMetadata({
    title,
    description,
    path: `/${module}/${type}/${encodeURIComponent(value)}`,
  });
}

export async function ModuleListingPage({ module, type, value }: Props) {
  const meta = moduleMeta[module];

  let posts: any[] = [];
  try {
    const where: any = {
      module,
      published: true,
      deletedAt: null,
      date: publicPostDateWhere(),
    };

    if (type === "category") {
      where.category = value;
    } else {
      // Tag is stored as JSON array, use array_contains
      where.tags = { array_contains: value };
    }

    posts = await prisma.post.findMany({
      where,
      orderBy: { date: "desc" },
      take: 50,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        date: true,
        category: true,
        tags: true,
        views: true,
        author: { select: { name: true } },
      },
    });
  } catch {}

  // Get related categories and tags for this module
  let relatedCategories: string[] = [];
  try {
    const cats = await prisma.post.findMany({
      where: { module, published: true, deletedAt: null, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      take: 20,
    });
    relatedCategories = cats.map((c) => c.category).filter(Boolean) as string[];
  } catch {}

  const base = siteUrl();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8" dir="rtl">
      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${value} — ${meta.titleFa}`,
            description: `مطالب ${meta.titleFa} با ${type === "category" ? "دسته" : "برچسب"} «${value}»`,
            url: `${base}/${module}/${type}/${encodeURIComponent(value)}`,
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "خانه", item: base },
                { "@type": "ListItem", position: 2, name: meta.titleFa, item: `${base}/${module}` },
                { "@type": "ListItem", position: 3, name: value },
              ],
            },
          }).replace(/</g, "\\u003c"),
        }}
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">خانه</Link>
          <span className="text-xs text-muted-foreground">/</span>
          <Link href={meta.href} className="text-xs text-muted-foreground hover:text-foreground">{meta.titleFa}</Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs">{type === "category" ? "دسته" : "برچسب"}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{value}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {posts.length.toLocaleString("fa-IR")} مطلب در {meta.titleFa}
        </p>
      </div>

      {/* Related categories */}
      {relatedCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {relatedCategories.map((cat) => (
            <Link key={cat} href={`/${module}/category/${encodeURIComponent(cat!)}`}>
              <Badge variant={cat === value ? "default" : "outline"} className="cursor-pointer">
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">مطلبی با این {type === "category" ? "دسته" : "برچسب"} پیدا نشد.</p>
          <Link href={meta.href} className="text-primary text-sm hover:underline mt-2 inline-block">
            بازگشت به {meta.titleFa}
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
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
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {post.category && <Badge variant="secondary" className="text-[10px]">{post.category}</Badge>}
                    <span className="text-[10px] text-muted-foreground">{formatPostDateFa(post.date)}</span>
                  </div>
                  <h2 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{post.author?.name}</span>
                    <span>👁 {post.views.toLocaleString("fa-IR")}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
