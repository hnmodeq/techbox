import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { sendEmail } from "@/lib/email";
import { renderNewsletterEmail, buildUnsubscribeUrl, type NewsletterItem } from "@/lib/newsletter";
import { formatPostDateFa } from "@/lib/post-date";

/**
 * POST /api/admin/newsletter/digest
 * Auto-generates and sends a weekly digest of top content from the past 7 days.
 */
export async function POST() {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch top content from the past week
    const [topBlog, topNews, topReview, topMedia] = await Promise.all([
      prisma.post.findMany({
        where: { module: "blog", published: true, deletedAt: null, date: { gte: sevenDaysAgo } },
        orderBy: { views: "desc" },
        take: 3,
        select: { slug: true, title: true, excerpt: true, image: true, date: true },
      }),
      prisma.post.findMany({
        where: { module: "news", published: true, deletedAt: null, date: { gte: sevenDaysAgo } },
        orderBy: { views: "desc" },
        take: 5,
        select: { slug: true, title: true, excerpt: true, image: true, date: true },
      }),
      prisma.post.findMany({
        where: { module: "review", published: true, deletedAt: null, date: { gte: sevenDaysAgo } },
        orderBy: { views: "desc" },
        take: 2,
        select: { slug: true, title: true, excerpt: true, image: true, date: true },
      }),
      prisma.post.findMany({
        where: { module: "media", published: true, deletedAt: null, date: { gte: sevenDaysAgo } },
        orderBy: { views: "desc" },
        take: 2,
        select: { slug: true, title: true, excerpt: true, image: true, date: true },
      }),
    ]);

    const allPosts = [
      ...topBlog.map((p) => ({ ...p, module: "blog" as const })),
      ...topNews.map((p) => ({ ...p, module: "news" as const })),
      ...topReview.map((p) => ({ ...p, module: "review" as const })),
      ...topMedia.map((p) => ({ ...p, module: "media" as const })),
    ];

    if (allPosts.length === 0) {
      return NextResponse.json({ error: "no_content_this_week", message: "هیچ محتوای جدیدی در هفته گذشته منتشر نشده." }, { status: 400 });
    }

    // Build newsletter items
    const items: NewsletterItem[] = allPosts.map((p) => ({
      module: p.module,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || null,
      image: p.image || null,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hnmodeq-techbox.vercel.app"}/${p.module}/${p.slug}`,
      dateFa: formatPostDateFa(p.date),
    }));

    const subject = `خلاصه هفته تکباکس — ${new Date().toLocaleDateString("fa-IR", { month: "long", day: "numeric" })}`;

    // Load template
    let headerHtml = "<h1>خلاصه هفته تکباکس</h1><p>مهم‌ترین محتوای این هفته:</p>";
    let footerHtml = "<p>با تشکر از همراهی شما ❤️</p>";

    try {
      const template = await prisma.siteSetting.findUnique({ where: { key: "newsletter.template" } });
      if (template) {
        const tpl = JSON.parse(template.value);
        if (tpl.headerHtml) headerHtml = tpl.headerHtml;
        if (tpl.footerHtml) footerHtml = tpl.footerHtml;
      }
    } catch {}

    // Send to active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
      select: { id: true, email: true, unsubscribeToken: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "no_subscribers" }, { status: 400 });
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      const html = renderNewsletterEmail({
        subject,
        headerHtml,
        footerHtml,
        items,
        unsubscribeUrl: buildUnsubscribeUrl(sub.unsubscribeToken),
        recipientEmail: sub.email,
      });

      try {
        const result = await sendEmail({ to: sub.email, subject, html });
        if (result.success) sent++;
        else failed++;
      } catch {
        failed++;
      }
    }

    // Record campaign
    await prisma.newsletterCampaign.create({
      data: {
        subject,
        headerHtml,
        footerHtml,
        items: items as any,
        recipientCount: subscribers.length,
        status: failed === subscribers.length ? "failed" : "sent",
        sentBy: user.id,
      },
    });

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: subscribers.length,
      contentCount: allPosts.length,
      subject,
    });
  } catch (error: any) {
    console.error("[digest]", error);
    return NextResponse.json({ error: error.message || "digest_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
