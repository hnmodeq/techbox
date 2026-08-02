import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const MAX_NEWS_READ_BATCH = 100;

function parseSlugs(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, MAX_NEWS_READ_BATCH);
}

async function getVisibleNewsSlugs(requestedSlugs: string[]) {
  const posts = await prisma.post.findMany({
    where: {
      module: "news",
      published: true,
      deletedAt: null,
      ...(requestedSlugs.length ? { slug: { in: requestedSlugs } } : {}),
    },
    orderBy: { date: "desc" },
    take: MAX_NEWS_READ_BATCH,
    select: { slug: true },
  });

  return posts.map((post) => post.slug);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUserPublic();
    if (!user) {
      return NextResponse.json(
        { isLoggedIn: false, unreadCount: 0, unreadSlugs: [] },
        { headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedSlugs = parseSlugs(searchParams.get("slugs"));

    // This endpoint is called with the already-rendered public-news list.
    // A second Post query merely to re-validate those identifiers queued
    // behind auth and made the header badge take 10–15 seconds on Neon. A
    // nonexistent slug is harmless here: it is never rendered by the caller
    // and has no read row, so it cannot expose non-public content.
    if (requestedSlugs.length === 0) {
      return NextResponse.json(
        { isLoggedIn: true, unreadCount: 0, unreadSlugs: [] },
        { headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }

    const reads = await prisma.userNewsRead.findMany({
      where: { userId: user.id, slug: { in: requestedSlugs } },
      select: { slug: true },
    });
    const readSlugs = new Set(reads.map((read) => read.slug));
    const unreadSlugs = requestedSlugs.filter((slug) => !readSlugs.has(slug));

    return NextResponse.json(
      { isLoggedIn: true, unreadCount: unreadSlugs.length, unreadSlugs },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "news_read_state_failed", isLoggedIn: false, unreadCount: 0, unreadSlugs: [] },
      { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const bodySlugs = Array.isArray(body?.slugs)
      ? body.slugs.map((slug: unknown) => String(slug).trim()).filter(Boolean).slice(0, MAX_NEWS_READ_BATCH)
      : [];
    const visibleSlugs = await getVisibleNewsSlugs(bodySlugs);
    const readAt = new Date();

    if (visibleSlugs.length > 0) {
      // One createMany plus one updateMany replaces N individual upserts.
      // Opening the News sidebar can mark 15–100 stories at once, and the
      // old transaction queued every one of those statements through Neon.
      await prisma.$transaction([
        prisma.userNewsRead.createMany({
          data: visibleSlugs.map((slug) => ({ userId: user.id, slug, readAt })),
          skipDuplicates: true,
        }),
        prisma.userNewsRead.updateMany({
          where: { userId: user.id, slug: { in: visibleSlugs } },
          data: { readAt },
        }),
      ]);
    }

    return NextResponse.json(
      { ok: true, readCount: visibleSlugs.length, readAt: readAt.toISOString() },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "news_mark_read_failed" },
      { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
