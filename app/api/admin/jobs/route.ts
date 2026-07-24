import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, canEditModule } from "@/lib/auth-server";
import { z } from "zod";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const jobSchema = z.object({
  slug: z.string().min(2).max(100),
  title: z.string().min(2).max(200),
  type: z.string().min(2).max(100),
  remote: z.boolean().default(false),
  team: z.string().min(2).max(100),
  excerpt: z.string().max(500),
  description: z.string(),
  positionDescription: z.string().optional(),
  benefits: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  try {
    const jobs = await prisma.job.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });
    return NextResponse.json(jobs, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = jobSchema.parse(body);

    const job = await prisma.job.create({
      data,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_failed", issues: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
