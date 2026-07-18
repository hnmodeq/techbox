import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { ensureSiteSettingsTable } from "@/lib/site-settings-table";
import { publicPostDateWhere } from "@/lib/post-date";
import { formatPostDateFa } from "@/lib/post-date";
import {
  DEFAULT_NEWSLETTER_HEADER,
  DEFAULT_NEWSLETTER_FOOTER,
  DEFAULT_NEWSLETTER_SUBJECT,
} from "@/lib/newsletter";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const TEMPLATE_KEYS = ["newsletter.header_html", "newsletter.footer_html", "newsletter.default_subject"];

async function getTemplate() {
  try {
    await ensureSiteSettingsTable();
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: TEMPLATE_KEYS } } });
    const map: Record<string, string> = {
      "newsletter.header_html": DEFAULT_NEWSLETTER_HEADER,
      "newsletter.footer_html": DEFAULT_NEWSLETTER_FOOTER,
      "newsletter.default_subject": DEFAULT_NEWSLETTER_SUBJECT,
    };
    for (const r of rows) map[r.key] = r.value;
    return {
      headerHtml: map["newsletter.header_html"],
      footerHtml: map["newsletter.footer_html"],
      subject: map["newsletter.default_subject"],
    };
  } catch {
    return {
      headerHtml: DEFAULT_NEWSLETTER_HEADER,
      footerHtml: DEFAULT_NEWSLETTER_FOOTER,
      subject: DEFAULT_NEWSLETTER_SUBJECT,
    };
  }
}

async function requireSuperAdmin() {
  const user = await getSessionUserPublic();
  return user && user.role === "super_admin" ? user : null;
}

export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const [news, subscriberCount, campaigns, template] = await Promise.all([
      prisma.post.findMany({
        where: { module: "news", published: true, deletedAt: null, date: publicPostDateWhere() },
        orderBy: { date: "desc" },
        take: 40,
        select: { id: true, slug: true, title: true, excerpt: true, image: true, date: true, dateFa: true },
      }),
      prisma.newsletterSubscriber.count({ where: { active: true } }),
      prisma.newsletterCampaign.findMany({ orderBy: { sentAt: "desc" }, take: 20 }),
      getTemplate(),
    ]);

    const latestNews = news.map((n) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      image: n.image,
      url: `${base}/news/${n.slug}`,
      dateFa: n.dateFa || formatPostDateFa(n.date),
    }));

    return NextResponse.json(
      { latestNews, subscriberCount, template, campaigns },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
