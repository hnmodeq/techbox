import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { gregorianToJalali, formatJalaliDate } from '@/lib/jalali';

export async function GET() {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: { published: true },
      include: {
        comments: {
          include: {
            replies: true,
          },
        },
        likes: true,
      },
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, image, dateGr, dateFa, year, yearFa, importance, tags } = body;

    const event = await prisma.timelineEvent.create({
      data: {
        title,
        description,
        image: image || null,
        dateGr: new Date(dateGr),
        dateFa,
        year,
        yearFa,
        importance: importance || 5,
        tags: JSON.stringify(tags || []),
        published: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
