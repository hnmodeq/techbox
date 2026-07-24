import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, canEditModule } from "@/lib/auth-server";
import { z } from "zod";

const jobSchema = z.object({
  slug: z.string().min(2).max(100).optional(),
  title: z.string().min(2).max(200).optional(),
  type: z.string().min(2).max(100).optional(),
  remote: z.boolean().optional(),
  team: z.string().min(2).max(100).optional(),
  excerpt: z.string().max(500).optional(),
  description: z.string().optional(),
  positionDescription: z.string().optional(),
  benefits: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const data = jobSchema.parse(body);

    const job = await prisma.job.update({
      where: { id },
      data,
    });

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
