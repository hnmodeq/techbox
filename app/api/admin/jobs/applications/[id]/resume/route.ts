import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import {
  fetchSupabaseObject,
  getSupabaseStorageConfig,
  parsePrivateStorageRef,
} from "@/lib/supabase-storage";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

function legacySupabaseUrlIsAllowed(value: string) {
  try {
    const config = getSupabaseStorageConfig();
    const url = new URL(value);
    const expected = new URL(config.url);
    return url.protocol === "https:" && url.hostname === expected.hostname &&
      url.pathname.startsWith(`/storage/v1/object/public/${config.publicBucket}/`);
  } catch {
    return false;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requirePermission("job:applications");
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const application = await prisma.jobApplication.findUnique({
    where: { id },
    select: { resumePath: true, resumeName: true },
  });
  if (!application?.resumePath) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const privateRef = parsePrivateStorageRef(application.resumePath);
    let upstream: Response;
    if (privateRef) {
      upstream = await fetchSupabaseObject(privateRef.bucket, privateRef.path);
    } else if (legacySupabaseUrlIsAllowed(application.resumePath)) {
      // Temporary compatibility for already-migrated public résumés. The
      // migration utility moves these into the private bucket.
      upstream = await fetch(application.resumePath, { cache: "no-store" });
    } else {
      return NextResponse.json(
        { error: "legacy_resume_unavailable" },
        { status: 410, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "storage_error" }, { status: 502, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const safeName = (application.resumeName || "resume")
      .replace(/[^\w.\-]+/g, "_")
      .slice(0, 120) || "resume";
    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error("[resume:download]", error);
    return NextResponse.json({ error: "download_failed" }, { status: 502, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
