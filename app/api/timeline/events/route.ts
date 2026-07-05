import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { gregorianToJalali, formatJalaliDate } from '@/lib/jalali';
import timelineData from '@/prisma/mock-data/timeline.json';

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
      const transformedEvents = events.map((event, idx) => {
        const fallbackImg = (timelineData as any[])[idx % timelineData.length]?.image || '/assets/blog-1.jpg';
        return {
          ...event,
          image: event.image || fallbackImg,
          tags: typeof event.tags === 'string' ? JSON.parse(event.tags || '[]') : event.tags,
        };
      });
      return NextResponse.json(transformedEvents);
    }
  } catch (error) {
    // Database table not created or unseeded locally
  }

  // Fallback to local JSON timeline data (/data/timeline.json)
  const fallbackOut = (timelineData as any[]).map((ev) => {
    const dateGr = new Date(ev.dateGr);
    const jalali = gregorianToJalali(dateGr);
    const dateFa = formatJalaliDate(jalali.year, jalali.month, jalali.day);
    return {
      id: ev.id,
      title: ev.title,
      description: ev.description,
      image: ev.image,
      dateGr: dateGr.toISOString(),
      dateFa,
      year: dateGr.getFullYear(),
      yearFa: jalali.year,
      importance: ev.importance,
      tags: ev.tags,
      published: true,
      comments: [],
      likes: [],
    };
  });

  return NextResponse.json(fallbackOut);
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
