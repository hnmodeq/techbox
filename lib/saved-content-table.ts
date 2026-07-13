import { prisma } from "@/lib/db"

let ensured = false

export async function ensureSavedContentTable() {
  if (ensured) return
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SavedContent" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "module" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SavedContent_user_module_slug_key" ON "SavedContent"("userId", "module", "slug")`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SavedContent_user_created_idx" ON "SavedContent"("userId", "createdAt")`)
  ensured = true
}
