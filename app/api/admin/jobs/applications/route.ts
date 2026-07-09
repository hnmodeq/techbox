import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, canEditModule } from "@/lib/auth-server";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  try {
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
