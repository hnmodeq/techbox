import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { gregorianToJalali, formatJalaliDate } from '@/lib/jalali';

const fallbackTimelineEvents = [
  {
    id: 'tl-1',
    title: 'تولد کامپیوتر الکترونیکی (ENIAC)',
    description: 'ساخت اولین کامپیوتر الکترونیکی همه‌منظوره (ENIAC) در سال ۱۹۴۵ میلادی با بیش از ۱۸,۰۰۰ لامپ خلاء و وزنی حدود ۳۰ تن.',
    image: null,
    dateGr: new Date('1945-02-15'),
    importance: 10,
    tags: ['تاریخ', 'کامپیوتر', 'سخت‌افزار'],
  },
  {
    id: 'tl-2',
    title: 'اختراع ترانزیستور در آزمایشگاه بل',
    description: 'اختراع ترانزیستور توسط جان باردین، والتر براتین و ویلیام شاکلی؛ نقطه آغازین انقلاب دیجیتال و الکترونیک مدرن.',
    image: null,
    dateGr: new Date('1947-12-23'),
    importance: 9,
    tags: ['الکترونیک', 'انقلاب دیجیتال'],
  },
  {
    id: 'tl-3',
    title: 'معرفی کامپیوتر Apple I',
    description: 'معرفی و عرضه اولین کامپیوتر شخصی شرکت اپل طراحی‌شده توسط استیو وازنیئک و استیو جابز.',
    image: null,
    dateGr: new Date('1976-04-01'),
    importance: 9,
    tags: ['اپل', 'کامپیوتر شخصی'],
  },
  {
    id: 'tl-4',
    title: 'انقلاب استاندارد IBM PC',
    description: 'معرفی IBM 5150 Personal Computer که به استاندارد صنعتی کامپیوترهای شخصی مبتنی بر معماری x86 تبدیل شد.',
    image: null,
    dateGr: new Date('1981-08-12'),
    importance: 9,
    tags: ['IBM', 'سخت‌افزار', 'x86'],
  },
  {
    id: 'tl-5',
    title: 'معرفی رابط گرافیکی Windows 1.0',
    description: 'عرضه اولین نسخه از محیط گرافیکی مایکروسافت ویندوز که آغازگر تحول رابط کاربری در کامپیوترهای خانگی و اداری شد.',
    image: null,
    dateGr: new Date('1985-11-20'),
    importance: 8,
    tags: ['سیستم‌عامل', 'مایکروسافت'],
  },
  {
    id: 'tl-6',
    title: 'تولد هسته لینوکس (Linux Kernel)',
    description: 'لینوس توروالدز انتشار نسخه اولیه هسته لینوکس را اعلام کرد که به بزرگ‌ترین اکوسیستم متن‌باز جهان تبدیل شد.',
    image: null,
    dateGr: new Date('1991-09-17'),
    importance: 10,
    tags: ['لینوکس', 'متن‌باز', 'سیستم‌عامل'],
  },
  {
    id: 'tl-7',
    title: 'تولد شبکه وب جهانی (World Wide Web)',
    description: 'تیم برنرز-لی در سرن (CERN) اولین وب‌سرور، پروتکل HTTP و زبان HTML را برای اشتراک اطلاعات جهانی ابداع کرد.',
    image: null,
    dateGr: new Date('1989-10-01'),
    importance: 10,
    tags: ['وب', 'اینترنت', 'پروتکل'],
  },
  {
    id: 'tl-8',
    title: 'تأسیس موتور جستجوی گوگل',
    description: 'تأسیس رسمی شرکت Google توسط لری پیج و سرگی برین با الگوریتم PageRank برای سازماندهی اطلاعات وب.',
    image: null,
    dateGr: new Date('1998-09-04'),
    importance: 9,
    tags: ['جستجو', 'گوگل', 'الگوریتم'],
  },
  {
    id: 'tl-9',
    title: 'معرفی اولین گوشی آیفون',
    description: 'معرفی اولین نسل iPhone توسط استیو جابز با رابط چندلمسی (Multi-Touch) که صنعت موبایل را بازتعریف کرد.',
    image: null,
    dateGr: new Date('2007-06-29'),
    importance: 10,
    tags: ['آیفون', 'موبایل', 'تکنولوژی'],
  },
  {
    id: 'tl-10',
    title: 'آغاز عصر پردازش ابری (AWS EC2 & S3)',
    description: 'راه‌اندازی سرویس‌های ابری آمازون (AWS) که آغازگر دوران زیرساخت به‌عنوان سرویس (IaaS) و ابری شدن دیتاسنترها شد.',
    image: null,
    dateGr: new Date('2006-03-14'),
    importance: 9,
    tags: ['پردازش ابری', 'زیرساخت', 'دیتاسنتر'],
  },
];

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
      const transformedEvents = events.map((event) => ({
        ...event,
        tags: typeof event.tags === 'string' ? JSON.parse(event.tags || '[]') : event.tags,
      }));
      return NextResponse.json(transformedEvents);
    }
  } catch (error) {
    // Database table not created or unseeded locally
  }

  // Fallback to rich historical timeline data
  const fallbackOut = fallbackTimelineEvents.map((ev) => {
    const jalali = gregorianToJalali(ev.dateGr);
    const dateFa = formatJalaliDate(jalali.year, jalali.month, jalali.day);
    return {
      id: ev.id,
      title: ev.title,
      description: ev.description,
      image: ev.image,
      dateGr: ev.dateGr.toISOString(),
      dateFa,
      year: ev.dateGr.getFullYear(),
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
