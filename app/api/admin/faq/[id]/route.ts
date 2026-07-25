import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { z } from "zod";

const updateSchema = z.object({
  question: z.string().min(3).max(500).optional(),
  answer: z.string().min(5).max(5000).optional(),
  order: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermission("faq:edit");
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const faq = await prisma.faq.update({
      where: { id },
      data,
    });
    revalidatePath("/about");
    return NextResponse.json(faq);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermission("faq:edit");
  if (user instanceof NextResponse) return user;
  try {
    await prisma.faq.delete({ where: { id } });
    revalidatePath("/about");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
