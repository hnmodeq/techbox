import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUserPublic } from '@/lib/auth-server';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  image: z.string().url().optional().or(z.literal('')).nullable(),
  dateGr: z.string().min(1).optional(),
  dateFa: z.string().min(1).optional(),
  year: z.number().int().optional(),
  yearFa: z.number().int().optional(),
  importance: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()).max(10).optional(),
  published: z.boolean().optional(),
});

function isEditorOrAdmin(user: { role: string } | null): boolean {
  return user?.role === 'super_admin' || user?.role === 'editor';
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.timelineEvent.findUnique({
      where: { id },
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserPublic();
  if (!isEditorOrAdmin(user)) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'ویرایش رویداد تایم‌لاین نیاز به دسترسی مدیر یا ویراستار دارد.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const event = await prisma.timelineEvent.update({
      where: { id },
      data: {
        ...parsed,
        image: parsed.image === '' ? null : parsed.image,
        dateGr: parsed.dateGr ? new Date(parsed.dateGr) : undefined,
        tags: parsed.tags ? JSON.stringify(parsed.tags) : undefined,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUserPublic();
  if (!isEditorOrAdmin(user)) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'حذف رویداد تایم‌لاین نیاز به دسترسی مدیر یا ویراستار دارد.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await prisma.timelineEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
