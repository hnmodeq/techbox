import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const schema = z.object({
  message: z.string().min(2, "حداقل ۲ کاراکتر").max(2000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const { id } = await params;
  try {
    const body = schema.parse(await req.json());

    const ticket = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: "not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        authorName: user.name || "پشتیبانی تکباکس",
        authorEmail: user.email,
        authorRole: "admin",
        message: body.message.trim(),
      },
    });

    // Mark ticket as read
    await prisma.contactSubmission.update({
      where: { id },
      data: { status: "read" },
    });

    return NextResponse.json({ ok: true, reply }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: e?.message || "reply_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
