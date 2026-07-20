/**
 * Seed random IT job titles for users who don't have one yet.
 * Run: npx tsx prisma/seed-job-titles.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IT_JOB_TITLES = [
  "مهندس شبکه",
  "مدیر زیرساخت",
  "مهندس سیستم",
  "کارشناس امنیت سایبری",
  "مهندس DevOps",
  "مهندس ذخیره‌سازی",
  "مدیر سرور و دیتاسنتر",
  "کارشناس Cloud",
  "مهندس نرم‌افزار",
  "معمار سیستم",
  "مهندس بک‌اند",
  "کارشناس ویرچوالایزیشن",
  "مدیر فناوری اطلاعات",
  "مهندس شبکه‌های سازمانی",
  "کارشناس لینوکس",
  "مهندس امنیت شبکه",
  "کارشناس پشتیبانی فنی",
  "مهندس داده",
  "تحلیلگر سیستم",
  "مهندس تست نفوذ",
];

async function main() {
  const users = await prisma.user.findMany({
    where: { job: null },
    select: { id: true, username: true },
  });

  console.log(`Found ${users.length} users without a job title. Seeding...`);

  for (const user of users) {
    const job = IT_JOB_TITLES[Math.floor(Math.random() * IT_JOB_TITLES.length)];
    await prisma.user.update({
      where: { id: user.id },
      data: { job },
    });
    console.log(`  @${user.username} → ${job}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
