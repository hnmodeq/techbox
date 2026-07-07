import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, canEditModule } from "@/lib/auth-server";
import { z } from "zod";

function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postModule = searchParams.get("module") || undefined;
  const slug = searchParams.get("slug") || undefined;
  const take = Math.min(parseInt(searchParams.get("take") || "50", 10), 100);

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(postModule ? { module: postModule } : {}),
        ...(slug ? { slug } : {}),
      },
      orderBy: { date: "desc" },
      take: slug ? 1 : take,
      select: {
        id: true,
        slug: true,
        module: true,
        title: true,
        excerpt: true,
        content: true,
        image: true,
        tags: true,
        date: true,
        dateFa: true,
        likes: true,
        views: true,
        solved: true,
        fileSize: true,
        category: true,
        authorName: true,
        author: {
          select: {
            name: true,
            role: true,
            roleFa: true,
            avatar: true,
          },
        },
      },
    });

    const out = posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      module: p.module,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      image: p.image,
      tags: safeJsonArray(p.tags),
      date: p.date.toISOString(),
      date_fa: p.dateFa || new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(p.date),
      dateFa: p.dateFa,
      likes: p.likes,
      views: p.views,
      solved: p.solved ?? false,
      fileSize: p.fileSize,
      category: p.category,
      author: {
        name: p.author?.name || p.authorName || "کاربر تکباکس",
        role: p.author?.roleFa || p.author?.role || "عضو انجمن",
        avatar: p.author?.avatar || "/assets/hooman.png",
      },
    }));

    return NextResponse.json(slug ? (out[0] ?? null) : out);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "db_unavailable" }, { status: 503 });
  }
}

const createSchema = z.object({
  module: z.enum(["blog", "news", "media", "review", "tools", "download", "shop", "forum"]),
  slug: z.string().min(2),
  title: z.string().min(3),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = createSchema.parse(await req.json());
  if (!canEditModule(user as any, data.module)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const post = await prisma.post.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        authorId: user.id,
        authorName: user.name,
        dateFa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e: any) {
    if (String(e.message).includes("Unique")) return NextResponse.json({ error: "slug exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
