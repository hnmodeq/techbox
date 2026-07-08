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
