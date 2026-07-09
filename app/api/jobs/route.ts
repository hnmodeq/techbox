import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(jobs, {
      headers: cacheHeaders(PUBLIC_CONTENT_CACHE)
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message || 'db_unavailable' }, { 
      status: 503,
      headers: cacheHeaders(PRIVATE_NO_STORE)
    });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
