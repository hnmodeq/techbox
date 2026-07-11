import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, canEditModule } from "@/lib/auth-server";
import { getSetting } from "@/lib/settings";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

async function cleanupExpiredApplications() {
  const rawDays = await getSetting("jobs.resume_retention_days");
  const retentionDays = Math.min(Math.max(parseInt(rawDays || "30", 10) || 30, 1), 365);
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const expired = await prisma.jobApplication.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true, resumeUrl: true },
    take: 100,
  });

  if (expired.length === 0) return;

  const deletableIds: string[] = [];
  for (const application of expired) {
    if (!application.resumeUrl) {
      deletableIds.push(application.id);
      continue;
    }

    try {
      await del(application.resumeUrl);
      deletableIds.push(application.id);
    } catch {
      // Keep the DB row when blob deletion fails, so a later admin request can
      // retry the cleanup instead of losing the only pointer to the resume file.
    }
  }

  if (deletableIds.length > 0) {
    await prisma.jobApplication.deleteMany({ where: { id: { in: deletableIds } } });
  }
}

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  try {
    await cleanupExpiredApplications();

    const applications = await prisma.jobApplication.findMany({
      where: jobId ? { jobId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: { title: true, slug: true }
        }
      }
    });
    return NextResponse.json(applications, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
