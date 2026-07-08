import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

const URL_FIELDS = ["image", "videoUrl", "fileUrl"] as const;

type UrlStatus = { field: string; url: string; ok: boolean; status?: number; error?: string };

function safeJsonArray(value: string | null | undefined): string[] {
  try { const p = JSON.parse(value || "[]"); return Array.isArray(p) ? p : []; } catch { return []; }
}

function isHttpUrl(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

async function checkUrl(url: string): Promise<Omit<UrlStatus, "field" | "url">> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(7000) });
    if (res.ok) return { ok: true, status: res.status };
    // Some object stores disallow HEAD; try a tiny GET before marking broken.
    const getRes = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, cache: "no-store", signal: AbortSignal.timeout(7000) });
    return { ok: getRes.ok, status: getRes.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || "request_failed" };
  }
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const checkUrls = searchParams.get("checkUrls") === "1";

  try {
    const [posts, users, redirects] = await Promise.all([
      prisma.post.findMany({ orderBy: [{ module: "asc" }, { date: "desc" }], include: { _count: { select: { comments: true } } } }),
      prisma.user.findMany({ orderBy: { username: "asc" }, select: { id: true, username: true, name: true, avatar: true, role: true } }),
      prisma.slugRedirect.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const postIssues = posts.map((post: any) => {
      const issues: string[] = [];
      const gallery = safeJsonArray(post.gallery);
      if (!post.title?.trim()) issues.push("missing_title");
      if (!post.excerpt?.trim()) issues.push("missing_excerpt");
      if (!post.authorId && !post.authorName?.trim()) issues.push("missing_author");
      if (["blog", "news", "review", "media", "shop", "forum"].includes(post.module) && !post.image) issues.push("missing_image");
      if (post.module === "media" && !post.videoUrl) issues.push("missing_videoUrl");
      if (post.module === "download" && !post.fileUrl) issues.push("missing_fileUrl");
      if (post.module === "download" && !post.fileName) issues.push("missing_fileName");
      if (post.module === "download" && !post.fileSize) issues.push("missing_fileSize");
      if (post.module === "review" && typeof post.rating !== "number") issues.push("missing_rating");
      if (post.module === "shop" && gallery.length === 0) issues.push("missing_gallery");
      if (!post.content?.trim()) issues.push("missing_content");
      return {
        id: post.id,
        module: post.module,
        slug: post.slug,
        title: post.title,
        issues,
        image: post.image,
        videoUrl: post.videoUrl,
        fileUrl: post.fileUrl,
        comments: post._count.comments,
        likes: post.likes,
        views: post.views,
      };
    });

    const userIssues = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      issues: [!u.avatar ? "missing_avatar" : null, !u.name ? "missing_name" : null].filter(Boolean),
    }));

    let urlStatuses: Array<UrlStatus & { module?: string; slug?: string; title?: string }> = [];
    if (checkUrls) {
      const targets: Array<{ field: string; url: string; module?: string; slug?: string; title?: string }> = [];
      for (const post of posts as any[]) {
        for (const field of URL_FIELDS) {
          const url = post[field];
          if (isHttpUrl(url)) targets.push({ field, url: url!, module: post.module, slug: post.slug, title: post.title });
        }
        for (const url of safeJsonArray(post.gallery)) if (isHttpUrl(url)) targets.push({ field: "gallery", url, module: post.module, slug: post.slug, title: post.title });
      }
      for (const user of users) if (isHttpUrl(user.avatar)) targets.push({ field: "avatar", url: user.avatar!, module: "user", slug: user.username, title: user.name });
      const limited = targets.slice(0, 250);
      urlStatuses = await Promise.all(limited.map(async (t) => ({ ...t, ...(await checkUrl(t.url)) })));
    }

    const brokenUrls = urlStatuses.filter((u) => !u.ok);
    return NextResponse.json({
      summary: {
        posts: posts.length,
        users: users.length,
        redirects: redirects.length,
         postsWithIssues: postIssues.filter((p: any) => p.issues.length).length,
         usersWithIssues: userIssues.filter((u: any) => u.issues.length).length,
        checkedUrls: urlStatuses.length,
        brokenUrls: brokenUrls.length,
      },
      postIssues,
      userIssues,
      urlStatuses,
      redirects,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "content_health_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
