import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionUserPublic } from "@/lib/auth-server"
import { getUserActivities, getProfileContentModules } from "@/lib/user-activity"
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers"

export async function GET() {
  const user = await getSessionUserPublic()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) })

  const enabledModules = await getProfileContentModules()

  const [activities, authoredPosts] = await Promise.all([
    getUserActivities(user.id),
    prisma.post.findMany({
      where: { published: true, deletedAt: null, module: { in: enabledModules }, OR: [{ authorId: user.id }, { authorName: user.name }] },
      orderBy: { date: "desc" },
      take: 100,
    }).catch(() => []),
  ])

  return NextResponse.json({
    activities,
    authoredPosts,
    isAuthor: authoredPosts.length > 0 || ["super_admin", "admin", "editor"].includes(user.role),
  }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
}

export const dynamic = "force-dynamic"
