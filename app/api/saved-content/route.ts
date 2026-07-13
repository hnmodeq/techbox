import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionUserPublic } from "@/lib/auth-server"
import { ensureSavedContentTable } from "@/lib/saved-content-table"
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers"

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic()
  if (!user) return NextResponse.json({ saved: false, items: [] }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
  await ensureSavedContentTable()
  const { searchParams } = new URL(req.url)
  const moduleKey = searchParams.get("module")
  const slug = searchParams.get("slug")
  if (moduleKey && slug) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT "id" FROM "SavedContent" WHERE "userId"=$1 AND "module"=$2 AND "slug"=$3 LIMIT 1`,
      user.id,
      moduleKey,
      slug
    )
    return NextResponse.json({ saved: (rows as Array<{ id: string }>).length > 0 }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
  }
  const rows = await prisma.$queryRawUnsafe(
    `SELECT "module", "slug", "createdAt" FROM "SavedContent" WHERE "userId"=$1 ORDER BY "createdAt" DESC LIMIT 100`,
    user.id
  )
  return NextResponse.json({ items: rows as Array<{ module: string; slug: string; createdAt: Date }> }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) })
  await ensureSavedContentTable()
  const body = await req.json().catch(() => ({}))
  const moduleKey = String(body.module || "")
  const slug = String(body.slug || "")
  if (!moduleKey || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) })
  const existing = await prisma.$queryRawUnsafe(
    `SELECT "id" FROM "SavedContent" WHERE "userId"=$1 AND "module"=$2 AND "slug"=$3 LIMIT 1`,
    user.id,
    moduleKey,
    slug
  )
  const existingRows = existing as Array<{ id: string }>
  if (existingRows.length > 0) {
    await prisma.$executeRawUnsafe(`DELETE FROM "SavedContent" WHERE "id"=$1`, existingRows[0].id)
    return NextResponse.json({ saved: false }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
  }
  await prisma.$executeRawUnsafe(
    `INSERT INTO "SavedContent" ("id", "userId", "module", "slug") VALUES ($1, $2, $3, $4) ON CONFLICT ("userId", "module", "slug") DO NOTHING`,
    crypto.randomUUID(),
    user.id,
    moduleKey,
    slug
  )
  return NextResponse.json({ saved: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
}

export const dynamic = "force-dynamic"
