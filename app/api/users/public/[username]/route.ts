import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers"

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const clean = decodeURIComponent(username).toLowerCase()
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: clean }, { name: clean }] },
      select: { id: true, username: true, name: true, role: true, roleFa: true, job: true, avatar: true },
    })
    if (!user) return NextResponse.json(null, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) })
    const authoredCount = await prisma.post.count({ where: { published: true, deletedAt: null, OR: [{ authorId: user.id }, { authorName: user.name }] } })
    const isAuthor = authoredCount > 0 || ["super_admin", "admin", "editor"].includes(user.role)
    return NextResponse.json({ ...user, authoredCount, isAuthor, breadcrumbParent: "حساب کاربری" }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) })
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) })
  }
}

export const dynamic = "force-dynamic"
