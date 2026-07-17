import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

function isEditorOrAdmin(user: { role: string } | null): boolean {
  return user?.role === "super_admin" || user?.role === "editor";
}

const createSchema = z.object({
  question: z.string().min(3, "سوال حداقل ۳ کاراکتر").max(500),
  answer: z.string().min(5, "پاسخ حداقل ۵ کاراکتر").max(5000),
  order: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const user = await getSessionUserPublic();
  if (!isEditorOrAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(faqs);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!isEditorOrAdmin(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const faq = await prisma.faq.create({ data });
    revalidatePath("/about");
    return NextResponse.json(faq, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
