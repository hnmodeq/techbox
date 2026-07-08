import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeQuery(q: string) {
  return q.trim().replace(/\s+/g, " ").slice(0, 120);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = normalizeQuery(searchParams.get("q") || "");
  const moduleKey = searchParams.get("module") || undefined;
  const take = Math.min(Math.max(Number(searchParams.get("take") || 40), 1), 100);

  if (!q) return NextResponse.json({ q, results: [], count: 0 }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });

  const words = q.split(" ").filter(Boolean).slice(0, 6);

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(moduleKey && moduleKey !== "all" ? { module: moduleKey } : {}),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { tags: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { authorName: { contains: q, mode: "insensitive" } },
          ...words.flatMap((word) => [
            { title: { contains: word, mode: "insensitive" as const } },
            { excerpt: { contains: word, mode: "insensitive" as const } },
            { tags: { contains: word, mode: "insensitive" as const } },
            { category: { contains: word, mode: "insensitive" as const } },
          ]),
        ],
      },
      include: {
        author: { select: { name: true, username: true, role: true, roleFa: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ date: "desc" }, { views: "desc" }],
      take,
    });

    const lower = q.toLowerCase();
    const results = posts
      .map((p) => {
        const tags = safeJsonArray(p.tags);
        const haystack = `${p.title} ${p.excerpt} ${p.content} ${tags.join(" ")} ${p.category || ""} ${p.authorName}`.toLowerCase();
        const exactTitle = p.title.toLowerCase().includes(lower) ? 40 : 0;
        const exactText = haystack.includes(lower) ? 20 : 0;
        const wordScore = words.reduce((sum, word) => sum + (haystack.includes(word.toLowerCase()) ? 5 : 0), 0);
        const score = exactTitle + exactText + wordScore + Math.min(p.views || 0, 1000) / 1000;
        return {
          id: p.id,
          slug: p.slug,
          module: p.module,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          image: p.image,
          videoUrl: p.videoUrl,
          videoDuration: p.videoDuration,
          videoMimeType: p.videoMimeType,
          videoFileSize: p.videoFileSize,
          gallery: safeJsonArray(p.gallery),
          tags,
          date: p.date.toISOString(),
          date_fa: p.dateFa,
          likes: p.likes,
          views: p.views,
          comments: p._count.comments,
          rating: p.rating,
          ratingCount: p.ratingCount,
          solved: p.solved,
          fileName: p.fileName,
          fileUrl: p.fileUrl,
          fileSize: p.fileSize,
          downloadCount: p.downloadCount,
          category: p.category,
          brand: p.brand,
          model: p.model,
          sku: p.sku,
          priceLabel: p.priceLabel,
          availability: p.availability,
          warranty: p.warranty,
          specs: safeJsonObject(p.specs),
          author: {
            name: p.author?.name || p.authorName,
            username: p.author?.username || "",
            role: p.author?.roleFa || p.author?.role || "",
            avatar: p.author?.avatar || "",
          },
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...item }) => item);

    return NextResponse.json({ q, results, count: results.length }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "search_failed", q, results: [], count: 0 }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 60;
