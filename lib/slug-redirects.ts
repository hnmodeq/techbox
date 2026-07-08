import { prisma } from "@/lib/db";
import type { ModuleSlug } from "@/lib/content";

export type RedirectTarget = { targetModule: string; targetSlug: string };

export async function getSlugRedirect(module: ModuleSlug | string, slug: string): Promise<RedirectTarget | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const redirect = await prisma.slugRedirect.findUnique({
      where: { source_module_slug: { sourceModule: module, sourceSlug: slug } },
      select: { targetModule: true, targetSlug: true },
    });
    return redirect;
  } catch {
    return null;
  }
}

/**
 * Automatically creates a redirect when a post slug changes.
 * This ensures old URLs keep working.
 */
export async function createSlugRedirectOnChange(params: {
  module: string;
  oldSlug: string;
  newSlug: string;
  userId?: string;
}) {
  const { module, oldSlug, newSlug, userId } = params;

  if (!oldSlug || !newSlug || oldSlug === newSlug) {
    return;
  }

  try {
    // Check if redirect already exists
    const existing = await prisma.slugRedirect.findUnique({
      where: {
        source_module_slug: {
          sourceModule: module,
          sourceSlug: oldSlug,
        },
      },
    });

    if (existing) {
      // Update existing redirect to point to new slug
      await prisma.slugRedirect.update({
        where: { id: existing.id },
        data: {
          targetModule: module,
          targetSlug: newSlug,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new redirect
      await prisma.slugRedirect.create({
        data: {
          sourceModule: module,
          sourceSlug: oldSlug,
          targetModule: module,
          targetSlug: newSlug,
          reason: `Slug changed by admin${userId ? ` (${userId})` : ""}`,
        },
      });
    }

    console.log(`[slug-redirect] Created redirect: ${module}/${oldSlug} → ${module}/${newSlug}`);
  } catch (error) {
    console.error("[slug-redirect] Failed to create redirect:", error);
  }
}
