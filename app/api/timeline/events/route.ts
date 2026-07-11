import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUserPublic } from '@/lib/auth-server';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200),
  description: z.string().min(1, 'توضیحات الزامی است').max(2000),
  image: z.string().url().optional().or(z.literal('')),
  dateGr: z.string().min(1),
  dateFa: z.string().min(1),
  year: z.number().int(),
  yearFa: z.number().int(),
  importance: z.number().int().min(1).max(10).default(5),
  tags: z.array(z.string()).max(10).default([]),
});

function isEditorOrAdmin(user: { role: string } | null): boolean {
  return user?.role === 'super_admin' || user?.role === 'editor';
}

export async function GET() {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: { published: true },
      orderBy: {
        dateGr: 'asc',
      },
    });

    if (events && events.length > 0) {
      const transformedEvents = events.map((event: any) => ({
        ...event,
        image: event.image || null,
        tags: typeof event.tags === 'string' ? JSON.parse(event.tags || '[]') : event.tags,
      }));
      return NextResponse.json(transformedEvents);
    }
  } catch (error) {
    // Database table not created or unseeded locally
  }

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!isEditorOrAdmin(user)) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'ساخت رویداد تایم‌لاین نیاز به دسترسی مدیر یا ویراستار دارد.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, description, image, dateGr, dateFa, year, yearFa, importance, tags } = createSchema.parse(body);

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
        tags: JSON.stringify(tags),
        published: true,
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
