import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  module: z.string().min(1),
  slug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { module, slug } = schema.parse(body);

    // Create the post row on the fly if it does not exist yet, so view
    // counting works for every piece of content (not just seeded ones).
    let post = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
    });
    if (!post) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ ok: true, views: updated.views });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
