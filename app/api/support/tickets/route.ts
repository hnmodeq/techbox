import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { verifySupportAccessToken } from "@/lib/support-access";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

function publicTicket(ticket: any) {
  const { accessTokenHash: _accessTokenHash, ...safe } = ticket;
  return safe;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  try {
    if (user) {
      const tickets = await prisma.contactSubmission.findMany({
        where: { email: user.email.toLowerCase(), type: "support" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { replies: { orderBy: { createdAt: "asc" } } },
      });
      return NextResponse.json({ tickets: tickets.map(publicTicket) }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const params = new URL(req.url).searchParams;
    const ticketId = params.get("ticketId");
    const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
    if (!ticketId || !accessToken) {
      return NextResponse.json({ error: "ticket_access_required", tickets: [] }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    const ticket = await prisma.contactSubmission.findFirst({
      where: { id: ticketId, type: "support" },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
    if (!ticket || !verifySupportAccessToken(accessToken, ticket.accessTokenHash)) {
      return NextResponse.json({ error: "forbidden", tickets: [] }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ tickets: [publicTicket(ticket)] }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error) {
    console.error("[support:tickets]", error);
    return NextResponse.json({ error: "tickets_unavailable", tickets: [] }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

const replySchema = z.object({
  ticketId: z.string().min(1),
  accessToken: z.string().min(32).max(200).optional(),
  name: z.string().min(1).max(100),
  message: z.string().min(2, "حداقل ۲ کاراکتر").max(2000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "contact");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  try {
    const body = replySchema.parse(await req.json());
    const user = await getSessionUserPublic();
    const ticket = await prisma.contactSubmission.findFirst({
      where: { id: body.ticketId, type: "support" },
    });
    if (!ticket) {
      return NextResponse.json({ error: "ticket_not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    const ownsSessionTicket = Boolean(user && user.email.toLowerCase() === ticket.email.toLowerCase());
    const hasCapability = verifySupportAccessToken(body.accessToken, ticket.accessTokenHash);
    if (!ownsSessionTicket && !hasCapability) {
      return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    if (ticket.status === "closed") {
      return NextResponse.json({ error: "ticket_closed" }, { status: 409, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    await prisma.contactSubmission.update({
      where: { id: body.ticketId },
      data: { status: "read" },
    });
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: body.ticketId,
        authorName: user?.name || body.name.trim(),
        authorEmail: user?.email || ticket.email,
        authorRole: "user",
        message: body.message.trim(),
      },
    });
    return NextResponse.json({ ok: true, reply }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    console.error("[support:reply]", error);
    return NextResponse.json({ error: "خطا در ثبت پاسخ" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
