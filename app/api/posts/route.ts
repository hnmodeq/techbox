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

function safeJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
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
        videoUrl: true,
        gallery: true,
        tags: true,
        date: true,
        dateFa: true,
        likes: true,
        views: true,
        rating: true,
        ratingCount: true,
        solved: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        downloadCount: true,
        category: true,
        seoTitle: true,
        seoDescription: true,
        brand: true,
        model: true,
        sku: true,
        priceLabel: true,
        availability: true,
        warranty: true,
        specs: true,
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
      videoUrl: p.videoUrl,
      gallery: safeJsonArray(p.gallery),
      tags: safeJsonArray(p.tags),
      date: p.date.toISOString(),
      date_fa: p.dateFa || new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(p.date),
      dateFa: p.dateFa,
      likes: p.likes,
      views: p.views,
      rating: p.rating ?? null,
      ratingCount: p.ratingCount || 0,
      solved: p.solved ?? false,
      fileName: p.fileName,
      fileUrl: p.fileUrl,
      fileSize: p.fileSize,
      downloadCount: p.downloadCount || 0,
      category: p.category,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      brand: p.brand,
      model: p.model,
      sku: p.sku,
      priceLabel: p.priceLabel,
      availability: p.availability,
      warranty: p.warranty,
      specs: safeJsonObject(p.specs),
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
  videoUrl: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  sku: z.string().optional(),
  priceLabel: z.string().optional(),
  availability: z.string().optional(),
  warranty: z.string().optional(),
  specs: z.record(z.unknown()).default({}),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  fileSize: z.string().optional(),
  downloadCount: z.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = createSchema.parse(await req.json());
  if (!canEditModule(user as any, data.module)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const serialized = {
      ...data,
      gallery: JSON.stringify(data.gallery || []),
      tags: JSON.stringify(data.tags),
      specs: JSON.stringify(data.specs || {}),
      authorId: user.id,
      authorName: user.name,
    };

    const post = await prisma.post.upsert({
      where: { module_slug: { module: data.module, slug: data.slug } },
      update: serialized,
      create: {
        ...serialized,
        dateFa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
