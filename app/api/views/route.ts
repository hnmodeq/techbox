import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  module: z.string().min(1),
  slug: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { module, slug } = schema.parse(body);

    const post = await prisma.post.findUnique({
      where: { module_slug: { module, slug } }
    });

    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      select: { views: true }
    });

    return NextResponse.json({ ok: true, views: updated.views });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "invalid request" }, { status: 400 });
  }
}
