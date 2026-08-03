/**
 * Add an idempotent baseline of user-linked timeline engagement.
 *
 * This script intentionally defaults to accounts whose username begins with
 * `community_`: they are TechBox's editorial community personas, so it does
 * not impersonate an organic customer account. To use another approved set,
 * pass an explicit comma-separated allow-list:
 *
 *   --usernames=community_sara,community_pouya
 *
 * Dry-run is the default. Production writes require both --apply and the
 * explicit confirmation environment variable shown below.
 *
 *   TIMELINE_ENGAGEMENT_CONFIRM=production-authorized \
 *     pnpm exec tsx scripts/content/seed-timeline-engagement.ts --apply
 */
import { prisma } from "../checks/_shared";

const APPLY = process.argv.includes("--apply");
const CONFIRMED = process.env.TIMELINE_ENGAGEMENT_CONFIRM === "production-authorized";
const usernamesArg = process.argv.find((value) => value.startsWith("--usernames="));
const allowedUsernames = usernamesArg
  ?.slice("--usernames=".length)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const COMMENTS: Array<{ year: number; text: string }> = [
  {
    year: 1936,
    text: "مدل ماشین تورینگ هنوز هم برای توضیح مرز میان مسئله قابل‌محاسبه و غیرقابل‌محاسبه یکی از روشن‌ترین نقطه‌های شروع است.",
  },
  {
    year: 1947,
    text: "اثر ترانزیستور فقط کوچک‌شدن قطعات نبود؛ قابلیت اطمینان و مصرف انرژی پایین‌تر مسیر ساخت سامانه‌های پیوسته و مقیاس‌پذیر را باز کرد.",
  },
  {
    year: 1969,
    text: "جالب است که نخستین پیام ARPANET کامل ارسال نشد، اما همان آزمایش ناموفق به یکی از مهم‌ترین زیرساخت‌های ارتباطی جهان رسید.",
  },
  {
    year: 1987,
    text: "RAID هنوز هم جای بکاپ را نمی‌گیرد؛ افزونگی برای تداوم سرویس است و نسخه پشتیبان برای بازیابی از حذف، خرابی منطقی و باج‌افزار.",
  },
  {
    year: 1999,
    text: "مجازی‌سازی x86 نسبت استفاده از سخت‌افزار را تغییر داد، اما مهم‌تر از آن جداسازی چرخه عمر سرویس از سرور فیزیکی بود.",
  },
  {
    year: 2006,
    text: "عرضه S3 و EC2 نگاه تیم‌ها به ظرفیت را عوض کرد؛ به‌جای خرید برای اوج بار، زیرساخت کم‌کم به منبعی قابل‌درخواست تبدیل شد.",
  },
  {
    year: 2014,
    text: "کوبِرنیتیز استقرار را استاندارد کرد، ولی بدون مشاهده‌پذیری، محدودیت منابع و فرایند عملیاتی روشن فقط لایه پیچیدگی تازه‌ای اضافه می‌کند.",
  },
  {
    year: 2024,
    text: "بارهای هوش مصنوعی دوباره برق، خنک‌سازی و توپولوژی شبکه را به تصمیم‌های اصلی طراحی دیتاسنتر برگردانده‌اند.",
  },
];

async function main() {
  if (APPLY && !CONFIRMED) {
    throw new Error(
      "Refusing production write. Set TIMELINE_ENGAGEMENT_CONFIRM=production-authorized together with --apply.",
    );
  }

  const users = await prisma.user.findMany({
    where: {
      status: "active",
      ...(allowedUsernames?.length
        ? { username: { in: allowedUsernames } }
        : { username: { startsWith: "community_" } }),
    },
    orderBy: { username: "asc" },
    take: 12,
    select: { id: true, username: true, name: true },
  });

  if (users.length < 4) {
    throw new Error(
      `Need at least 4 approved timeline accounts; found ${users.length}. Pass --usernames=... with an authorized allow-list.`,
    );
  }

  const events = await prisma.timelineEvent.findMany({
    where: { published: true },
    orderBy: { dateGr: "asc" },
    select: { id: true, year: true, title: true },
  });
  if (events.length === 0) throw new Error("No published timeline events found.");

  const eventByYear = new Map(events.map((event) => [event.year, event]));
  const commentPlan = COMMENTS.flatMap((draft, index) => {
    const event = eventByYear.get(draft.year);
    if (!event) return [];
    const user = users[index % users.length];
    return [{ event, user, text: draft.text, index }];
  });

  const likePlan = events.flatMap((event, eventIndex) => {
    // Two or three distinct approved accounts per event, staggered so every
    // card does not show the same synthetic total.
    const wanted = 2 + (eventIndex % 2);
    return Array.from({ length: wanted }, (_, offset) => ({
      event,
      user: users[(eventIndex + offset * 2) % users.length],
    }));
  });

  console.log(`${APPLY ? "APPLY" : "DRY RUN"}: ${users.length} approved users`);
  console.log(`comments: ${commentPlan.length}; likes: ${likePlan.length}; events: ${events.length}`);
  for (const item of commentPlan) {
    console.log(`  comment ${item.event.year} ← @${item.user.username}: ${item.text.slice(0, 55)}…`);
  }

  if (!APPLY) {
    console.log("No rows written. Re-run with --apply and the confirmation variable to apply.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of commentPlan) {
      const id = `tb-timeline-${item.event.year}-${item.index}`;
      await tx.timelineComment.upsert({
        where: { id },
        update: {
          eventId: item.event.id,
          userId: item.user.id,
          authorName: item.user.name,
          text: item.text,
          status: "approved",
        },
        create: {
          id,
          eventId: item.event.id,
          userId: item.user.id,
          authorName: item.user.name,
          text: item.text,
          status: "approved",
        },
      });
    }

    for (const item of likePlan) {
      await tx.timelineLike.upsert({
        where: {
          timeline_fingerprint_eventId: {
            fingerprint: item.user.id,
            eventId: item.event.id,
          },
        },
        update: { userId: item.user.id },
        create: {
          fingerprint: item.user.id,
          userId: item.user.id,
          eventId: item.event.id,
        },
      });
    }
  });

  const [comments, likes] = await Promise.all([
    prisma.timelineComment.count({ where: { status: "approved", event: { published: true } } }),
    prisma.timelineLike.count({ where: { event: { published: true } } }),
  ]);
  console.log(`Applied successfully. Published timeline totals: ${comments} comments, ${likes} likes.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
