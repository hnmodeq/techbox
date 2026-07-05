import { prisma } from '../lib/db';
import { gregorianToJalali, formatJalaliDate } from '../lib/jalali';
import timelineData from './mock-data/timeline.json';

async function seedTimeline() {
  console.log('شروع بذرپاشی Timeline با داده‌های تخصصی دیتاسنتر');

  for (const event of timelineData as any[]) {
    const dateGr = new Date(event.dateGr);
    const jalali = gregorianToJalali(dateGr);
    const dateFa = formatJalaliDate(jalali.year, jalali.month, jalali.day);
    const year = dateGr.getFullYear();
    const yearFa = jalali.year;

    try {
      await prisma.timelineEvent.upsert({
        where: { dateGr },
        update: {},
        create: {
          title: event.title,
          description: event.description,
          image: event.image,
          dateGr,
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
