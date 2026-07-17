import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const submitSchema = z.object({
  items: z.array(z.object({ slug: z.string(), title: z.string() })).min(1).max(50),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();

  try {
    const body = await req.json();
    const parsed = submitSchema.parse(body);

    const request = await prisma.consultationRequest.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || null,
        userEmail: user?.email || null,
        items: parsed.items,
        notes: parsed.notes || null,
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, id: request.id });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to submit consultation request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const requests = await prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || !["pending", "contacted", "quoted", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await prisma.consultationRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
