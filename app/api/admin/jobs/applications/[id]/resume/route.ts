import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, canEditModule } from "@/lib/auth-server";
import { isSafeRemoteUrl } from "@/lib/url-safety";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

// Only proxy downloads from our own Blob host. The value is set by our own
// apply route, but we never trust a stored URL blindly for a server-side fetch.
const BLOB_HOSTS = ["gasy0aqpxehqiy8d.public.blob.vercel-storage.com"];

/**
 * GET /api/admin/jobs/applications/[id]/resume
 *
 * Streams an applicant's resume to an authorized staff member WITHOUT ever
 * exposing the underlying public Blob URL to the browser. This keeps the
 * unguessable-but-public storage URL out of browser history, referrers,
 * screenshots, and any client-side leak.
 *
 * NOTE (free-tier limitation): the Blob object itself is still stored publicly
 * (Vercel Blob free tier forces public access). This proxy removes the URL from
 * the client surface and gates access behind a permission check. True privacy
 * requires private Blob storage + signed URLs (paid tier).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const { id } = await params;
  const application = await prisma.jobApplication.findUnique({
    where: { id },
    select: { resumeUrl: true, resumeName: true },
  });

  if (!application || !application.resumeUrl) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  // Defense-in-depth: only fetch from our known Blob host.
  if (!isSafeRemoteUrl(application.resumeUrl, { allowHosts: BLOB_HOSTS })) {
    return NextResponse.json({ error: "invalid_storage_url" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const upstream = await fetch(application.resumeUrl, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "storage_error" }, { status: 502, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    // Sanitize the filename for the Content-Disposition header.
    const safeName = (application.resumeName || "resume")
      .replace(/[^\w.\-]+/g, "_")
      .slice(0, 120) || "resume";

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="${safeName}"`);
    headers.set("Cache-Control", "private, no-store");

    // Stream the upstream body straight through — don't buffer the whole file.
    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "download_failed" }, { status: 502, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
