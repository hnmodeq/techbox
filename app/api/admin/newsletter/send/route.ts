import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { sendEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";
import { renderNewsletterEmail, buildUnsubscribeUrl, type NewsletterItem } from "@/lib/newsletter";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import { captureAuthError } from "@/lib/sentry";

const itemSchema = z.object({
  module: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  url: z.string(),
  dateFa: z.string().nullable().optional(),
});

const schema = z.object({
  subject: z.string().min(1).max(200),
  headerHtml: z.string(),
  footerHtml: z.string(),
  items: z.array(itemSchema).min(1, "حداقل یک مورد انتخاب کنید").max(40),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const body = schema.parse(await req.json());
    const items = body.items as NewsletterItem[];

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
      select: { id: true, email: true, unsubscribeToken: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "هیچ عضو فعالی برای ارسال وجود ندارد." }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    let sent = 0;
    let failed = 0;

    // Send sequentially to be gentle on the Resend API and to keep concurrency
    // within Vercel function limits. For very large lists this should move to a
    // background queue, but for now (small subscriber base) this is fine.
    for (const sub of subscribers) {
      const html = renderNewsletterEmail({
        subject: body.subject,
        headerHtml: body.headerHtml,
        footerHtml: body.footerHtml,
        items,
        unsubscribeUrl: buildUnsubscribeUrl(sub.unsubscribeToken),
        recipientEmail: sub.email,
      });
      try {
        const result = await sendEmail({
          to: sub.email,
          subject: body.subject,
          html,
        });
        if (result.success) sent += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }

    // Record the campaign for history.
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: body.subject,
        headerHtml: body.headerHtml,
        footerHtml: body.footerHtml,
        items: items as any,
        recipientCount: subscribers.length,
        status: failed === subscribers.length ? "failed" : "sent",
        sentBy: user.id,
      },
    });

    logAudit({ userId: user.id, userName: user.name, action: "newsletter.send", details: { subject: body.subject, sent, failed, total: subscribers.length } });

    return NextResponse.json(
      { ok: true, sent, failed, total: subscribers.length, campaignId: campaign.id },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    captureAuthError(e, "newsletter_send");
    return NextResponse.json({ error: e?.message || "send_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
