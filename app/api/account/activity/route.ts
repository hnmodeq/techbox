import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionUserPublic } from "@/lib/auth-server"
import { getUserActivities, getProfileContentModules } from "@/lib/user-activity"
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers"

export async function GET() {
  const user = await getSessionUserPublic()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) })

  const enabledModules = await getProfileContentModules()
  // "news", "media", "shop" should be strictly author-less.
  const authorModules = enabledModules.filter(m => !["news", "media", "shop"].includes(m))

  const [activities, authoredPosts, savedRecords] = await Promise.all([
    getUserActivities(user.id),
    prisma.post.findMany({
      where: { published: true, deletedAt: null, module: { in: authorModules }, OR: [{ authorId: user.id }, { authorName: user.name }] },
      orderBy: { date: "desc" },
      take: 100,
    }).catch(() => []),
    prisma.savedContent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { module: true, slug: true, createdAt: true }
    }).catch(() => []),
  ])

  let savedPosts: any[] = [];
  if (savedRecords.length > 0) {
    const rawSaved = await prisma.post.findMany({
      where: {
        published: true,
        deletedAt: null,
        OR: savedRecords.map(r => ({ module: r.module, slug: r.slug }))
      },
      select: {
        id: true,
        module: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        date: true,
        category: true,
        authorName: true,
        authorAvatar: true,
        views: true,
        likes: true,
        comments: true,
      }
    }).catch(() => []);
    
    // Maintain chronological sort order of when they were saved
    savedPosts = savedRecords.map(record => {
      const found = rawSaved.find(p => p.module === record.module && p.slug === record.slug);
      if (found) return found;
      
      // Fallback for forum topics or items not found in Post table
      return {
        module: record.module,
        slug: record.slug,
        title: record.module === "forum" ? `موضوع انجمن #${record.slug}` : record.slug,
        excerpt: "",
        image: null,
        date: record.createdAt,
        category: record.module,
        authorName: null,
        authorAvatar: null,
        views: 0,
        likes: 0,
        comments: 0,
      };
    });
  }

  return NextResponse.json({
    activities,
    authoredPosts,
    savedPosts,
    isAuthor: authoredPosts.length > 0 || ["super_admin", "admin", "editor"].includes(user.role),
  }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
}

export const dynamic = "force-dynamic"
