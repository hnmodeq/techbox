import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, canEditModule } from "@/lib/auth-server";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PUBLIC_DETAIL_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import { createPostRevision } from "@/lib/revision";
import { logAudit } from "@/lib/audit-log";
import { createSlugRedirectOnChange } from "@/lib/slug-redirects";
import { formatPostDateFa, publicPostDateWhere } from "@/lib/post-date";
import { getEnabledModules } from "@/lib/module-config";
import { estimateReadingMinutes, formatReadingTime } from "@/lib/reading-time";
import { getCurrencyRates, calculateFinalTomanPrice, type CurrencyCode } from "@/lib/currency";

function normalizeSlug(value: string, fallback: string) {
  const base = (value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return base || `topic-${Date.now().toString(36)}`;
}

async function uniquePostSlug(module: string, desired: string) {
  const base = normalizeSlug(desired, module);
  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await prisma.post.findUnique({
      where: { module_slug: { module, slug } },
      select: { id: true },
    });
    if (!existing) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postModule = searchParams.get("module") || undefined;
  const slug = searchParams.get("slug") || undefined;
  const take = Math.min(parseInt(searchParams.get("take") || "50", 10), 200);
  const includeAllPublishedStates = searchParams.get("published") === "all" || searchParams.get("admin") === "1";

  try {
    let where: any = {
      ...(includeAllPublishedStates ? {} : { published: true, date: publicPostDateWhere() }),
      ...(postModule ? { module: postModule } : {}),
      ...(slug ? { slug } : {}),
      deletedAt: null, // soft delete filter
    };

    // For public queries, only return posts from enabled modules
    if (!includeAllPublishedStates) {
      const enabledModules = await getEnabledModules();
      if (postModule) {
        // If a specific module is requested but it's disabled, return empty
        if (!enabledModules.includes(postModule as any)) {
          return NextResponse.json([], { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
        }
      } else {
        where.module = { in: enabledModules };
      }
    }

    if (includeAllPublishedStates) {
      const user = await getSessionUserPublic();
      if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
      if (postModule) {
        if (!canEditModule(user as any, postModule)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
      } else if (user.role !== "super_admin") {
        const modules = Array.isArray((user as any).modules) ? ((user as any).modules as string[]) : [];
        where = { ...where, module: { in: modules } };
      }
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { date: "desc" },
      take: slug ? 1 : take,
      // Use include (not select) so new columns like priceAmount/discountPercent/discountEndsAt
      // are returned even if the local Prisma client was generated before the schema migration.
      include: {
        author: {
          select: {
            name: true,
            username: true,
            role: true,
            roleFa: true,
            job: true,
            avatar: true,
            verifiedType: true,
            verifiedLabel: true,
          },
        },
      },
    });

    // Calculate final Toman price for shop using current currency rates if source price exists
    let currencyRates: any = null;
    try {
      if (!postModule || postModule === "shop") {
        currencyRates = await getCurrencyRates();
      }
    } catch {}

    const out = posts.map((p: any) => {
      let finalPriceAmount = p.priceAmount ?? null;
      if (p.module === "shop" && (p as any).sourcePriceAmount && (p as any).sourcePriceAmount > 0 && currencyRates) {
        try {
          finalPriceAmount = calculateFinalTomanPrice({
            sourcePrice: (p as any).sourcePriceAmount,
            sourceCurrency: ((p as any).sourceCurrency as CurrencyCode) || "USD",
            productAdjustmentPercent: (p as any).priceAdjustmentPercent ?? 0,
            sellerBenefitPercent: (p as any).sellerBenefitPercent ?? 35,
            rates: currencyRates,
          });
        } catch {}
      }
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
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      date: p.date.toISOString(),
      date_fa: formatPostDateFa(p.date),
      dateFa: formatPostDateFa(p.date),
      likes: p.likes,
      views: p.views,
      comments: 0, // placeholder, filled in below
      rating: p.rating ?? null,
      ratingCount: p.ratingCount || 0,
      readingTime: estimateReadingMinutes(p.title, p.excerpt, p.content),
      readingTimeLabel: formatReadingTime(estimateReadingMinutes(p.title, p.excerpt, p.content)),
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
      priceAmount: finalPriceAmount,
      sourcePriceAmount: (p as any).sourcePriceAmount ?? null,
      sourceCurrency: (p as any).sourceCurrency ?? null,
      priceAdjustmentPercent: (p as any).priceAdjustmentPercent ?? null,
      sellerBenefitPercent: (p as any).sellerBenefitPercent ?? 35,
      discountPercent: p.discountPercent ?? null,
      discountEndsAt: p.discountEndsAt ? p.discountEndsAt.toISOString() : null,
      availability: p.availability,
      warranty: p.warranty,
      specs: (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs)) ? p.specs : {},
      author: {
        name: p.author?.name || p.authorName || "کاربر تکباکس",
        username: p.author?.username || "",
        role: p.author?.roleFa || p.author?.role || "عضو انجمن",
        job: p.author?.job || "",
        avatar: p.author?.avatar || "/assets/hooman.png",
        verifiedType: (p.author as any)?.verifiedType || null,
        verifiedLabel: (p.author as any)?.verifiedLabel || null,
      },
    };
    });

    // Attach comment counts in bulk
    try {
      const postIds = posts.map((p: any) => p.id);
      if (postIds.length > 0) {
        const commentCounts = await prisma.comment.groupBy({
          by: ["postId"],
          _count: { _all: true },
          where: { postId: { in: postIds }, status: "approved" },
        });
        const commentMap = new Map(
          commentCounts.map((c: any) => [c.postId, c._count._all || 0])
        );
        for (const item of out) {
          const post = posts.find((p: any) => p.slug === item.slug);
          if (post) item.comments = commentMap.get(post.id) || 0;
        }
      }
    } catch {
      // Comment counts are non-critical; leave as 0
    }

    return NextResponse.json(slug ? (out[0] ?? null) : out, {
      headers: cacheHeaders(includeAllPublishedStates ? PRIVATE_NO_STORE : (slug ? PUBLIC_DETAIL_CACHE : PUBLIC_CONTENT_CACHE)),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "db_unavailable" }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

const createSchema = z.object({
  module: z.enum(["blog", "news", "media", "review", "tools", "download", "shop", "forum"]),
  slug: z.string().min(2).max(200),
  title: z.string().min(3).max(300),
  excerpt: z.string().max(2000).default(""),
  content: z.string().max(100000).default(""), // Max ~100KB of HTML/Text per post
  image: z.string().max(1000).optional(),
  videoUrl: z.string().max(1000).optional(),
  videoDuration: z.string().max(50).optional(),
  videoMimeType: z.string().max(50).optional(),
  videoFileSize: z.string().max(50).optional(),
  gallery: z.array(z.string().max(1000)).max(20).default([]), // Max 20 images in gallery
  tags: z.array(z.string().max(50)).max(30).default([]), // Max 30 tags
  category: z.string().max(100).optional(),
  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  sku: z.string().max(100).optional(),
  priceLabel: z.string().max(200).optional(),
  priceAmount: z.number().min(0).optional(),
  sourcePriceAmount: z.number().min(0).optional(),
  sourceCurrency: z.string().max(10).optional(),
  priceAdjustmentPercent: z.number().min(-90).max(500).optional(),
  sellerBenefitPercent: z.number().min(0).max(100).optional(),
  discountPercent: z.number().int().min(0).max(99).optional(),
  discountEndsAt: z.string().optional(),
  availability: z.string().max(100).optional(),
  warranty: z.string().max(200).optional(),
  specs: z.record(z.any()).default({}),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).optional(),
  fileName: z.string().max(200).optional(),
  fileUrl: z.string().max(1000).optional(),
  fileSize: z.string().max(50).optional(),
  downloadCount: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  status: z.enum(["draft", "review", "published", "archived"]).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  const data = createSchema.parse(await req.json());
  const canManageModule = canEditModule(user as any, data.module);

  if (!canManageModule && data.module !== "forum") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const dateFa = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date());

    // Normal signed-in users may create forum topics, but they must not get the
    // full editorial upsert surface. Editors/super_admins still use the admin
    // path below for all modules, including forum.
    if (!canManageModule && data.module === "forum") {
      const slug = await uniquePostSlug("forum", data.slug || data.title);
      const content = data.content.trim();
      const excerpt = (data.excerpt || content.slice(0, 180)).trim();

      const post = await prisma.post.create({
        data: {
          module: "forum",
          slug,
          title: data.title.trim(),
          excerpt,
          content,
          tags: (data.tags?.length ? data.tags : ["پرسش"]).slice(0, 10),
          category: data.category || "پرسش",
          authorId: user.id,
          authorName: user.name,
          published: true,
          status: "published",
          dateFa,
        },
      });

      revalidateTag("home-data", "max");
      revalidatePath('/');
      revalidatePath('/forum');
      revalidatePath(`/forum/${slug}`);
      revalidatePath('/sitemap.xml');
      return NextResponse.json(post, { status: 201, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const serialized = {
      ...data,
      gallery: data.gallery || [],
      tags: data.tags,
      specs: data.specs || {},
      priceAmount: data.priceAmount ?? undefined,
      sourcePriceAmount: (data as any).sourcePriceAmount ?? undefined,
      sourceCurrency: (data as any).sourceCurrency ?? undefined,
      priceAdjustmentPercent: (data as any).priceAdjustmentPercent ?? undefined,
      sellerBenefitPercent: (data as any).sellerBenefitPercent ?? 35,
      discountPercent: data.discountPercent ?? undefined,
      discountEndsAt: data.discountEndsAt ? new Date(data.discountEndsAt) : undefined,
      authorId: user.id,
      authorName: user.name,
      published: data.published ?? true,
      status: data.status ?? (data.published ? "published" : "draft"),
    };

    const post = await prisma.post.upsert({
      where: { module_slug: { module: data.module, slug: data.slug } },
      update: serialized,
      create: {
        ...serialized,
        dateFa,
      },
    });
    revalidateTag("home-data", "max");
    revalidatePath('/');
    revalidatePath(`/${data.module}`);
    revalidatePath(`/${data.module}/${data.slug}`);
    revalidatePath('/sitemap.xml');
    logAudit({ userId: user.id, userName: user.name, action: "post.create", target: `${data.module}/${data.slug}`, details: { title: data.title } });
    return NextResponse.json(post, { status: 201, headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}
const patchSchema = z.object({
  module: z.string().min(1).max(40),
  slug: z.string().min(1).max(200),
  title: z.string().max(300).optional(),
  excerpt: z.string().max(2000).optional(),
  content: z.string().max(100000).optional(),
  image: z.string().max(1000).optional(),
  published: z.boolean().optional(),
  status: z.enum(["draft", "review", "published", "archived"]).optional(),
  solved: z.boolean().optional(),
  category: z.string().max(100).optional(),
  newSlug: z.string().min(1).max(200).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
  const body = parsed.data;
  const { module: moduleKey, slug } = body;
  if (!canEditModule(user as any, moduleKey)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  // Find current post (for revision + slug change detection)
  const current = await prisma.post.findUnique({
    where: { module_slug: { module: moduleKey, slug } },
    select: { id: true, title: true, content: true, image: true, slug: true },
  });

  const data: any = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.excerpt === "string") data.excerpt = body.excerpt;
  if (typeof body.content === "string") data.content = body.content;
  if (typeof body.image === "string") data.image = body.image;
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.status === "string" && ["draft", "review", "published", "archived"].includes(body.status)) {
    data.status = body.status;
    data.published = body.status === "published";
  }
  if (typeof body.solved === "boolean") data.solved = body.solved;
  if (typeof body.category === "string") data.category = body.category;

  // Handle slug change → auto-create redirect
  let newSlug = slug;
  if (typeof body.newSlug === "string" && body.newSlug.trim() && body.newSlug !== slug) {
    newSlug = body.newSlug.trim();
    data.slug = newSlug;

    // Create automatic redirect from old slug to new slug
    await createSlugRedirectOnChange({
      module: moduleKey,
      oldSlug: slug,
      newSlug,
      userId: user.id,
    });
  }

  if (!Object.keys(data).length) return NextResponse.json({ error: "nothing_to_update" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });

  // Create revision if important fields changed
  if (current) {
    const changedTitle = body.title && body.title !== current.title;
    const changedContent = body.content && body.content !== current.content;
    const changedImage = body.image && body.image !== current.image;

    if (changedTitle || changedContent || changedImage) {
      await createPostRevision({
        postId: current.id,
        oldTitle: changedTitle ? current.title : undefined,
        oldContent: changedContent ? current.content : undefined,
        oldImage: changedImage ? (current.image ?? undefined) : undefined,
        editedBy: user.id,
      });
    }
  }

  const updated = await prisma.post.update({
    where: { module_slug: { module: moduleKey, slug } },
    data,
  });

  revalidateTag("home-data", "max");
  revalidatePath('/');
  revalidatePath(`/${moduleKey}`);
  revalidatePath(`/${moduleKey}/${slug}`);
  if (newSlug !== slug) {
    revalidatePath(`/${moduleKey}/${newSlug}`);
  }
  revalidatePath('/sitemap.xml');

  // Audit log for publish/unpublish status changes
  if (typeof body.published === "boolean") {
    logAudit({ userId: user.id, userName: user.name, action: body.published ? "post.publish" : "post.unpublish", target: `${moduleKey}/${slug}` });
  } else {
    logAudit({ userId: user.id, userName: user.name, action: "post.update", target: `${moduleKey}/${slug}`, details: { fields: Object.keys(data) } });
  }

  return NextResponse.json(updated, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
  const { searchParams } = new URL(req.url);
  const moduleKey = searchParams.get("module") || "";
  const slug = searchParams.get("slug") || "";
  if (!moduleKey || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  if (!canEditModule(user as any, moduleKey)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const post = await prisma.post.findUnique({ where: { module_slug: { module: moduleKey, slug } }, select: { id: true } });
  if (!post) return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });

  // Soft delete instead of hard delete
  await prisma.post.update({
    where: { id: post.id },
    data: {
      deletedAt: new Date(),
      deletedBy: user.id,
      published: false,
    },
  });

  // Also soft delete related likes/comments (optional but recommended)
  await prisma.like.updateMany({
    where: { module: moduleKey, slug },
    data: { deletedAt: new Date(), deletedBy: user.id },
  });

  revalidateTag("home-data", "max");
  revalidatePath('/');
  revalidatePath(`/${moduleKey}`);
  revalidatePath(`/${moduleKey}/${slug}`);
  revalidatePath('/sitemap.xml');
  logAudit({ userId: user.id, userName: user.name, action: "post.delete", target: `${moduleKey}/${slug}` });
  return NextResponse.json({ ok: true, softDeleted: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
