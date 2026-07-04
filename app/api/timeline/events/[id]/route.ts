import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.timelineEvent.findUnique({
      where: { id },
      include: { comments: { include: { replies: true } }, likes: true },
    });

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      ...event,
      tags: typeof event.tags === 'string' ? JSON.parse(event.tags || '[]') : event.tags,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, image, dateGr, dateFa, year, yearFa, importance, tags } = body;

    const event = await prisma.timelineEvent.update({
      where: { id },
      data: {
        title,
        description,
        image: image || null,
        dateGr: new Date(dateGr),
        dateFa,
        year,
        yearFa,
        importance,
        tags: JSON.stringify(tags || []),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.timelineEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
