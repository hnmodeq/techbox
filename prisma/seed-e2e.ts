/**
 * Deterministic fixture data for the E2E suite.
 *
 * Why this exists
 * ---------------
 * The Playwright job used to run with no DATABASE_URL at all. Every Prisma
 * call in the dev server failed with "Error validating datasource `db`: You
 * must provide a nonempty URL", each homepage section caught the error and
 * self-hid, and the page rendered with 3 of 8 sections. Two tests then failed
 * for reasons that had nothing to do with the code under review:
 *
 *   - "renders at least half the sections" → only 3 of the required 4 present.
 *   - "no invisible text in dark mode"     → with no section painting a
 *     background, ~88 elements inherited a transparent parent and the
 *     luminance check compared foreground text against the wrong surface.
 *
 * So the suite was asserting on an empty-database homepage. This seed gives CI
 * a small, realistic dataset so those tests measure the product instead.
 *
 * Fixtures are intentionally minimal — enough rows for every homepage section
 * to clear its "self-hide when empty" guard, and nothing else. Never point
 * this at a database you care about: it truncates the tables it owns.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const now = Date.now();
/** Stable, descending dates so ordering assertions are deterministic. */
const daysAgo = (n: number) => new Date(now - n * 86_400_000);

function post(
  module: string,
  slug: string,
  title: string,
  extra: Record<string, unknown> = {},
  ageDays = 1,
) {
  return {
    module,
    slug,
    title,
    excerpt: `خلاصه آزمایشی برای ${title} — این متن فقط در محیط تست استفاده می‌شود.`,
    content: `<p>محتوای آزمایشی برای ${title}.</p>`,
    image: "/assets/blog-1.jpg",
    authorName: "تحریریه",
    date: daysAgo(ageDays),
    dateFa: "۱۴۰۵/۰۵/۱۲",
    published: true,
    status: "published",
    views: 100 + ageDays,
    ...extra,
  };
}

async function main() {
  if (process.env.E2E_SEED_CONFIRM !== "yes") {
    throw new Error(
      "Refusing to run: set E2E_SEED_CONFIRM=yes. This script deletes rows and is for ephemeral CI databases only.",
    );
  }

  console.log("[seed-e2e] Clearing owned tables...");
  // Order matters: children before parents.
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.siteSetting.deleteMany({});

  console.log("[seed-e2e] Seeding posts...");

  // Magazine (blog) — needs enough rows for the rail.
  await prisma.post.createMany({
    data: [
      post("blog", "raid-guide", "راهنمای کامل RAID برای مهندسان زیرساخت", {}, 1),
      post("blog", "nas-vs-san", "تفاوت NAS و SAN در معماری ذخیره‌سازی", {}, 2),
      post("blog", "zfs-basics", "مبانی ZFS و مدیریت استخر ذخیره‌سازی", {}, 3),
      post("blog", "backup-321", "قاعده ۳-۲-۱ در پشتیبان‌گیری سازمانی", {}, 4),
      post("blog", "ups-sizing", "محاسبه ظرفیت UPS برای رک دیتاسنتر", {}, 5),
      post("blog", "vlan-design", "طراحی VLAN در شبکه‌های سازمانی", {}, 6),
    ],
  });

  // News — powers the ticker and the news band.
  await prisma.post.createMany({
    data: [
      post("news", "new-nas-launch", "معرفی نسل جدید ذخیره‌سازهای شبکه", {}, 1),
      post("news", "cpu-roadmap", "نقشه راه پردازنده‌های سرور اعلام شد", {}, 2),
      post("news", "ssd-prices", "کاهش قیمت حافظه‌های SSD سازمانی", {}, 3),
      post("news", "security-patch", "انتشار وصله امنیتی برای سیستم‌عامل‌های ذخیره‌ساز", {}, 4),
    ],
  });

  // Video / media.
  await prisma.post.createMany({
    data: [
      post("media", "nas-unboxing", "جعبه‌گشایی ذخیره‌ساز شبکه", {
        videoUrl: "https://example.test/video.m3u8",
        videoDuration: "12:30",
      }, 1),
      post("media", "rack-tour", "بازدید از رک دیتاسنتر", {
        videoUrl: "https://example.test/video2.m3u8",
        videoDuration: "08:15",
      }, 2),
      post("media", "cable-management", "مدیریت کابل در رک سرور", {
        videoUrl: "https://example.test/video3.m3u8",
        videoDuration: "06:40",
      }, 3),
    ],
  });

  // Shop — the deals band needs products with live pricing.
  const products = [
    post("shop", "nas-4bay", "ذخیره‌ساز شبکه ۴ بی", {
      priceAmount: 45_000_000,
      priceLabel: "تومان",
      discountPercent: 15,
      discountEndsAt: new Date(now + 7 * 86_400_000),
      availability: "موجود",
      brand: "QNAP",
      specs: { "Drive Bay": "4", CPU: "Intel Celeron", "System Memory": "8 GB", "2.5 Gigabit Ethernet Port": "2 x 2.5GbE" },
      rating: 4.5,
      ratingCount: 12,
    }, 1),
    post("shop", "nas-8bay", "ذخیره‌ساز شبکه ۸ بی", {
      priceAmount: 92_000_000,
      priceLabel: "تومان",
      discountPercent: 10,
      discountEndsAt: new Date(now + 5 * 86_400_000),
      availability: "موجود",
      brand: "Synology",
      specs: { "Drive Bay": "8", CPU: "AMD Ryzen", "System Memory": "16 GB", "10 Gigabit Ethernet Port": "1 x 10GbE" },
      rating: 4.7,
      ratingCount: 8,
    }, 2),
    post("shop", "hdd-enterprise", "Seagate Exos X18 16TB Enterprise HDD", {
      priceAmount: 18_500_000,
      priceLabel: "تومان",
      discountPercent: 20,
      discountEndsAt: new Date(now + 3 * 86_400_000),
      availability: "موجود",
      category: "Enterprise HDD",
      brand: "Seagate",
      model: "ST16000NM000J",
      specs: { "Product Type": "Drive", "Drive Type": "HDD", Capacity: "16 TB", Interface: "SATA 6Gb/s", "Form Factor": "3.5-inch", "Rotational Speed": "7200 RPM", "Workload Rate": "550 TB/year" },
      rating: 4.3,
      ratingCount: 21,
    }, 3),
    post("shop", "ssd-enterprise", "Samsung PM893 1.92TB Enterprise SSD", {
      priceAmount: 24_500_000,
      priceLabel: "تومان",
      availability: "موجود",
      category: "Enterprise SSD",
      brand: "Samsung",
      model: "MZ7L31T9HBLT",
      specs: { "Product Type": "Drive", "Drive Type": "SSD", Capacity: "1.92 TB", Interface: "SATA 6Gb/s", "Form Factor": "2.5-inch 7mm", "Sequential Read": "550 MB/s", DWPD: "1 DWPD" },
      rating: 4.6,
      ratingCount: 9,
    }, 3),
    post("shop", "ups-3kva", "یو‌پی‌اس ۳ کیلوولت‌آمپر", {
      priceAmount: 31_000_000,
      priceLabel: "تومان",
      discountPercent: 12,
      discountEndsAt: new Date(now + 9 * 86_400_000),
      availability: "موجود",
      brand: "APC",
      rating: 4.6,
      ratingCount: 5,
    }, 4),
  ];
  await prisma.post.createMany({ data: products });

  // Reviews must point at a real product — the schema enforces the intent and
  // lib/home-sections filters out orphans, so link them explicitly.
  const nas4 = await prisma.post.findUnique({
    where: { module_slug: { module: "shop", slug: "nas-4bay" } },
    select: { id: true },
  });
  const nas8 = await prisma.post.findUnique({
    where: { module_slug: { module: "shop", slug: "nas-8bay" } },
    select: { id: true },
  });

  await prisma.post.createMany({
    data: [
      post("review", "nas-4bay-review", "نقد و بررسی ذخیره‌ساز ۴ بی", {
        rating: 4.5,
        ratingCount: 10,
        reviewedProductId: nas4?.id ?? null,
      }, 1),
      post("review", "nas-8bay-review", "نقد و بررسی ذخیره‌ساز ۸ بی", {
        rating: 4.2,
        ratingCount: 7,
        reviewedProductId: nas8?.id ?? null,
      }, 2),
    ],
  });

  // Forum — the community band needs topics, one of them solved with an
  // accepted answer, because FeaturedTopic renders that branch.
  await prisma.post.createMany({
    data: [
      post("forum", "raid5-rebuild", "زمان بازسازی RAID 5 چقدر طول می‌کشد؟", { solved: true }, 1),
      post("forum", "switch-stacking", "بهترین روش استک کردن سوییچ‌ها؟", {}, 2),
      post("forum", "backup-strategy", "استراتژی پشتیبان‌گیری برای ۵۰ ترابایت داده", {}, 3),
      post("forum", "vpn-throughput", "افت سرعت در تونل VPN سایت به سایت", {}, 4),
    ],
  });

  const solved = await prisma.post.findUnique({
    where: { module_slug: { module: "forum", slug: "raid5-rebuild" } },
    select: { id: true },
  });

  if (solved) {
    const answer = await prisma.comment.create({
      data: {
        postId: solved.id,
        authorName: "کارشناس شبکه",
        text:
          "زمان بازسازی به ظرفیت دیسک، بار همزمان و نرخ بازسازی کنترلر بستگی دارد. برای دیسک ۱۶ ترابایت معمولاً بین ۲۴ تا ۴۸ ساعت طول می‌کشد.",
        status: "approved",
      },
    });
    await prisma.post.update({
      where: { id: solved.id },
      data: { acceptedCommentId: answer.id },
    });

    await prisma.comment.create({
      data: {
        postId: solved.id,
        authorName: "مدیر سیستم",
        text: "تجربه ما هم همین بود؛ با فعال بودن سرویس‌ها نزدیک ۴۰ ساعت شد.",
        status: "approved",
      },
    });
  }

  // Timeline events.
  await prisma.post.createMany({
    data: [
      post("timeline", "first-hdd", "معرفی نخستین دیسک سخت", {}, 10),
      post("timeline", "ssd-era", "آغاز دوران حافظه‌های حالت جامد", {}, 20),
      post("timeline", "nvme-standard", "استانداردسازی NVMe", {}, 30),
    ],
  });

  // Download module is disabled in production config, but a couple of rows
  // keep the module-config code path honest.
  await prisma.post.createMany({
    data: [
      post("download", "raid-calculator-sheet", "برگه محاسبه RAID", {
        fileName: "raid.xlsx",
        fileUrl: "https://example.test/raid.xlsx",
        fileSize: "24KB",
      }, 5),
    ],
  });

  // Site settings the pages read. The HTML here deliberately includes a
  // <script> tag so the E2E run also proves sanitizeAdminHtml() is wired in
  // on a real render, not just in unit tests.
  await prisma.siteSetting.createMany({
    data: [
      {
        key: "terms.content",
        value:
          "<h2>شرایط همکاری</h2><p>این متن آزمایشی است.</p><script>window.__xss_terms=1</script>",
      },
      {
        key: "about.settings",
        value: JSON.stringify({
          description:
            "<p>تکباکس رسانه تخصصی فناوری اطلاعات است.</p><script>window.__xss_about=1</script>",
        }),
      },
    ],
  });

  const counts = await prisma.post.groupBy({ by: ["module"], _count: true });
  console.log("[seed-e2e] Done:");
  for (const c of counts) console.log(`  ${c.module}: ${c._count}`);
}

main()
  .catch((e) => {
    console.error("[seed-e2e] Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
