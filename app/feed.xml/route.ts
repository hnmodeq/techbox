import { prisma } from "@/lib/db";
import { publicPostDateWhere, formatPostDateFa } from "@/lib/post-date";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://hnmodeq-techbox.vercel.app").replace(/\/$/, "");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteUrl();

  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: {
        published: true,
        deletedAt: null,
        date: publicPostDateWhere(),
        module: { in: ["blog", "news", "review"] },
      },
      orderBy: { date: "desc" },
      take: 50,
      select: {
        module: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        image: true,
        date: true,
        author: { select: { name: true } },
      },
    });
  } catch {
    // Fall back to empty feed
  }

  const items = posts
    .map((post) => {
      const url = `${base}/${post.module}/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      const description = escapeXml(post.excerpt || post.content?.slice(0, 300) || "");
      const author = escapeXml(post.author?.name || "تکباکس");

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <author>${author}</author>
      <pubDate>${pubDate}</pubDate>
      ${post.image ? `<enclosure url="${post.image}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>تکباکس — رسانه تخصصی فناوری اطلاعات</title>
    <link>${base}</link>
    <description>آخرین مقالات، اخبار و بررسی‌های تخصصی زیرساخت، شبکه، سرور، ذخیره‌سازی و امنیت</description>
    <language>fa</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${base}/logo.png</url>
      <title>تکباکس</title>
      <link>${base}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
