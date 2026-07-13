import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheHeaders, PUBLIC_CONTENT_CACHE } from "@/lib/cache-headers"
import { HERO_MAGIC_DEFAULTS } from "@/lib/hero-magic-settings"
import { ensureSiteSettingsTable } from "@/lib/site-settings-table"

export async function GET() {
  try {
    await ensureSiteSettingsTable()
    const keys = Object.keys(HERO_MAGIC_DEFAULTS)
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
    const settings: Record<string, string> = { ...HERO_MAGIC_DEFAULTS }
    for (const row of rows) settings[row.key] = row.value
    return NextResponse.json(settings, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) })
  } catch {
    return NextResponse.json(HERO_MAGIC_DEFAULTS, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) })
  }
}
