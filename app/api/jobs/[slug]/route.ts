import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cacheHeaders, PUBLIC_DETAIL_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const job = await prisma.job.findFirst({
      where: { slug, active: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { 
        status: 404,
        headers: cacheHeaders(PRIVATE_NO_STORE)
      });
    }

    return NextResponse.json(job, {
      headers: cacheHeaders(PUBLIC_DETAIL_CACHE)
    });
  } catch (error: any) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: error.message || 'db_unavailable' }, { 
      status: 503,
      headers: cacheHeaders(PRIVATE_NO_STORE)
    });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
