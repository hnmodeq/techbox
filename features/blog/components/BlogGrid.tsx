"use client";
import Image from "next/image";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CardStats } from "@/components/ui/card-stats";

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
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block"
            >
              <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
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
                <CardContent className="p-4 flex flex-col h-[calc(100%-16rem)]">
                  <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem] transition-colors group-hover:text-[var(--blog)]">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mt-2 flex-1">
                    {p.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={p.author.avatar} alt={p.author.name} />
                        <AvatarFallback className="text-xs">
                          {p.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <div className="font-medium">{p.author.name}</div>
                        <div className="text-muted-foreground">{p.date_fa}</div>
                      </div>
                    </div>
                    <CardStats module="blog" slug={p.slug} showComments={true} />
                  </div>
                </CardContent>
              </Card>
            </Link>
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
