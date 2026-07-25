import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";

function isAuthorizedCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    const user = await requirePermission("content:*:publish");
    if (user instanceof NextResponse) return user;
  }

  try {
    const now = new Date();
    const scheduled = await prisma.post.findMany({
      where: { status: "scheduled", date: { lte: now } },
      select: { id: true, title: true, module: true, slug: true },
    });
    if (scheduled.length === 0) {
      return NextResponse.json({ ok: true, published: 0, message: "No scheduled posts to publish." });
    }
    const result = await prisma.post.updateMany({
      where: { status: "scheduled", date: { lte: now } },
      data: { status: "published", published: true },
    });
    revalidateTag("home-data", "max");
    revalidatePath("/");
    for (const post of scheduled) revalidatePath(`/${post.module}/${post.slug}`);
    return NextResponse.json({
      ok: true,
      published: result.count,
      posts: scheduled.map((post) => ({ module: post.module, slug: post.slug, title: post.title })),
    });
  } catch (error) {
    console.error("[scheduled]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function GET() {
  const user = await requirePermission("content:*:view");
  if (user instanceof NextResponse) return user;
  try {
    const now = new Date();
    const [readyToPublish, upcoming] = await Promise.all([
      prisma.post.count({ where: { status: "scheduled", date: { lte: now } } }),
      prisma.post.count({ where: { status: "scheduled", date: { gt: now } } }),
    ]);
    return NextResponse.json({ readyToPublish, upcoming });
  } catch (error) {
    console.error("[scheduled]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
