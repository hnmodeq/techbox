import { prisma } from '../lib/db';
import { gregorianToJalali, formatJalaliDate } from '../lib/jalali';

const timelineEvents = [
  {
    title: 'تولد کامپیوتر الکترونیکی',
    description: 'ساخت اولین کامپیوتر الکترونیکی (ENIAC) در سال 1945 با 18000 لامپ خلاء',
    image: null,
    dateGr: new Date('1945-02-15'),
    importance: 10,
    tags: ['تاریخ', 'کامپیوتر', 'هاردور'],
  },
  {
    title: 'اختراع ترانزیستور',
    description: 'اختراع ترانزیستور در آزمایشگاه بل',
    image: null,
    dateGr: new Date('1947-12-23'),
    importance: 9,
    tags: ['الکترونیکس', 'انقلاب'],
  },
  {
    title: 'کامپیوتر شخصی آپل',
    description: 'معرفی اولین کامپیوتر شخصی Apple I',
    image: null,
    dateGr: new Date('1976-04-01'),
    importance: 9,
    tags: ['اپل', 'کامپیوتر شخصی'],
  },
  {
    title: 'انقلاب IBM PC',
    description: 'معرفی IBM Personal Computer',
    image: null,
    dateGr: new Date('1981-08-12'),
    importance: 9,
    tags: ['IBM', 'رایانه'],
  },
  {
    title: 'سیستم عامل Windows',
    description: 'معرفی Windows 1.0 توسط مایکروسافت',
    image: null,
    dateGr: new Date('1985-11-20'),
    importance: 8,
    tags: ['سیستم عامل', 'مایکروسافت'],
  },
  {
    title: 'سیستم عامل Linux',
    description: 'لینوس تورولدز Linux kernel را منتشر کرد',
    image: null,
    dateGr: new Date('1991-09-17'),
    importance: 8,
    tags: ['Linux', 'متن باز'],
  },
  {
    title: 'جهان شبکه وب',
    description: 'تیم برنرز-لی اولین وب سرور را ایجاد کرد',
    image: null,
    dateGr: new Date('1989-10-01'),
    importance: 10,
    tags: ['وب', 'اینترنت'],
  },
  {
    title: 'موتور جستجوی Google',
    description: 'تاسیس Google توسط لری پیج و سرگی برین',
    image: null,
    dateGr: new Date('1998-09-04'),
    importance: 9,
    tags: ['جستجو', 'Google'],
  },
  {
    title: 'انقلاب گوشی هوشمند',
    description: 'معرفی iPhone اول توسط استیو جابز',
    image: null,
    dateGr: new Date('2007-06-29'),
    importance: 10,
    tags: ['آیفون', 'موبایل'],
  },
  {
    title: 'عصر کامپیوتری ابری',
    description: 'شروع دوران پذیرایی ابری و خدمات SaaS',
    image: null,
    dateGr: new Date('2006-03-14'),
    importance: 8,
    tags: ['ابر', 'کلاود'],
  },
];

async function seedTimeline() {
  console.log('شروع بذرپاشی Timeline');

  for (const event of timelineEvents) {
    const jalali = gregorianToJalali(event.dateGr);
    const dateFa = formatJalaliDate(jalali.year, jalali.month, jalali.day);
    const year = event.dateGr.getFullYear();
    const yearFa = jalali.year;

    try {
      await prisma.timelineEvent.upsert({
        where: { dateGr: event.dateGr },
        update: {},
        create: {
          title: event.title,
          description: event.description,
          image: event.image,
          dateGr: event.dateGr,
          dateFa,
          year,
          yearFa,
          importance: event.importance,
          tags: JSON.stringify(event.tags),
          published: true,
        },
      });
      console.log(`Created: ${event.title}`);
    } catch (error) {
      console.error(`Error creating ${event.title}:`, error);
    }
  }

  console.log('Timeline seed completed');
}

export { seedTimeline };
