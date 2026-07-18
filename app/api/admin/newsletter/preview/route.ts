import { NextRequest, NextResponse } from "next/server";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";
import { renderNewsletterEmail, buildUnsubscribeUrl, type NewsletterItem } from "@/lib/newsletter";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

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
  items: z.array(itemSchema).max(40),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const body = schema.parse(await req.json());
    const html = renderNewsletterEmail({
      subject: body.subject,
      headerHtml: body.headerHtml,
      footerHtml: body.footerHtml,
      items: body.items as NewsletterItem[],
      unsubscribeUrl: buildUnsubscribeUrl("preview-token"),
      recipientEmail: "preview@example.com",
    });
    return NextResponse.json({ html }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: e?.message || "preview_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
