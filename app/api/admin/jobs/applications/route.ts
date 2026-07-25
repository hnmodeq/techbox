import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { getSetting } from "@/lib/settings";
import {
  getSupabaseStorageConfig,
  parsePrivateStorageRef,
  removeSupabaseObjects,
} from "@/lib/supabase-storage";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

function parsePublicSupabaseObject(value: string) {
  try {
    const config = getSupabaseStorageConfig();
    const url = new URL(value);
    if (url.hostname !== new URL(config.url).hostname) return null;
    const prefix = `/storage/v1/object/public/${config.publicBucket}/`;
    if (!url.pathname.startsWith(prefix)) return null;
    return { bucket: config.publicBucket, path: decodeURIComponent(url.pathname.slice(prefix.length)) };
  } catch {
    return null;
  }
}

async function cleanupExpiredApplications() {
  const rawDays = await getSetting("jobs.resume_retention_days");
  const retentionDays = Math.min(Math.max(parseInt(rawDays || "30", 10) || 30, 1), 365);
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const expired = await prisma.jobApplication.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true, resumePath: true },
    take: 100,
  });

  const deletableIds: string[] = [];
  for (const application of expired) {
    try {
      const privateRef = parsePrivateStorageRef(application.resumePath);
      const publicRef = parsePublicSupabaseObject(application.resumePath);
      if (privateRef) await removeSupabaseObjects(privateRef.bucket, [privateRef.path]);
      else if (publicRef) await removeSupabaseObjects(publicRef.bucket, [publicRef.path]);
      // Legacy Vercel objects are no longer under our control. Their retained DB
      // record can still be removed after the configured privacy retention time.
      deletableIds.push(application.id);
    } catch {
      // Keep the row when an active Supabase deletion fails so cleanup can retry.
    }
  }
  if (deletableIds.length > 0) {
    await prisma.jobApplication.deleteMany({ where: { id: { in: deletableIds } } });
  }
}

export async function GET(req: NextRequest) {
  const user = await requirePermission("job:applications");
  if (user instanceof NextResponse) return user;
  const jobId = new URL(req.url).searchParams.get("jobId");

  try {
    await cleanupExpiredApplications();
    const applications = await prisma.jobApplication.findMany({
      where: jobId ? { jobId } : {},
      orderBy: { createdAt: "desc" },
      include: { job: { select: { title: true, slug: true } } },
    });
    const safe = applications.map(({ resumePath: _resumePath, ...rest }) => ({
      ...rest,
      resumeDownloadUrl: `/api/admin/jobs/applications/${rest.id}/resume`,
    }));
    return NextResponse.json(safe, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    console.error("[applications:list]", error);
    return NextResponse.json({ error: "applications_unavailable" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
