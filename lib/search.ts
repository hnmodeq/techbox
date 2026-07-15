import { prisma } from "@/lib/db";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";

function normalizePersian(text: string): string {
  return text
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/إ/g, "ا")
    .replace(/أ/g, "ا")
    .replace(/آ/g, "ا")
    .toLowerCase();
}

export async function advancedSearch({
  q,
  moduleKey,
  take = 40,
}: {
  q: string;
  moduleKey?: string;
  take?: number;
}) {
  const normalized = normalizePersian(q.trim());
  if (!normalized) return { results: [], count: 0 };

  const words = normalized.split(/\s+/).filter(Boolean).slice(0, 8);

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        deletedAt: null,
        date: publicPostDateWhere(),
        ...(moduleKey && moduleKey !== "all" ? { module: moduleKey } : {}),
        OR: [
          { title: { contains: normalized, mode: "insensitive" } },
          { excerpt: { contains: normalized, mode: "insensitive" } },
          { content: { contains: normalized, mode: "insensitive" } },
          { category: { contains: normalized, mode: "insensitive" } },
          { authorName: { contains: normalized, mode: "insensitive" } },
          ...words.flatMap((word) => [
            { title: { contains: word, mode: "insensitive" as const } },
            { excerpt: { contains: word, mode: "insensitive" as const } },
          ]),
        ],
      },
      include: {
        author: { select: { name: true, username: true, role: true, roleFa: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ date: "desc" }, { views: "desc" }],
      take: Math.min(take * 3, 200),
    });

    const results = posts
      .map((p: any) => {
        const title = normalizePersian(p.title || "");
        const excerpt = normalizePersian(p.excerpt || "");
        const content = normalizePersian(p.content || "");
        const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
        const category = (p.category || "").toLowerCase();
        const author = (p.authorName || "").toLowerCase();

        let score = 0;

        // Title boost (very high)
        if (title.includes(normalized)) score += 100;
        words.forEach((w) => {
          if (title.includes(w)) score += 45;
        });

        // Excerpt boost
        if (excerpt.includes(normalized)) score += 35;
        words.forEach((w) => {
          if (excerpt.includes(w)) score += 15;
        });

        // Tag boost
        if (tags.includes(normalized)) score += 50;
        words.forEach((w) => {
          if (tags.includes(w)) score += 25;
        });

        // Content boost
        if (content.includes(normalized)) score += 20;
        words.forEach((w) => {
          if (content.includes(w)) score += 8;
        });

        // Category / Author
        if (category.includes(normalized)) score += 12;
        if (author.includes(normalized)) score += 10;

        // Popularity boost
        score += Math.min((p.views || 0) / 80, 25);
        score += Math.min((p.likes || 0) / 3, 12);

        return {
          ...p,
          score,
          date: p.date.toISOString(),
          date_fa: formatPostDateFa(p.date),
          author: {
            name: p.author?.name || p.authorName || "",
            username: p.author?.username || "",
            role: p.author?.roleFa || p.author?.role || "",
            avatar: p.author?.avatar || "",
          },
          comments: p._count.comments,
        };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, take)
      .map(({ score, ...rest }: any) => rest);

    return { results, count: results.length };
  } catch (e) {
    console.error("[advancedSearch] error:", e);
    return { results: [], count: 0 };
  }
}
