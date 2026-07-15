"use client";
import Image from "next/image";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CardStats } from "@/components/ui/card-stats";
import { AuthorLink } from "@/components/ui/author-link";

export default function BlogGrid({ serverItems }: { serverItems?: ContentItem[] }) {
  const fallbackItems = getModuleItems("blog");
  const { items: dbItems, loading } = useDbPosts("blog", fallbackItems, 100);

  // Prefer server-fetched items when available
  const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;
  
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="blog" title="مجله تکباکس" description={`مقالات تخصصی زیرساخت • ${items.length.toLocaleString("fa-IR")} مطلب`} />
      
      {loading ? (
        <div className="responsive-card-grid-lg grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center gap-2 pt-3">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="responsive-card-grid-lg grid gap-6">
          {items.map((p) => (
            <Card
              key={p.slug}
              className="group h-full gap-0 overflow-hidden p-0 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={p.image || "/assets/blog-1.jpg"}
                    alt={p.title}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 bg-[var(--blog)]/90 text-white border-none"
                  >
                    مقاله
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem] transition-colors group-hover:text-[var(--blog)]">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                    {p.excerpt}
                  </p>
                </CardContent>
              </Link>
              <div className="mt-auto flex items-center justify-between border-t px-4 pb-4 pt-3">
                <div className="flex flex-col gap-1">
                  <AuthorLink name={p.author.name} avatar={p.author.avatar} username={(p.author as any).username} />
                  <div className="text-xs text-muted-foreground">{p.date_fa}</div>
                </div>
                <CardStats module="blog" slug={p.slug} showComments={true} />
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {items.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <CardContent className="space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-semibold">هنوز مقاله‌ای منتشر نشده</h3>
            <p className="text-sm text-muted-foreground">
              به زودی مقالات تخصصی زیرساخت و شبکه منتشر خواهد شد.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
