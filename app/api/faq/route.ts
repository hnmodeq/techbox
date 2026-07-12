import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json([]);
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
