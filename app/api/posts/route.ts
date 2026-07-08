import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, canEditModule } from "@/lib/auth-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PUBLIC_DETAIL_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

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
  const take = Math.min(parseInt(searchParams.get("take") || "50", 10), 200);
  const includeAllPublishedStates = searchParams.get("published") === "all" || searchParams.get("admin") === "1";

  try {
    let where: any = {
      ...(includeAllPublishedStates ? {} : { published: true }),
      ...(postModule ? { module: postModule } : {}),
      ...(slug ? { slug } : {}),
    };

    if (includeAllPublishedStates) {
      const user = await getSessionUser();
      if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
      if (postModule) {
        if (!canEditModule(user as any, postModule)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
      } else if (user.role !== "super_admin") {
        let modules: string[] = [];
        try { modules = JSON.parse((user as any).modules || "[]"); } catch {}
        where = { ...where, module: { in: modules } };
      }
    }

    const posts = await prisma.post.findMany({
      where,
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
        videoDuration: true,
        videoMimeType: true,
        videoFileSize: true,
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
        published: true,
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
            username: true,
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
      videoDuration: p.videoDuration,
      videoMimeType: p.videoMimeType,
      videoFileSize: p.videoFileSize,
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
      published: p.published,
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
        username: p.author?.username || "",
        role: p.author?.roleFa || p.author?.role || "عضو انجمن",
        avatar: p.author?.avatar || "/assets/hooman.png",
      },
    }));

    return NextResponse.json(slug ? (out[0] ?? null) : out, {
      headers: cacheHeaders(includeAllPublishedStates ? PRIVATE_NO_STORE : (slug ? PUBLIC_DETAIL_CACHE : PUBLIC_CONTENT_CACHE)),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "db_unavailable" }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
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
  videoDuration: z.string().optional(),
  videoMimeType: z.string().optional(),
  videoFileSize: z.string().optional(),
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
  published: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  const data = createSchema.parse(await req.json());
  if (!canEditModule(user as any, data.module)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
  try {
    const serialized = {
      ...data,
      gallery: JSON.stringify(data.gallery || []),
      tags: JSON.stringify(data.tags),
      specs: JSON.stringify(data.specs || {}),
      authorId: user.id,
      authorName: user.name,
      published: data.published ?? true,
    };

    const post = await prisma.post.upsert({
      where: { module_slug: { module: data.module, slug: data.slug } },
      update: serialized,
      create: {
        ...serialized,
        dateFa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
      },
    });
    revalidatePath('/');
    revalidatePath(`/${data.module}`);
    revalidatePath(`/${data.module}/${data.slug}`);
    revalidatePath('/sitemap.xml');
    return NextResponse.json(post, { status: 201, headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}


export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  const body = await req.json();
  const moduleKey = String(body.module || "");
  const slug = String(body.slug || "");
  if (!moduleKey || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  if (!canEditModule(user as any, moduleKey)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const data: any = {};
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.solved === "boolean") data.solved = body.solved;
  if (!Object.keys(data).length) return NextResponse.json({ error: "nothing_to_update" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const updated = await prisma.post.update({ where: { module_slug: { module: moduleKey, slug } }, data });
  revalidatePath('/');
  revalidatePath(`/${moduleKey}`);
  revalidatePath(`/${moduleKey}/${slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json(updated, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  const { searchParams } = new URL(req.url);
  const moduleKey = searchParams.get("module") || "";
  const slug = searchParams.get("slug") || "";
  if (!moduleKey || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  if (!canEditModule(user as any, moduleKey)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const post = await prisma.post.findUnique({ where: { module_slug: { module: moduleKey, slug } }, select: { id: true } });
  if (!post) return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  await prisma.like.deleteMany({ where: { module: moduleKey, slug } });
  await prisma.post.delete({ where: { id: post.id } });
  revalidatePath('/');
  revalidatePath(`/${moduleKey}`);
  revalidatePath(`/${moduleKey}/${slug}`);
  revalidatePath('/sitemap.xml');
  return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
