import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionUserPublic } from "@/lib/auth-server"
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers"
import { z } from "zod"

// NOTE: SavedContent is a real Prisma model (see prisma/schema.prisma). We use
// the model's typed query methods instead of raw SQL so the runtime app DB
// credential never needs DDL/schema privileges, and inputs are validated.

const moduleSlugSchema = z.object({
  module: z.string().min(1).max(40),
  slug: z.string().min(1).max(200),
})

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic()
  if (!user) return NextResponse.json({ saved: false, items: [] }, { headers: cacheHeaders(PRIVATE_NO_STORE) })

  const { searchParams } = new URL(req.url)
  const moduleKey = searchParams.get("module")
  const slug = searchParams.get("slug")

  if (moduleKey && slug) {
    const parsed = moduleSlugSchema.safeParse({ module: moduleKey, slug })
    if (!parsed.success) return NextResponse.json({ saved: false }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
    const row = await prisma.savedContent.findUnique({
      where: {
        SavedContent_user_module_slug_key: { userId: user.id, module: parsed.data.module, slug: parsed.data.slug },
      },
      select: { id: true },
    })
    return NextResponse.json({ saved: !!row }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
  }

  const rows = await prisma.savedContent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { module: true, slug: true, createdAt: true },
  })
  return NextResponse.json({ items: rows }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) })

  const body = await req.json().catch(() => ({}))
  const parsed = moduleSlugSchema.safeParse({ module: body?.module, slug: body?.slug })
  if (!parsed.success) {
    return NextResponse.json({ error: "module+slug required" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) })
  }
  const { module: moduleKey, slug } = parsed.data

  const existing = await prisma.savedContent.findUnique({
    where: {
      SavedContent_user_module_slug_key: { userId: user.id, module: moduleKey, slug },
    },
    select: { id: true },
  })

  if (existing) {
    await prisma.savedContent.delete({ where: { id: existing.id } })
    return NextResponse.json({ saved: false }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
  }

  await prisma.savedContent.create({
    data: { userId: user.id, module: moduleKey, slug },
  })
  return NextResponse.json({ saved: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) })
}

export const dynamic = "force-dynamic"
