import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["content", "org", "user"]),
  message: z.string().min(10).max(2000),
  phone: z.string().max(20).optional(),
  nationalId: z.string().max(20).optional(),
  modules: z.array(z.string()).optional(),
  orgName: z.string().max(200).optional(),
  orgNationalId: z.string().max(30).optional(),
  orgPosition: z.string().max(200).optional(),
  orgApplicantName: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Allow only one pending request at a time
  const existing = await (prisma as any).verificationRequest.findFirst({
    where: { userId: user.id, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ error: "already_pending" }, { status: 409 });
  }

  const request = await (prisma as any).verificationRequest.create({
    data: {
      userId: user.id,
      type: data.type,
      message: data.message,
      phone: data.phone || null,
      nationalId: data.nationalId || null,
      modules: data.modules || [],
      orgName: data.orgName || null,
      orgNationalId: data.orgNationalId || null,
      orgPosition: data.orgPosition || null,
      orgApplicantName: data.orgApplicantName || null,
    },
  });

  return NextResponse.json({ ok: true, id: request.id });
}

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requests = await (prisma as any).verificationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ requests });
}

export const dynamic = "force-dynamic";
