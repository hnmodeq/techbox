import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCircuit } from "@/lib/db-circuit";

/**
 * The terms body, for the in-page dialog.
 *
 * Same SiteSetting row app/terms/page.tsx renders. Cached for a day: this is
 * static legal copy, and the dialog can be opened from the homepage, so an
 * uncached query here would land on the connection pool every time someone
 * clicked the link.
 */
export const revalidate = 86400;

export async function GET() {
  try {
    const row = await withCircuit(() =>
      prisma.siteSetting.findUnique({ where: { key: "terms.content" } }),
    );
    return NextResponse.json(
      { content: row?.value ?? "" },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    // Never fail the dialog over this — it renders an empty-state instead.
    return NextResponse.json({ content: "" });
  }
}
