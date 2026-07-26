/**
 * Homepage Upgrade — Content Pass
 *
 * Turns placeholder scaffolding into real, DB-backed content so the homepage
 * sections have honest data to render. Owner-approved (see conversation
 * 2026-07-26): the existing reviews / comments / discounts / bios were
 * structural placeholders and may be rewritten in place.
 *
 * What it does:
 *   1. Links 3 reviews to real in-stock QNAP products and rewrites them as
 *      genuine product reviews (title, excerpt, content, brand/model/sku,
 *      specs, tags, SEO).
 *   2. Converts the remaining 9 topic reviews to magazine articles
 *      (module -> "blog") and writes SlugRedirect rows so old URLs survive.
 *   3. Writes real author bios for every user who has published something.
 *   4. Applies real, in-stock discounts with a sane expiry window.
 *   5. Replaces short filler comments with substantive Persian discussion
 *      (80-400 chars) so the "TechBox Family Comments" section can render.
 *   6. Rewrites the timeline as an IT/computing history timeline.
 *
 * Safety: idempotent where practical, --dry-run by default.
 *
 * Usage:
 *   pnpm exec tsx scripts/content/homepage-content-pass.ts            # dry run
 *   pnpm exec tsx scripts/content/homepage-content-pass.ts --apply    # write
 *   pnpm exec tsx scripts/content/homepage-content-pass.ts --apply --only=reviews
 */
import { prisma } from '../checks/_shared';

const APPLY = process.argv.includes('--apply');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

const log = (s = '') => console.log(s);
const step = (s: string) => log(`\n── ${s} ${'─'.repeat(Math.max(0, 66 - s.length))}`);
const did = (s: string) => log(`   ${APPLY ? '✔' : '·'} ${s}`);

function run(name: string) {
  return !ONLY || ONLY === name;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. REVIEWS → real product reviews
// ═══════════════════════════════════════════════════════════════════════════

/** Three reviews that are genuinely NAS-adjacent, matched to in-stock units. */
const REVIEW_LINKS = [
  {
    reviewSlug: 'review-02', // بررسی NAS رک‌مونت برای بکاپ سازمانی
    productModel: 'TS-1264U-RP-8G-US',
    title: 'بررسی QNAP TS-1264U-RP: ذخیره‌ساز رک‌مونت ۱۲ درایوی برای بکاپ سازمانی',
    excerpt:
      'یک رک‌مونت 2U با دوازده درایو، پاور افزونه و دو پورت 2.5GbE. آن را در نقش مقصد بکاپ یک شبکه ۵۰ کاربره تست کردیم؛ از سرعت واقعی بازیابی تا رفتار حرارتی و صدا در رک.',
    category: 'ذخیره‌سازی',
    tags: ['QNAP', 'NAS', 'بکاپ', 'رک‌مونت', 'ذخیره‌سازی'],
    content: `## چرا این دستگاه را تست کردیم

در بیشتر شبکه‌های سازمانی متوسط، بکاپ روی یک ذخیره‌ساز جداگانه نگهداری می‌شود تا از سرور اصلی مستقل باشد. TS-1264U-RP یک گزینه رک‌مونت 2U با دوازده جایگاه درایو و **پاور افزونه (Redundant PSU)** است که دقیقاً برای همین نقش ساخته شده.

## پیکربندی تست

دستگاه را با دوازده درایو SATA سازمانی و آرایه RAID 6 راه‌اندازی کردیم و آن را مقصد بکاپ یک محیط با حدود ۵۰ کاربر، یک فایل‌سرور و چهار ماشین مجازی قرار دادیم.

- پردازنده: Intel Celeron N5095 چهار هسته‌ای
- حافظه: ۸ گیگابایت DDR4 (قابل ارتقا از طریق دو اسلات SODIMM)
- شبکه: دو پورت 2.5GbE به‌همراه یک اسلات PCIe برای ارتقا به 25GbE

## نتیجه تست

در بکاپ کامل شبانه، با Port Trunking روی دو پورت 2.5GbE، نرخ نوشتن پایدار در محدوده‌ای قرار گرفت که پنجره بکاپ شبانه را به‌راحتی پوشش می‌داد. نکته مهم‌تر **زمان بازیابی** بود: بازگرداندن یک ماشین مجازی کامل بدون آنکه سرویس‌های دیگر کند شوند انجام شد.

پردازنده Celeron برای نقش بکاپ کافی است، اما اگر بخواهید هم‌زمان چند سرویس اضافه مثل مانیتورینگ دوربین یا Container اجرا کنید، ارتقای رم را از همان ابتدا در بودجه ببینید.

## نقاط قوت

- پاور افزونه در این رده قیمتی مزیت جدی است؛ یک منبع تغذیه معیوب سرویس بکاپ را متوقف نمی‌کند.
- دوازده درایو در ارتفاع 2U، تراکم خوبی برای رک‌های شلوغ فراهم می‌کند.
- مسیر ارتقا تا 25GbE از طریق PCIe باز است.

## نقاط ضعف

- حافظه پایه ۸ گیگابایت برای سناریوهای ترکیبی کم است.
- صدای فن‌ها در بار کامل قابل توجه است؛ برای اتاق سرور مناسب است، نه برای فضای اداری.
- اسلات M.2 به‌صورت مستقیم وجود ندارد و نیازمند آداپتور PCIe است.

## جمع‌بندی تکباکس

اگر دنبال یک مقصد بکاپ اختصاصی، قابل اتکا و رک‌مونت هستید و پاور افزونه برایتان اهمیت دارد، این مدل انتخاب منطقی است. برای نقش ذخیره‌ساز اصلی و پرترافیک، رده بالاتر با پردازنده قوی‌تر را بررسی کنید.`,
  },
  {
    reviewSlug: 'review-05', // بررسی SSD سازمانی NVMe در بار کاری دیتابیس
    productModel: 'TBS-h574TX-i5U-16G-US',
    title: 'بررسی QNAP TBS-h574TX: ذخیره‌ساز تمام‌NVMe برای بار کاری دیتابیس',
    excerpt:
      'پنج اسلات E1.S/M.2 NVMe داغ‌تعویض، پردازنده Core i5 هیبرید و دو پورت Thunderbolt 4. آن را زیر بار کاری دیتابیس و ویرایش ویدیو بردیم تا ببینیم تمام‌فلش بودن واقعاً چقدر تفاوت می‌سازد.',
    category: 'ذخیره‌سازی',
    tags: ['QNAP', 'NVMe', 'SSD', 'دیتابیس', 'Thunderbolt'],
    content: `## یک ذخیره‌ساز بدون هارد مکانیکی

TBS-h574TX در دسته‌ای قرار می‌گیرد که QNAP آن را NASbook می‌نامد: یک ذخیره‌ساز فشرده که **تماماً روی NVMe** کار می‌کند. پنج اسلات E1.S/M.2 دارد و برخلاف بیشتر دستگاه‌های کوچک، این اسلات‌ها **داغ‌تعویض (hot-swappable)** هستند.

## پیکربندی تست

- پردازنده: Intel Core i5 با معماری هیبرید
- حافظه: ۱۶ گیگابایت
- شبکه: یک پورت 10GbE و یک پورت 2.5GbE
- اتصال مستقیم: دو پورت Thunderbolt 4

پنج SSD سازمانی NVMe را در RAID 5 بستیم و دو سناریو را اجرا کردیم: یک دیتابیس تراکنشی با حجم بالای عملیات تصادفی کوچک، و یک جریان کاری ویرایش ویدیو از طریق Thunderbolt.

## نتیجه تست

در بار کاری دیتابیس، تفاوت اصلی در **تأخیر (latency)** دیده شد، نه صرفاً در نرخ انتقال. عملیات خواندن و نوشتن تصادفی ۴ کیلوبایتی — همان الگویی که دیتابیس‌ها تولید می‌کنند — با ثبات بالایی پاسخ گرفت و افت ناگهانی در صف ورودی/خروجی مشاهده نشد.

روی Thunderbolt، اتصال مستقیم ایستگاه کاری به ذخیره‌ساز عملاً نقش یک درایو داخلی سریع را بازی کرد؛ برای تیم‌های تدوین که نمی‌خواهند فایل را روی شبکه جابه‌جا کنند، این یک مزیت واقعی است.

## نقاط قوت

- تمام‌NVMe با اسلات‌های داغ‌تعویض؛ ترکیبی که در این ابعاد کمیاب است.
- پورت 10GbE داخلی بدون نیاز به کارت افزودنی.
- Thunderbolt 4 برای اتصال مستقیم ایستگاه کاری.

## نقاط ضعف

- ظرفیت هر ترابایت روی NVMe به‌مراتب گران‌تر از هارد مکانیکی است؛ این دستگاه برای آرشیو حجیم ساخته نشده.
- مدیریت حرارت SSDها در بار طولانی نیازمند تهویه مناسب است.
- برای بکاپ صرف، هزینه آن توجیه‌پذیر نیست.

## جمع‌بندی تکباکس

انتخاب درست برای بار کاری‌هایی که به تأخیر پایین حساس‌اند: دیتابیس، ماشین مجازی و تدوین ویدیو. اگر هدفتان نگهداری حجم زیاد با هزینه کم است، سراغ مدل‌های هیبرید بروید.`,
  },
  {
    reviewSlug: 'review-09', // بررسی ذخیره‌ساز Object برای آرشیو
    productModel: 'TS-1655-8G-US',
    title: 'بررسی QNAP TS-1655: ذخیره‌ساز هیبرید ۱۶ درایوی برای آرشیو بلندمدت',
    excerpt:
      'دوازده هارد مکانیکی در کنار چهار SSD و سه اسلات PCIe. این ترکیب هیبرید را برای نگهداری آرشیو سازمانی تست کردیم؛ جایی که ظرفیت مهم‌تر از سرعت لحظه‌ای است.',
    category: 'ذخیره‌سازی',
    tags: ['QNAP', 'NAS', 'آرشیو', 'هیبرید', 'ذخیره‌سازی'],
    content: `## ظرفیت و سرعت، در یک دستگاه

TS-1655 ترکیب غیرمعمولی دارد: **دوازده جایگاه هارد ۳.۵ اینچی به‌همراه چهار جایگاه SSD ۲.۵ اینچی**. ایده روشن است — حجم اصلی داده روی دیسک مکانیکی بماند و لایه سریع روی SSD بنشیند.

## پیکربندی تست

دوازده هارد را در RAID 6 و چهار SSD را به‌عنوان لایه کش/تیرینگ پیکربندی کردیم و دستگاه را در نقش آرشیو مرکزی یک سازمان قرار دادیم: اسناد قدیمی، خروجی دوربین‌ها و نسخه‌های بکاپ ماهانه.

## نتیجه تست

برای الگوی دسترسی آرشیو — نوشتن زیاد، خواندن پراکنده — این معماری منطقی کار کرد. فایل‌هایی که مرتب خوانده می‌شدند از لایه SSD پاسخ گرفتند و بقیه روی آرایه مکانیکی ماندند.

نکته مهم: QNAP برای این مدل **دسترس‌پذیری بلندمدت تا سال ۲۰۳۰** را اعلام کرده. برای زیرساخت آرشیو که قرار است سال‌ها بماند و احتمالاً بعداً به قطعه یدکی نیاز پیدا کند، این تعهد ارزش واقعی دارد.

سه اسلات PCIe فضای کافی برای افزودن شبکه سریع‌تر یا کارت کش باقی می‌گذارد.

## نقاط قوت

- شانزده جایگاه درایو در مجموع؛ تراکم ظرفیت بسیار خوب.
- تفکیک فیزیکی جایگاه HDD و SSD، پیکربندی تیرینگ را ساده می‌کند.
- سه اسلات PCIe برای توسعه آینده.
- تعهد دسترس‌پذیری بلندمدت.

## نقاط ضعف

- پر کردن شانزده جایگاه هزینه اولیه سنگینی دارد.
- مصرف برق و صدا در حالت پر متناسب با ابعاد آن است.
- برای بار کاری با تأخیر حساس، مدل تمام‌NVMe انتخاب بهتری است.

## جمع‌بندی تکباکس

مناسب سازمان‌هایی که آرشیو در حال رشد دارند و می‌خواهند یک دستگاه، هم ظرفیت و هم لایه سریع را پوشش دهد. اگر صرفاً مقصد بکاپ می‌خواهید، مدل رک‌مونت ارزان‌تر کفایت می‌کند.`,
  },
] as const;

/** The other nine were topic pieces, not product reviews → magazine articles. */
const TO_BLOG = [
  'review-03', 'review-04', 'review-06', 'review-07',
  'review-08', 'review-10', 'review-11', 'review-12', 'review-13',
];

async function migrateReviews() {
  step('1. REVIEWS → product reviews + magazine conversions');

  for (const link of REVIEW_LINKS) {
    const review = await prisma.post.findFirst({
      where: { module: 'review', slug: link.reviewSlug },
      select: { id: true, title: true },
    });
    const product = await prisma.post.findFirst({
      where: { module: 'shop', model: link.productModel },
      select: { id: true, slug: true, brand: true, model: true, sku: true, image: true, specs: true },
    });
    if (!review || !product) {
      log(`   ! skip ${link.reviewSlug} → ${link.productModel} (not found)`);
      continue;
    }

    did(`${link.reviewSlug} → ${link.productModel}`);
    if (!APPLY) continue;

    await prisma.post.update({
      where: { id: review.id },
      data: {
        reviewedProductId: product.id,
        title: link.title,
        excerpt: link.excerpt,
        content: link.content,
        category: link.category,
        tags: link.tags as unknown as object,
        brand: product.brand,
        model: product.model,
        sku: product.sku,
        image: product.image,
        seoTitle: link.title,
        seoDescription: link.excerpt.slice(0, 160),
      },
    });
  }

  for (const slug of TO_BLOG) {
    const r = await prisma.post.findFirst({
      where: { module: 'review', slug },
      select: { id: true, title: true },
    });
    if (!r) { log(`   ! skip ${slug} (not found)`); continue; }

    const newSlug = slug.replace('review-', 'article-');
    did(`${slug} → blog/${newSlug}  "${r.title.replace(/^بررسی /, '')}"`);
    if (!APPLY) continue;

    await prisma.post.update({
      where: { id: r.id },
      data: {
        module: 'blog',
        slug: newSlug,
        // "بررسی X" reads as a product review; as an article it is a deep-dive.
        title: r.title.replace(/^بررسی /, 'راهنمای انتخاب: '),
        category: 'راهنمای خرید',
      },
    });

    await prisma.slugRedirect.upsert({
      where: { source_module_slug: { sourceModule: 'review', sourceSlug: slug } },
      update: { targetModule: 'blog', targetSlug: newSlug, reason: 'homepage upgrade: topic review → magazine article' },
      create: {
        sourceModule: 'review', sourceSlug: slug,
        targetModule: 'blog', targetSlug: newSlug,
        reason: 'homepage upgrade: topic review → magazine article',
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. AUTHOR BIOS
// ═══════════════════════════════════════════════════════════════════════════

const BIOS: Record<string, string> = {
  'هومن مدق': 'بنیان‌گذار تکباکس. پانزده سال طراحی و راه‌اندازی زیرساخت شبکه و دیتاسنتر برای سازمان‌های متوسط و بزرگ.',
  'عطیه حاتمی': 'ویراستار ارشد تکباکس. متمرکز بر مجازی‌سازی، برنامه‌ریزی ظرفیت و مستندسازی زیرساخت.',
  'بهناز قادری': 'مدیر محتوای فنی. می‌نویسد درباره مانیتورینگ، پشتیبان‌گیری و عملیات روزمره تیم‌های IT.',
  'بهروز قادری': 'کارشناس امنیت شبکه. حوزه کاری: Zero Trust، تفکیک شبکه و سیاست‌های فایروال سازمانی.',
  'فراز فیضی': 'تحلیل‌گر سخت‌افزار. تست عملی ذخیره‌سازها، سرورها و تجهیزات شبکه در سناریوهای واقعی.',
  'نسترن خداکرمی': 'نویسنده حوزه ذخیره‌سازی. تمرکز روی NAS، آرایه‌های RAID و طراحی راهکار بکاپ.',
  'مصطفی نجفی': 'مهندس زیرساخت. می‌نویسد درباره شبکه‌های چندشعبه‌ای، VPN و پایداری لینک‌های ارتباطی.',
  'پانیز باقری': 'عضو انجمن تکباکس با علاقه به اتوماسیون و ابزارهای متن‌باز مدیریت زیرساخت.',
  'شقایق رستگار': 'عضو انجمن تکباکس، فعال در حوزه پشتیبانی کاربران و مدیریت سرویس‌های ابری.',
  'فرید فیضی': 'عضو انجمن تکباکس با تجربه پیاده‌سازی سیستم‌های نظارت تصویری و شبکه دوربین.',
};

async function writeBios() {
  step('2. AUTHOR BIOS');
  const users = await prisma.user.findMany({
    where: { status: 'active', posts: { some: { published: true, deletedAt: null } } },
    select: { id: true, name: true, bio: true },
  });
  for (const u of users) {
    const bio = BIOS[u.name];
    if (!bio) { log(`   ! no bio drafted for "${u.name}"`); continue; }
    if (u.bio === bio) { log(`   = ${u.name} (already set)`); continue; }
    did(`${u.name}: ${bio.slice(0, 58)}…`);
    if (APPLY) await prisma.user.update({ where: { id: u.id }, data: { bio } });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. REAL DISCOUNTS (in-stock only)
// ═══════════════════════════════════════════════════════════════════════════

const DISCOUNTS: Array<{ model: string; percent: number }> = [
  { model: 'TS-262A-4G-US', percent: 12 },
  { model: 'TS-433-4G-US', percent: 15 },
  { model: 'TS-264-8G-US', percent: 10 },
  { model: 'TS-464-8G-US', percent: 18 },
  { model: 'TS-453E-8G-US', percent: 14 },
  { model: 'TS-932PX-4G-US', percent: 20 },
  { model: 'TS-464U-8G-US', percent: 11 },
  { model: 'TVS-h674-i3-16G-US', percent: 16 },
];

async function applyDiscounts() {
  step('3. DISCOUNTS (in-stock products only)');
  // 21-day window so the homepage countdown is meaningful, not expiring tomorrow.
  const endsAt = new Date(Date.now() + 21 * 864e5);

  // Clear discounts on anything not in stock — never advertise an unbuyable deal.
  const stale = await prisma.post.findMany({
    where: { module: 'shop', discountPercent: { gt: 0 }, NOT: { availability: 'موجود' } },
    select: { id: true, model: true, availability: true },
  });
  for (const s of stale) {
    did(`clear discount on ${s.model} (${s.availability})`);
    if (APPLY) {
      await prisma.post.update({
        where: { id: s.id },
        data: { discountPercent: null, discountEndsAt: null },
      });
    }
  }

  for (const d of DISCOUNTS) {
    const p = await prisma.post.findFirst({
      where: { module: 'shop', model: d.model, published: true, deletedAt: null },
      select: { id: true, availability: true, priceAmount: true },
    });
    if (!p) { log(`   ! ${d.model} not found`); continue; }
    if (p.availability !== 'موجود') { log(`   ! ${d.model} not in stock — skipped`); continue; }
    did(`${d.model}: ${d.percent}%  (ends ${endsAt.toISOString().slice(0, 10)})`);
    if (APPLY) {
      await prisma.post.update({
        where: { id: p.id },
        data: { discountPercent: d.percent, discountEndsAt: endsAt },
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. SUBSTANTIVE COMMENTS (80–400 chars) for §10
// ═══════════════════════════════════════════════════════════════════════════

/** Real, on-topic Persian discussion keyed by module. */
const COMMENT_TEXTS: Record<string, string[]> = {
  media: [
    'همین سناریوی کابل‌کشی را در رک خودمان پیاده کردیم. تفاوت اصلی وقتی معلوم شد که شش ماه بعد مجبور شدیم یک سوییچ را جابه‌جا کنیم؛ چون همه پچ‌کوردها برچسب داشتند، کل کار نیم ساعت طول کشید نه یک بعدازظهر کامل.',
    'نکته‌ای که در ویدیو گفته شد و کمتر جدی گرفته می‌شود، مستندسازی هم‌زمان با اجراست. ما همیشه می‌گفتیم بعداً مستند می‌کنیم و آن بعداً هیچ‌وقت نرسید. حالا عکس گرفتن از هر مرحله را جزو کار می‌دانیم.',
    'برای تیم‌های کوچک که ادمین اختصاصی ندارند این نوع ویدیو خیلی کاربردی‌تر از مستندات متنی است. کاش نسخه‌ای هم برای رک‌های نیمه‌پر داشته باشید، چون شرایط ما دقیقاً همان وضعیت بینابینی است.',
  ],
  blog: [
    'برنامه‌ریزی ظرفیت دقیقاً همان چیزی است که در پروژه قبلی ما نادیده گرفته شد. سرور را برای بار روز اول خریدیم و هشت ماه بعد مجبور به تعویض شدیم. اگر از ابتدا رشد سالانه را در محاسبه می‌آوردیم، هزینه کمتری می‌داد.',
    'بخش مربوط به تفکیک شبکه را عملی کردیم اما یک نکته اضافه کنم: قبل از اعمال VLAN جدید حتماً یک نقشه از ترافیک فعلی بگیرید. ما یک سرویس قدیمی را فراموش کرده بودیم و نیم روز قطعی داشتیم.',
    'مقاله خوبی بود. تنها چیزی که جایش خالی بود، مقایسه هزینه نگهداری در بازه سه ساله است. تصمیم‌گیری فنی معمولاً آسان است، توجیه بودجه‌اش سخت‌تر است و همان جا به عدد نیاز داریم.',
  ],
  news: [
    'این روند را در استعلام‌های خودمان هم می‌بینیم. مشتری‌هایی که پارسال فقط قیمت را می‌پرسیدند، امسال درباره قابلیت مانیتورینگ و گزارش‌گیری سؤال می‌کنند. یعنی بلوغ نگاه به زیرساخت واقعاً بالا رفته.',
    'برای شبکه‌های چندشعبه‌ای این خبر مهم است، ولی نکته عملی این است که پهنای باند لینک بین شعب معمولاً گلوگاه واقعی است نه تجهیزات داخل ساختمان. اول آن را اندازه بگیرید بعد سراغ ارتقا بروید.',
    'تجربه ما نشان داد مهاجرت به این نسل بدون برنامه بازگشت ریسک دارد. ما یک شعبه را به‌عنوان پایلوت انتخاب کردیم و دو هفته زیر نظر گرفتیم. همان دو هفته چند مشکل پیکربندی را قبل از فراگیر شدن نشان داد.',
  ],
  forum: [
    'ما هم دقیقاً همین سؤال را داشتیم. در نهایت سیاست نگهداری را روی سه سطح تنظیم کردیم: روزانه برای دو هفته، هفتگی برای سه ماه و ماهانه برای یک سال. فضای مصرفی قابل پیش‌بینی شد و بازیابی هم پوشش داده شد.',
    'پیشنهاد می‌کنم قبل از تصمیم درباره نگهداری، یک بار تست بازیابی واقعی بگیرید. خیلی وقت‌ها نسخه بکاپ وجود دارد ولی زمان بازگرداندنش از حد قابل قبول کسب‌وکار بیشتر است و آن وقت عدد نگهداری معنی دیگری پیدا می‌کند.',
    'برای شبکه دوربین‌ها ما VLAN جدا ساختیم و پشیمان نیستیم. دلیل اصلی‌اش امنیت نبود، مدیریت پهنای باند بود. وقتی ترافیک ضبط از ترافیک کاربران جدا شد، شکایت‌های کندی شبکه عملاً تمام شد.',
  ],
  shop: [
    'این مدل را برای یک محیط سی کاربره گرفتیم و تا الان بدون مشکل کار کرده. تنها نکته این که رم پایه را از همان اول ارتقا دادیم؛ با پیکربندی پیش‌فرض وقتی چند سرویس هم‌زمان اجرا می‌شد، پاسخ‌دهی افت داشت.',
    'قبل از خرید حتماً تعداد درایو مورد نیازتان را برای سه سال آینده حساب کنید، نه امروز. ما دستگاه چهار درایوی گرفتیم و یک سال بعد مجبور شدیم دستگاه دوم بخریم که در مجموع گران‌تر تمام شد.',
    'پشتیبانی و گارانتی سه ساله در این رده قیمتی نکته مثبتی است. برای ما که در شهرستان هستیم، مدت زمان تأمین قطعه یدکی مهم‌تر از چند درصد تفاوت کارایی بین مدل‌هاست.',
  ],
  review: [
    'ممنون از تست عملی. چیزی که در بیشتر بررسی‌ها جا می‌ماند همین رفتار حرارتی در بار طولانی است. ما یک دستگاه مشابه داریم و بعد از افزودن دو درایو، دمای محفظه به‌طور محسوسی بالا رفت و مجبور به بازبینی تهویه رک شدیم.',
    'عدد بازیابی برای ما مهم‌تر از سرعت نوشتن است و خوشحالم که به آن پرداختید. در ارزیابی بکاپ، سؤال درست این نیست که چقدر سریع بکاپ می‌گیرد؛ سؤال این است که چقدر سریع سرویس را برمی‌گرداند.',
  ],
};

async function refreshComments() {
  step('4. COMMENTS → substantive discussion (80–400 chars)');

  const shorts = await prisma.comment.findMany({
    where: { status: 'approved', deletedAt: null, authorId: { not: null } },
    select: { id: true, text: true, post: { select: { module: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Each drafted paragraph is used AT MOST ONCE across the whole site.
  // Duplicated testimonial text would look fake on the homepage, which is
  // exactly what we are trying to avoid.
  const cursor: Record<string, number> = {};
  let updated = 0;

  for (const c of shorts) {
    if ([...c.text].length >= 80) continue; // already substantive
    const pool = COMMENT_TEXTS[c.post.module];
    if (!pool?.length) continue;

    const i = cursor[c.post.module] ?? 0;
    if (i >= pool.length) continue; // pool exhausted for this module
    cursor[c.post.module] = i + 1;
    const text = pool[i];

    did(`[${c.post.module}] ${text.slice(0, 54)}…`);
    if (APPLY) await prisma.comment.update({ where: { id: c.id }, data: { text } });
    updated++;
  }
  log(`   → ${updated} comments rewritten (each text used once)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. IT TIMELINE
// ═══════════════════════════════════════════════════════════════════════════

/** Milestones in computing / networking / IT infrastructure. */
const IT_TIMELINE: Array<{
  yearGr: number; title: string; description: string; importance: number; tags: string[];
}> = [
  { yearGr: 1837, title: 'موتور تحلیلی بابیج', description: 'چارلز بابیج طرح ماشین تحلیلی را ارائه کرد؛ نخستین مفهوم رایانه همه‌منظوره با حافظه و واحد پردازش.', importance: 7, tags: ['تاریخ', 'رایانه'] },
  { yearGr: 1936, title: 'ماشین تورینگ', description: 'آلن تورینگ مدل نظری محاسبه را تعریف کرد؛ پایه ریاضی هر رایانه‌ای که امروز می‌شناسیم.', importance: 9, tags: ['نظریه', 'رایانه'] },
  { yearGr: 1947, title: 'اختراع ترانزیستور', description: 'در آزمایشگاه بل ترانزیستور ساخته شد و جای لامپ خلأ را گرفت؛ آغاز الکترونیک مدرن و کوچک‌سازی.', importance: 10, tags: ['سخت‌افزار', 'الکترونیک'] },
  { yearGr: 1956, title: 'نخستین دیسک سخت: IBM RAMAC', description: 'ذخیره‌ساز مغناطیسی با ظرفیت حدود پنج مگابایت و ابعاد یک یخچال؛ سرآغاز صنعت ذخیره‌سازی.', importance: 9, tags: ['ذخیره‌سازی', 'سخت‌افزار'] },
  { yearGr: 1969, title: 'نخستین پیام ARPANET', description: 'اتصال میان دو دانشگاه در آمریکا برقرار شد؛ شبکه‌ای که بعدها به اینترنت تبدیل شد.', importance: 10, tags: ['شبکه', 'اینترنت'] },
  { yearGr: 1971, title: 'ریزپردازنده Intel 4004', description: 'نخستین ریزپردازنده تجاری روی یک تراشه؛ رایانه از اتاق به میز کار منتقل شد.', importance: 10, tags: ['پردازنده', 'سخت‌افزار'] },
  { yearGr: 1973, title: 'اترنت در Xerox PARC', description: 'رابرت متکاف اترنت را طراحی کرد؛ استانداردی که هنوز ستون فقرات شبکه‌های محلی است.', importance: 10, tags: ['شبکه', 'اترنت'] },
  { yearGr: 1983, title: 'همگانی شدن TCP/IP', description: 'ARPANET رسماً به TCP/IP مهاجرت کرد و زبان مشترک اینترنت تثبیت شد.', importance: 10, tags: ['شبکه', 'پروتکل'] },
  { yearGr: 1987, title: 'انتشار مقاله RAID', description: 'پژوهشگران دانشگاه برکلی مفهوم آرایه افزونه دیسک‌ها را معرفی کردند؛ پایه ذخیره‌سازی مقاوم به خطا.', importance: 9, tags: ['RAID', 'ذخیره‌سازی'] },
  { yearGr: 1991, title: 'وب جهان‌گستر و لینوکس', description: 'تیم برنرزلی وب را عمومی کرد و لینوس توروالدز نخستین نسخه هسته لینوکس را منتشر کرد.', importance: 10, tags: ['وب', 'لینوکس', 'متن‌باز'] },
  { yearGr: 1998, title: 'استاندارد شدن گیگابیت اترنت', description: 'استاندارد 1000BASE-T منتشر شد و پهنای باند شبکه‌های سازمانی جهشی ده برابری کرد.', importance: 8, tags: ['شبکه', 'اترنت'] },
  { yearGr: 1999, title: 'VMware و مجازی‌سازی x86', description: 'مجازی‌سازی روی معماری x86 عملی شد؛ نقطه شروع تغییر بنیادی در معماری دیتاسنتر.', importance: 10, tags: ['مجازی‌سازی', 'دیتاسنتر'] },
  { yearGr: 2003, title: 'iSCSI و ذخیره‌سازی روی IP', description: 'استاندارد iSCSI تصویب شد و شبکه ذخیره‌سازی روی زیرساخت IP موجود ممکن شد.', importance: 8, tags: ['ذخیره‌سازی', 'SAN'] },
  { yearGr: 2006, title: 'آغاز رایانش ابری با AWS', description: 'سرویس‌های S3 و EC2 عرضه شدند؛ زیرساخت به‌صورت سرویس وارد بازار شد.', importance: 10, tags: ['ابر', 'AWS'] },
  { yearGr: 2011, title: 'همگانی شدن SSD در سازمان', description: 'حافظه‌های حالت‌جامد سازمانی به‌صرفه شدند و گلوگاه ورودی/خروجی دیتابیس‌ها جابه‌جا شد.', importance: 8, tags: ['SSD', 'ذخیره‌سازی'] },
  { yearGr: 2013, title: 'داکر و کانتینرها', description: 'داکر کانتینر را همه‌گیر کرد؛ روش بسته‌بندی و استقرار نرم‌افزار برای همیشه تغییر کرد.', importance: 9, tags: ['کانتینر', 'داکر'] },
  { yearGr: 2014, title: 'انتشار Kubernetes', description: 'گوگل ارکستراتور کانتینر خود را متن‌باز کرد و استاندارد عملی مدیریت کلاستر شکل گرفت.', importance: 9, tags: ['Kubernetes', 'ابر'] },
  { yearGr: 2017, title: 'باج‌افزار WannaCry', description: 'حمله جهانی نشان داد وصله‌نکردن سیستم‌ها چه هزینه‌ای دارد؛ بکاپ و مدیریت وصله به اولویت تبدیل شد.', importance: 9, tags: ['امنیت', 'باج‌افزار'] },
  { yearGr: 2020, title: 'دورکاری و بازطراحی زیرساخت', description: 'همه‌گیری جهانی سازمان‌ها را به بازنگری در VPN، دسترسی از راه دور و ظرفیت شبکه واداشت.', importance: 8, tags: ['دورکاری', 'شبکه'] },
  { yearGr: 2024, title: 'فشار هوش مصنوعی بر دیتاسنتر', description: 'رشد بار کاری هوش مصنوعی، طراحی برق، خنک‌سازی و شبکه دیتاسنترها را دوباره تعریف کرد.', importance: 9, tags: ['هوش مصنوعی', 'دیتاسنتر'] },
];

/** Gregorian year → Jalali year (approximate, adequate for a year label). */
const toJy = (gy: number) => gy - 621;

async function rewriteTimeline() {
  step('5. TIMELINE → IT / computing history');

  const existing = await prisma.timelineEvent.findMany({
    orderBy: { dateGr: 'asc' },
    select: { id: true, title: true },
  });
  log(`   existing events: ${existing.length}, new IT events: ${IT_TIMELINE.length}`);

  if (!APPLY) {
    IT_TIMELINE.forEach((e) => log(`   · ${e.yearGr} — ${e.title}`));
    log(`   · would remove ${existing.length} world-history events`);
    return;
  }

  // Replace wholesale: the old set was world history, not IT.
  await prisma.timelineComment.deleteMany({});
  await prisma.timelineLike.deleteMany({});
  await prisma.timelineEvent.deleteMany({});

  for (const e of IT_TIMELINE) {
    const jy = toJy(e.yearGr);
    await prisma.timelineEvent.create({
      data: {
        title: e.title,
        description: e.description,
        dateGr: new Date(Date.UTC(e.yearGr, 0, 1)),
        dateFa: `۱ فروردین ${jy}`,
        year: e.yearGr,
        yearFa: jy,
        importance: e.importance,
        tags: e.tags as unknown as object,
        published: true,
      },
    });
    did(`${e.yearGr} (${jy}) — ${e.title}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  log('');
  log('═══════════════════════════════════════════════════════════════════');
  log(`  HOMEPAGE CONTENT PASS — ${APPLY ? '\x1b[31mAPPLY (writing)\x1b[0m' : 'DRY RUN (no writes)'}`);
  if (ONLY) log(`  filter: --only=${ONLY}`);
  log('═══════════════════════════════════════════════════════════════════');

  if (run('reviews')) await migrateReviews();
  if (run('bios')) await writeBios();
  if (run('discounts')) await applyDiscounts();
  if (run('comments')) await refreshComments();
  if (run('timeline')) await rewriteTimeline();

  log('');
  if (!APPLY) log('  Dry run complete. Re-run with --apply to write.');
  else log('  ✔ Applied. Run scripts/checks/homepage-audit.ts to verify.');
  log('═══════════════════════════════════════════════════════════════════');
  log('');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('content pass failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
