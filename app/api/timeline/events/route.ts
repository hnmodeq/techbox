import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/api-permissions';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200),
  description: z.string().min(1, 'توضیحات الزامی است').max(2000),
  image: z.string().url().optional().or(z.literal('')).nullable(),
  dateGr: z.string().min(1),
  dateFa: z.string().min(1),
  year: z.number().int(),
  yearFa: z.number().int(),
  importance: z.number().int().min(1).max(10).default(5),
  tags: z.array(z.string()).max(10).default([]),
  published: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const adminScope = new URL(req.url).searchParams.get('scope') === 'admin';
  if (adminScope) {
    const user = await requirePermission("content:timeline:view");
    if (user instanceof NextResponse) return user;
  }

  try {
    const events = await prisma.timelineEvent.findMany({
      where: adminScope ? undefined : { published: true },
      orderBy: {
        dateGr: 'asc',
      },
      include: {
        comments: {
          where: { status: 'approved' },
          select: { id: true, authorName: true, text: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        likes: { select: { id: true } },
      },
    });

    if (events && events.length > 0) {
      const transformedEvents = events.map((event: any) => ({
        ...event,
        image: event.image || null,
        tags: Array.isArray(event.tags) ? event.tags : [],
        // Stable counts — no 0-during-loading flicker, real from DB.
        likesCount: Array.isArray(event.likes) ? event.likes.length : 0,
        commentsCount: Array.isArray(event.comments) ? event.comments.length : 0,
      }));
      return NextResponse.json(transformedEvents);
    }
  } catch (error) {
    console.error('[timeline:events:list]', error);
    if (adminScope) {
      return NextResponse.json({ error: 'timeline_unavailable' }, { status: 503 });
    }
  }

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("content:timeline:create");
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const { title, description, image, dateGr, dateFa, year, yearFa, importance, tags, published } = createSchema.parse(body);

    const event = await prisma.timelineEvent.create({
      data: {
        title,
        description,
        image: image || null,
        dateGr: new Date(dateGr),
        dateFa,
        year,
        yearFa,
        importance,
        tags,
        published,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: error.errors }, { status: 400 });
    }
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
