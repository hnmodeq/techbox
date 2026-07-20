/**
 * Seed random IT job titles for ALL users, overwriting any existing value.
 * Run: pnpm db:seed-job-titles
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
    select: { id: true, username: true, job: true },
  });

  console.log(`Updating job titles for all ${users.length} users...`);

  for (const user of users) {
    const job = IT_JOB_TITLES[Math.floor(Math.random() * IT_JOB_TITLES.length)];
    await prisma.user.update({
      where: { id: user.id },
      data: { job },
    });
    console.log(`  @${user.username}  ${user.job ?? "(none)"} → ${job}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
