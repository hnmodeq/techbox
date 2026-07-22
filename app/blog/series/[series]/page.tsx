import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { publicPostDateWhere, formatPostDateFa } from "@/lib/post-date";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ series: string }> };

export async function generateMetadata({ params }: Props) {
  const { series } = await params;
  const name = decodeURIComponent(series);
  return pageMetadata({
    title: `${name} — مجموعه مقالات | تکباکس`,
    description: `مجموعه مقالات «${name}» در تکباکس. مقالات تخصصی فناوری اطلاعات.`,
    path: `/blog/series/${encodeURIComponent(name)}`,
  });
}

export default async function BlogSeriesPage({ params }: Props) {
  const { series } = await params;
  const name = decodeURIComponent(series);

  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: {
        module: "blog",
        published: true,
        deletedAt: null,
        series: name,
        date: publicPostDateWhere(),
      },
      orderBy: { seriesOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        date: true,
        seriesOrder: true,
        views: true,
        author: { select: { name: true } },
      },
    });
  } catch {}

  const base = siteUrl();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8" dir="rtl">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${name} — مجموعه مقالات تکباکس`,
            numberOfItems: posts.length,
            itemListElement: posts.map((post, idx) => ({
              "@type": "ListItem",
              position: post.seriesOrder || idx + 1,
              url: `${base}/blog/${post.slug}`,
              name: post.title,
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />

      <PageBreadcrumb items={[
        { label: "خانه", href: "/" },
        { label: "مجله آنلاین", href: "/blog" },
        { label: `مجموعه: ${name}` },
      ]} />

      <div>
        <Badge variant="secondary" className="mb-2">مجموعه مقالات</Badge>
        <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {posts.length.toLocaleString("fa-IR")} بخش
        </p>
      </div>

      {posts.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">مقاله‌ای در این مجموعه پیدا نشد.</p>
          <Link href="/blog" className="text-primary text-sm hover:underline mt-2 inline-block">بازگشت به مجله</Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                <div className="flex gap-4 p-4">
                  {/* Order number */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {post.seriesOrder || idx + 1}
                  </div>
                  {/* Image */}
                  {post.image && (
                    <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden bg-muted hidden sm:block">
                      <Image src={post.image} alt={post.title} fill sizes="96px" className="object-cover" />
                    </div>
                  )}
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                      <span>{formatPostDateFa(post.date)}</span>
                      <span>{post.author?.name}</span>
                      <span>👁 {post.views.toLocaleString("fa-IR")}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
