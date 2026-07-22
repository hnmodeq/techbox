import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BLOB = "https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com";
const PASSWORD = process.env.SEED_DEFAULT_PASSWORD || (process.env.NODE_ENV === "production" ? undefined : "dev-only-password");
if (!PASSWORD) {
  console.error("SEED_DEFAULT_PASSWORD is required in production. Set it in .env or pass as environment variable.");
  process.exit(1);
}
// After this point PASSWORD is guaranteed string — but TS doesn't infer process.exit narrowing
const _PASSWORD: string = PASSWORD;
const DRY_RUN = process.argv.includes("--dry-run");
const ALL_MODULES = ["blog", "news", "media", "review", "download", "shop", "forum", "tools"];
const DAY_MS = 24 * 60 * 60 * 1000;
const seedNow = new Date();
const seedDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "long", timeZone: "Asia/Tehran" });
function seedDate(daysAgo: number) {
  return new Date(seedNow.getTime() - Math.max(0, daysAgo) * DAY_MS);
}
function seedDateIso(daysAgo: number) {
  return seedDate(daysAgo).toISOString();
}
function seedDateFa(daysAgo: number) {
  return seedDateFormatter.format(seedDate(daysAgo));
}

type SeedUser = {
  username: string;
  name: string;
  role: "super_admin" | "editor" | "user";
  roleFa: string;
  modules?: string[];
  avatar: string;
  job?: string;
};

export const seedUsers: SeedUser[] = [
  { username: "hoomanmodeq", name: "هومن مدق", role: "super_admin", roleFa: "مدیر کل", modules: ALL_MODULES, avatar: `${BLOB}/avatars/hoomanmodeq.jpg`, job: "مدیر تکباکس" },
  { username: "atiyehatami", name: "عطیه حاتمی", role: "editor", roleFa: "ادمین محتوا", modules: ["blog", "news"], avatar: `${BLOB}/avatars/atiyehatami.jpg`, job: "نویسنده مقاله" },
  { username: "behnazghaderi", name: "بهناز قادری", role: "editor", roleFa: "ادمین محتوا", modules: ["blog", "news"], avatar: `${BLOB}/avatars/behnazghaderi.jpg`, job: "نویسنده مقاله" },
  { username: "behruzghaderi", name: "بهروز قادری", role: "editor", roleFa: "ادمین محتوا", modules: ["blog", "news"], avatar: `${BLOB}/avatars/behruzghaderi.jpg`, job: "نویسنده مقاله" },
  { username: "nastarankhodakarami", name: "نسترن خداکرمی", role: "editor", roleFa: "نویسنده نقد", modules: ["review"], avatar: `${BLOB}/avatars/nastarankhodakarami.jpg`, job: "نویسنده نقد و بررسی" },
  { username: "farazfeizi", name: "فراز فیضی", role: "editor", roleFa: "نویسنده نقد", modules: ["review"], avatar: `${BLOB}/avatars/farazfeizi.jpg`, job: "نویسنده نقد و بررسی" },
  { username: "mostafanajafi", name: "مصطفی نجفی", role: "editor", roleFa: "نویسنده نقد", modules: ["review"], avatar: `${BLOB}/avatars/mostafanajafi.jpg`, job: "نویسنده نقد و بررسی" },
  { username: "panizbagheri", name: "پانیز باقری", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/panizbagheri.jpg`, job: "عضو انجمن" },
  { username: "shaghayeghrastegaar", name: "شقایق رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/shaghayeghrastegaar.jpg`, job: "عضو انجمن" },
  { username: "faridfeizi", name: "فرید فیضی", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/faridfeizi.jpg`, job: "عضو انجمن" },
  { username: "alirastegaar", name: "علی رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/alirastegaar.jpg` },
  { username: "amiralmasi", name: "امیر الماسی", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/amiralmasi.jpg` },
  { username: "aylingharagozloo", name: "آیلین قره‌گزلو", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/aylingharagozloo.jpg` },
  { username: "faribarastegaar", name: "فریبا رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/faribarastegaar.jpg` },
  { username: "fatamehrastegaar", name: "فاطمه رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/fatamehrastegaar.jpg` },
  { username: "hannamasoumy", name: "هانا معصومی", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/hannamasoumy.jpg` },
  { username: "mohsenakbari", name: "محسن اکبری", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/mohsenakbari.jpg` },
  { username: "mohsenshafaat", name: "محسن شفاعت", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/mohsenshafaat.jpg` },
  { username: "nazaninrastegaar", name: "نازنین رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/nazaninrastegaar.jpg` },
  { username: "parsaghahremanpoor", name: "پارسا قهرمان‌پور", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/parsaghahremanpoor.jpg` },
  { username: "pouryamodeq", name: "پوریا مدق", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/pouryamodeq.jpg` },
  { username: "raminrastegaar", name: "رامین رستگار", role: "user", roleFa: "کاربر عضو", avatar: `${BLOB}/avatars/raminrastegaar.jpg` },
];
type SeedPost = {
  slug: string;
  module: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  videoUrl?: string;
  videoDuration?: string;
  videoMimeType?: string;
  videoFileSize?: string;
  gallery?: string[];
  tags?: string[];
  category?: string;
  authorUsername: string;
  date: string;
  dateFa: string;
  likes?: number;
  views?: number;
  rating?: number;
  ratingCount?: number;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  downloadCount?: number;
  solved?: boolean;
  brand?: string;
  model?: string;
  sku?: string;
  priceLabel?: string;
  availability?: string;
  warranty?: string;
  specs?: Record<string, string>;
};

const productPosts: SeedPost[] = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  const ext = [10, 14, 18, 19, 2, 3, 5].includes(n) ? "webp" : "png";
  const gallery = [`${BLOB}/products/product${n}/image1.${ext}`];
  if (n === 1) gallery.push(`${BLOB}/products/product1/image2.png`, `${BLOB}/products/product1/image4.png`);
  if (n === 2) gallery.push(`${BLOB}/products/product2/image2.webp`);
  if (n === 3) gallery.push(`${BLOB}/products/product3/image2.webp`);
  return {
    slug: `product-${String(n).padStart(2, "0")}`,
    module: "shop",
    title: `تجهیز زیرساخت تکباکس مدل ${n}`,
    excerpt: "محصول واقعی ثبت‌شده در دیتابیس با تصویر Blob و آماده ثبت درخواست مشاوره خرید.",
    content: "این محصول با تصاویر واقعی آپلودشده در Vercel Blob ثبت شده است. برای دریافت قیمت، موجودی و پیشنهاد جایگزین با تیم فروش تکباکس هماهنگ کنید.",
    image: gallery[0],
    gallery,
    tags: ["shop", "product", "infrastructure"],
    category: n % 4 === 0 ? "شبکه" : n % 4 === 1 ? "سرور" : n % 4 === 2 ? "ذخیره‌سازی" : "امنیت",
    brand: ["HPE", "Dell", "QNAP", "Fortinet", "MikroTik"][n % 5],
    model: `TB-${1000 + n}`,
    sku: `TB-SKU-${String(n).padStart(4, "0")}`,
    priceLabel: n % 3 === 0 ? "تماس بگیرید" : `${(45 + n * 7).toLocaleString("fa-IR")} میلیون تومان`,
    availability: n % 4 === 0 ? "پیش‌سفارش" : "موجود برای مشاوره",
    warranty: "گارانتی اصالت و سلامت فیزیکی",
    specs: {
      "کاربری پیشنهادی": n % 4 === 0 ? "شبکه" : n % 4 === 1 ? "سرور" : n % 4 === 2 ? "ذخیره‌سازی" : "امنیت",
      "سطح سازمانی": n % 2 === 0 ? "SMB / Mid-Market" : "Enterprise Lite",
      "نوع تأمین": "استعلام از فروش تکباکس",
      "نیاز به مشاوره": "بله",
    },
    authorUsername: "hoomanmodeq",
    date: seedDateIso(i),
    dateFa: seedDateFa(i),
    likes: 3 + i,
    views: 80 + i * 17,
  } satisfies SeedPost;
});

const forumPosts: SeedPost[] = [
  {
    slug: "forum-vlan-design-for-camera-network",
    module: "forum",
    title: "برای شبکه دوربین‌ها VLAN جدا بسازیم یا همان شبکه اصلی کافی است؟",
    excerpt: "در یک ساختمان ۴ طبقه حدود ۴۸ دوربین داریم و نمی‌دانم جداسازی VLAN چقدر ضروری است.",
    content: "سلام دوستان. برای پروژه‌ای با حدود ۴۸ دوربین IP و یک NVR مرکزی، بهتر است دوربین‌ها را در VLAN جدا قرار دهیم؟ نگرانی اصلی من Broadcast، امنیت و دسترسی کاربران عادی به دوربین‌هاست.",
    image: `${BLOB}/thumbnails/thumbnail8.jpg`,
    tags: ["forum", "vlan", "camera", "nvr"],
    category: "شبکه",
    authorUsername: "panizbagheri",
    date: seedDateIso(0),
    dateFa: seedDateFa(0),
    likes: 7,
    views: 140,
    solved: true,
  },
  {
    slug: "forum-backup-retention-for-small-company",
    module: "forum",
    title: "Retention مناسب برای بکاپ شرکت ۳۰ نفره چیست؟",
    excerpt: "روزانه بکاپ می‌گیریم اما فضای NAS سریع پر می‌شود.",
    content: "ما روی NAS بکاپ روزانه داریم ولی بعد از چند ماه فضا کم می‌آوریم. برای فایل‌سرور و VMها چه retention policy پیشنهاد می‌کنید؟",
    image: `${BLOB}/thumbnails/thumbnail9.jpg`,
    tags: ["forum", "backup", "nas", "retention"],
    category: "بکاپ",
    authorUsername: "shaghayeghrastegaar",
    date: seedDateIso(1),
    dateFa: seedDateFa(1),
    likes: 9,
    views: 175,
    solved: false,
  },
  {
    slug: "forum-firewall-vpn-for-branches",
    module: "forum",
    title: "برای اتصال شعبه‌ها VPN روی فایروال بهتر است یا روتر جدا؟",
    excerpt: "سه شعبه داریم و می‌خواهیم ارتباط پایدار و قابل مانیتور داشته باشیم.",
    content: "برای اتصال سه شعبه به دفتر مرکزی، استفاده از VPN روی فایروال اصلی بهتر است یا روتر جداگانه؟ گزارش‌گیری و مدیریت دسترسی برایمان مهم است.",
    image: `${BLOB}/thumbnails/thumbnail10.jpg`,
    tags: ["forum", "vpn", "firewall", "branch"],
    category: "امنیت",
    authorUsername: "faridfeizi",
    date: seedDateIso(2),
    dateFa: seedDateFa(2),
    likes: 6,
    views: 120,
    solved: true,
  },
];

type SeedComment = { module: string; slug: string; username: string; text: string; likes?: number };
const seedComments: SeedComment[] = [
  { module: "forum", slug: "forum-vlan-design-for-camera-network", username: "hoomanmodeq", text: "بله، برای دوربین‌ها VLAN جدا پیشنهاد می‌شود. دسترسی از شبکه کاربران را فقط از طریق NVR یا Rule مشخص روی فایروال باز کنید.", likes: 4 },
  { module: "forum", slug: "forum-vlan-design-for-camera-network", username: "atiyehatami", text: "اگر PoE Switch دارید، بهتر است DHCP و Gateway دوربین‌ها هم از شبکه کاربران جدا باشد تا عیب‌یابی ساده‌تر شود.", likes: 2 },
  { module: "forum", slug: "forum-backup-retention-for-small-company", username: "nastarankhodakarami", text: "برای شروع: روزانه ۱۴ نسخه، هفتگی ۸ نسخه، ماهانه ۱۲ نسخه. اما حتماً Restore تست کنید؛ retention بدون تست بازیابی کافی نیست.", likes: 5 },
  { module: "forum", slug: "forum-backup-retention-for-small-company", username: "mohsenakbari", text: "ما برای فایل‌سرور Snapshot کوتاه‌مدت و بکاپ آفلاین ماهانه داریم. ترکیبش خیلی کمک کرده.", likes: 1 },
  { module: "forum", slug: "forum-firewall-vpn-for-branches", username: "behnazghaderi", text: "اگر فایروال مرکزی منابع کافی دارد، VPN روی همان بهتر است چون Policy و لاگ‌ها یکپارچه می‌مانند.", likes: 3 },
  { module: "forum", slug: "forum-firewall-vpn-for-branches", username: "farazfeizi", text: "برای پایداری، مانیتورینگ tunnel و failover لینک اینترنت را هم از ابتدا در طراحی ببینید.", likes: 2 },
];

async function upsertComments(comments: SeedComment[]) {
  for (const c of comments) {
    const post = await prisma.post.findUnique({ where: { module_slug: { module: c.module, slug: c.slug } } });
    const user = await prisma.user.findUnique({ where: { username: c.username } });
    if (!post || !user) continue;
    const existing = await prisma.comment.findFirst({ where: { postId: post.id, authorId: user.id, text: c.text } });
    if (!existing) {
      await prisma.comment.create({ data: { postId: post.id, authorId: user.id, authorName: user.name, text: c.text, likes: c.likes || 0 } });
    }
  }
  console.log(`Upserted ${comments.length} comments.`);
}

async function seedLikesForPosts(posts: SeedPost[]) {
  const users = await prisma.user.findMany({ select: { id: true, username: true } });
  for (const post of posts) {
    const likers = users.slice(0, Math.min(users.length, 8));
    for (const user of likers) {
      await prisma.like.upsert({
        where: { fingerprint_module_slug: { fingerprint: user.id, module: post.module, slug: post.slug } },
        update: {},
        create: { fingerprint: user.id, userId: user.id, module: post.module, slug: post.slug },
      });
    }
    await prisma.post.updateMany({ where: { module: post.module, slug: post.slug }, data: { likes: likers.length } });
  }
}

const downloadPosts: SeedPost[] = [
  {
    slug: "archive-pdf-1",
    module: "download",
    title: "دانلود PDF راهنمای طراحی شبکه امن",
    excerpt: "فایل PDF واقعی از آرشیو تکباکس برای مطالعه و نگهداری آفلاین.",
    content: "این فایل از Vercel Blob دریافت می‌شود و شمارش دانلود آن در دیتابیس ثبت می‌شود.",
    image: `${BLOB}/article-images/article1.jpg`,
    tags: ["pdf", "archive", "network", "download"],
    category: "PDF",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(0),
    dateFa: seedDateFa(0),
    fileName: "pdf1.pdf",
    fileUrl: `${BLOB}/archive/pdf/pdf1.pdf`,
    fileSize: "4.03 MB",
    downloadCount: 0,
  },
  {
    slug: "archive-pdf-2",
    module: "download",
    title: "دانلود PDF چک‌لیست نگهداری سرور",
    excerpt: "چک‌لیست PDF واقعی برای کنترل دوره‌ای سرویس‌ها، بکاپ و سلامت سخت‌افزار.",
    content: "این فایل واقعی از فولدر archive/pdf در Blob خوانده می‌شود.",
    image: `${BLOB}/article-images/article2.jpg`,
    tags: ["pdf", "archive", "server", "download"],
    category: "PDF",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(1),
    dateFa: seedDateFa(1),
    fileName: "pdf2.pdf",
    fileUrl: `${BLOB}/archive/pdf/pdf2.pdf`,
    fileSize: "1.17 MB",
    downloadCount: 0,
  },
  {
    slug: "archive-zip-1",
    module: "download",
    title: "دانلود ZIP نمونه فایل‌های پیکربندی",
    excerpt: "آرشیو ZIP واقعی برای نمونه ساختار فایل‌ها و کانفیگ‌های مستندشده.",
    content: "این فایل واقعی از فولدر archive/zip در Blob خوانده می‌شود و از مسیر /api/download شمارش می‌شود.",
    image: `${BLOB}/article-images/article3.jpg`,
    tags: ["zip", "archive", "config", "download"],
    category: "ZIP",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(2),
    dateFa: seedDateFa(2),
    fileName: "zip1.zip",
    fileUrl: `${BLOB}/archive/zip/zip1.zip`,
    fileSize: "4.68 MB",
    downloadCount: 0,
  },
];

const newsPosts: SeedPost[] = Array.from({ length: 11 }, (_, i) => {
  const n = i + 1;
  const titles = [
    "افزایش استفاده از پردازش لبه در سامانه‌های نظارت تصویری",
    "نسل جدید حافظه‌های سروری با تمرکز بر مصرف انرژی معرفی شد",
    "رشد راهکارهای متن‌باز مانیتورینگ در تیم‌های زیرساخت",
    "توجه شرکت‌ها به بکاپ Immutable بیشتر شده است",
    "بازار تجهیزات 10GbE برای SMBها رقابتی‌تر شد",
    "راهکارهای Zero Trust در سازمان‌های متوسط جدی‌تر دنبال می‌شود",
    "بهبود ابزارهای مدیریت Kubernetes برای دیتاسنترهای کوچک",
    "افزایش تقاضا برای ذخیره‌سازی Object در آرشیو سازمانی",
    "گزارش جدید از اهمیت مستندسازی زیرساخت در کاهش زمان قطعی",
    "ورود Wi‑Fi 7 به پروژه‌های سازمانی چند شعبه‌ای",
    "تمرکز سازندگان UPS روی مانیتورینگ هوشمند باتری",
  ];
  return {
    slug: `news-${String(n).padStart(2, "0")}`,
    module: "news",
    title: titles[i],
    excerpt: "خلاصه خبر و تاثیر آن بر تصمیم‌های تیم‌های IT و زیرساخت در سازمان‌های ایرانی.",
    content: `${titles[i]}

این خبر از نگاه عملیاتی برای مدیران زیرساخت مهم است، چون روی برنامه‌ریزی خرید، نگهداری، امنیت و ظرفیت آینده اثر می‌گذارد. تکباکس روندهای فنی را با تمرکز بر کاربرد واقعی در شبکه، سرور، ذخیره‌سازی و امنیت دنبال می‌کند.`,
    image: `${BLOB}/news-images/news${n}.webp`,
    tags: ["news", "زیرساخت", "techbox"],
    category: i % 2 === 0 ? "زیرساخت" : "بازار فناوری",
    authorUsername: i % 3 === 0 ? "atiyehatami" : i % 3 === 1 ? "behnazghaderi" : "behruzghaderi",
    date: seedDateIso(i),
    dateFa: seedDateFa(i),
    likes: 5 + i,
    views: 120 + i * 29,
  } satisfies SeedPost;
});

const reviewPosts: SeedPost[] = Array.from({ length: 13 }, (_, i) => {
  const n = i + 1;
  const authors = ["nastarankhodakarami", "farazfeizi", "mostafanajafi"];
  const titles = [
    "بررسی سوئیچ 10GbE برای رک‌های کوچک",
    "بررسی NAS رک‌مونت برای بکاپ سازمانی",
    "بررسی سرور مجازی‌سازی نسل جدید",
    "بررسی فایروال SMB برای دفتر چند شعبه‌ای",
    "بررسی SSD سازمانی NVMe در بار کاری دیتابیس",
    "بررسی NVR مناسب دوربین‌های 4K",
    "بررسی UPS آنلاین برای اتاق سرور کوچک",
    "بررسی Access Point Wi‑Fi 7 سازمانی",
    "بررسی ذخیره‌ساز Object برای آرشیو",
    "بررسی روتر مرزی برای لینک‌های چندگانه",
    "بررسی سیستم مانیتورینگ رک و پاور",
    "بررسی سرور Tower برای شعبه‌ها",
    "بررسی راهکار بکاپ Immutable",
  ];
  return {
    slug: `review-${String(n).padStart(2, "0")}`,
    module: "review",
    title: titles[i],
    excerpt: "نتیجه تست عملی، نقاط قوت و ضعف، سناریوی مناسب خرید و نکات نگهداری در محیط واقعی.",
    content: `در این نقد و بررسی، ${titles[i]} را در سناریوی واقعی زیرساخت بررسی کردیم. معیارهای اصلی شامل پایداری، کارایی، مصرف انرژی، مدیریت‌پذیری، هزینه نگهداری و تناسب با تیم‌های IT کوچک و متوسط بود.

جمع‌بندی تکباکس: این گزینه برای سازمان‌هایی مناسب است که قبل از خرید، نیاز واقعی، ظرفیت رشد و توان پشتیبانی خود را مستند کرده‌اند.`,
    image: `${BLOB}/review-images/review${n}.${n === 1 ? "jpeg" : "jpg"}`,
    tags: ["review", "بررسی", "زیرساخت", "سخت‌افزار"],
    category: i % 3 === 0 ? "شبکه" : i % 3 === 1 ? "ذخیره‌سازی" : "سرور",
    authorUsername: authors[i % authors.length],
    date: seedDateIso(i),
    dateFa: seedDateFa(i),
    likes: 12 + i * 2,
    views: 260 + i * 41,
    rating: Math.round((4.1 + (i % 7) * 0.12) * 10) / 10,
    ratingCount: 9 + i,
  } satisfies SeedPost;
});

const articlePosts: SeedPost[] = Array.from({ length: 14 }, (_, i) => {
  const n = i + 1;
  const authors = ["atiyehatami", "behnazghaderi", "behruzghaderi"];
  const topics = [
    ["چک‌لیست طراحی شبکه امن برای شرکت‌های کوچک", "از تفکیک VLAN تا سیاست‌های دسترسی و مانیتورینگ اولیه."],
    ["راهنمای انتخاب NAS برای بکاپ سازمانی", "چطور ظرفیت، RAID و رشد داده را قبل از خرید درست تخمین بزنیم؟"],
    ["چطور یک رک تمیز و قابل پشتیبانی طراحی کنیم؟", "کابل‌کشی، لیبل‌گذاری، پاور و مستندسازی برای اتاق سرور."],
    ["مقایسه ذخیره‌سازی Object و File در پروژه‌های واقعی", "چه زمانی S3-compatible storage بهتر از فایل‌سرور است؟"],
    ["اصول مانیتورینگ شبکه قبل از بحران", "متریک‌های حیاتی برای سوئیچ، فایروال، سرور و ذخیره‌ساز."],
    ["راهنمای ساده Zero Trust برای تیم‌های IT", "شروع عملی با احراز هویت، کمترین دسترسی و ثبت لاگ."],
    ["برنامه‌ریزی ظرفیت برای مجازی‌سازی", "CPU Ready، RAM overcommit، IOPS و رشد ماشین‌های مجازی."],
    ["پشتیبان‌گیری قابل اتکا برای فایل‌سرور", "نسخه‌برداری، Snapshot، نگهداری آفلاین و تست بازیابی."],
    ["انتخاب فایروال برای دفتر چند شعبه‌ای", "VPN، گزارش‌گیری، UTM و مدیریت مرکزی در عمل."],
    ["مدیریت Patch در زیرساخت ویندوز و لینوکس", "چرخه امن بروزرسانی بدون خاموشی طولانی سرویس‌ها."],
    ["طراحی Wi‑Fi سازمانی بدون حدس و خطا", "Site survey، کانال‌ها، Roaming و ظرفیت کاربران."],
    ["اصول مستندسازی زیرساخت برای تیم‌های کوچک", "نقشه شبکه، IP plan، دسترسی‌ها و Runbook حوادث."],
    ["راهنمای خرید UPS برای رک‌های کوچک", "توان، Runtime، باتری و مانیتورینگ برق در اتاق سرور."],
    ["چطور لاگ‌ها را برای عیب‌یابی نگه داریم؟", "Syslog، SIEM سبک، retention و هشدارهای قابل استفاده."],
  ];
  const [title, excerpt] = topics[i];
  const articleSlugs = [
    "article-01-techbox",
    "article-02-nas",
    "article-03-rack-design",
    "article-04-object-storage",
    "article-05-monitoring",
    "article-06-zero-trust",
    "article-07-virtualization-capacity",
    "article-08-fileserver-backup",
    "article-09-branch-firewall",
    "article-10-patch-management",
    "article-11-wifi-design",
    "article-12-documentation",
    "article-13-ups-buying-guide",
    "article-14-log-management",
  ];
  return {
    slug: articleSlugs[i],
    module: "blog",
    title,
    excerpt,
    content: `${excerpt}

در این مقاله تکباکس، موضوع را از دید اجرایی بررسی می‌کنیم: نیازسنجی، طراحی، پیاده‌سازی، نگهداری و خطاهای رایج. هدف این است که تیم IT بتواند تصمیمی قابل دفاع بگیرد و آن را در محیط واقعی با کمترین ریسک اجرا کند.

نکته مهم این است که هیچ نسخه واحدی برای همه سازمان‌ها وجود ندارد؛ بنابراین پیشنهاد می‌شود قبل از خرید یا تغییر معماری، وضعیت فعلی، رشد آینده، بودجه و توان تیم پشتیبانی مستند شود.`,
    image: `${BLOB}/article-images/article${n}.jpg`,
    tags: ["زیرساخت", "شبکه", "راهنما", "techbox"],
    category: n % 2 === 0 ? "زیرساخت" : "آموزشی",
    authorUsername: authors[i % authors.length],
    date: seedDateIso(i),
    dateFa: seedDateFa(i),
    likes: 8 + i,
    views: 180 + i * 37,
  } satisfies SeedPost;
});

const mediaPosts: SeedPost[] = [
  {
    slug: "media-video-1-edge-ai-cameras",
    module: "media",
    title: "ویدیو: پیاده‌سازی پردازش لبه برای دوربین‌های امنیتی",
    excerpt: "در این ویدیو معماری Edge AI برای پردازش تصویر دوربین‌ها بدون ارسال همه داده‌ها به دیتاسنتر بررسی می‌شود.",
    content: "این ویدیو درباره طراحی مسیر امن و کم‌تاخیر برای پردازش تصویر دوربین‌ها در لبه شبکه است. درباره انتخاب NVR، پهنای باند، ذخیره‌سازی و پردازش محلی صحبت می‌کنیم.",
    image: `${BLOB}/thumbnails/thumbnail1.jpg`,
    videoUrl: `${BLOB}/videos/video1.mp4`,
    videoDuration: "00:24",
    videoMimeType: "video/mp4",
    videoFileSize: "16.04 MB",
    tags: ["edge-ai", "camera", "nvr", "video"],
    category: "ویدیو آموزشی",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(0),
    dateFa: seedDateFa(0),
    likes: 18,
    views: 340,
  },
  {
    slug: "media-video-2-proxmox-backup",
    module: "media",
    title: "ویدیو: سناریوی بکاپ Proxmox در شبکه سازمانی",
    excerpt: "راهکار عملی برای نگهداری بکاپ ماشین‌های مجازی، زمان‌بندی، retention و بازیابی سریع.",
    content: "در این ویدیو یک سناریوی کامل بکاپ Proxmox Backup Server را مرور می‌کنیم و درباره retention، فضای ذخیره‌سازی و تست restore صحبت می‌کنیم.",
    image: `${BLOB}/thumbnails/thumbnail2.jpg`,
    videoUrl: `${BLOB}/videos/video2.mp4`,
    videoDuration: "01:03",
    videoMimeType: "video/mp4",
    videoFileSize: "29.31 MB",
    tags: ["proxmox", "backup", "virtualization", "video"],
    category: "مجازی‌سازی",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(1),
    dateFa: seedDateFa(1),
    likes: 23,
    views: 510,
  },
  {
    slug: "media-video-3-switching-vlan-lab",
    module: "media",
    title: "ویدیو: لَب VLAN و Switching برای رک‌های کوچک",
    excerpt: "ساختار VLAN، Trunk، Access و جداسازی ترافیک سرویس‌ها در یک سناریوی واقعی.",
    content: "این ویدیو یک لَب کوچک اما واقعی برای طراحی VLAN در رک‌های SMB را نشان می‌دهد؛ از پورت‌های Access تا Trunk و تست ارتباط بین شبکه‌ها.",
    image: `${BLOB}/thumbnails/thumbnail13.jpg`,
    videoUrl: `${BLOB}/videos/video3.mp4`,
    videoDuration: "01:20",
    videoMimeType: "video/mp4",
    videoFileSize: "41.84 MB",
    tags: ["vlan", "switch", "network", "video"],
    category: "شبکه",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(2),
    dateFa: seedDateFa(2),
    likes: 16,
    views: 280,
  },
  {
    slug: "media-video-4-storage-sizing",
    module: "media",
    title: "ویدیو: سایزینگ ذخیره‌سازی برای فایل‌سرور و آرشیو",
    excerpt: "چطور ظرفیت خام، ظرفیت قابل استفاده، RAID و رشد سالانه را برای ذخیره‌سازی محاسبه کنیم؟",
    content: "در این ویدیو با چند مثال واقعی ظرفیت ذخیره‌سازی را محاسبه می‌کنیم و درباره RAID، Snapshot و رشد داده‌ها تصمیم می‌گیریم.",
    image: `${BLOB}/thumbnails/thumbnail4.jpg`,
    videoUrl: `${BLOB}/videos/video4.mp4`,
    videoDuration: "01:31",
    videoMimeType: "video/mp4",
    videoFileSize: "46.27 MB",
    tags: ["storage", "raid", "nas", "video"],
    category: "ذخیره‌سازی",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(3),
    dateFa: seedDateFa(3),
    likes: 20,
    views: 430,
  },
  {
    slug: "media-video-5-firewall-policy-review",
    module: "media",
    title: "ویدیو: بازبینی Policy فایروال برای دفتر کوچک",
    excerpt: "چک‌لیست عملی برای مرتب‌سازی رول‌های فایروال، لاگ‌گیری و کاهش سطح حمله.",
    content: "در این ویدیو یک Rule Base ساده را بررسی می‌کنیم و درباره ترتیب رول‌ها، Object naming، لاگ‌ها و دسترسی‌های VPN صحبت می‌کنیم.",
    image: `${BLOB}/thumbnails/thumbnail5.jpg`,
    videoUrl: `${BLOB}/videos/video5.mp4`,
    videoDuration: "00:59",
    videoMimeType: "video/mp4",
    videoFileSize: "46.58 MB",
    tags: ["firewall", "security", "vpn", "video"],
    category: "امنیت",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(4),
    dateFa: seedDateFa(4),
    likes: 27,
    views: 610,
  },
  {
    slug: "media-video-6-monitoring-stack",
    module: "media",
    title: "ویدیو: مانیتورینگ زیرساخت با Zabbix و Prometheus",
    excerpt: "انتخاب ابزار مانیتورینگ بر اساس نیاز تیم عملیات، alerting و نگهداری طولانی‌مدت متریک‌ها.",
    content: "در این ویدیو تفاوت‌های عملی Zabbix و Prometheus را با تمرکز روی زیرساخت شبکه و سرور بررسی می‌کنیم.",
    image: `${BLOB}/thumbnails/thumbnail6.jpg`,
    videoUrl: `${BLOB}/videos/video6.mp4`,
    videoDuration: "01:04",
    videoMimeType: "video/mp4",
    videoFileSize: "47.07 MB",
    tags: ["monitoring", "zabbix", "prometheus", "video"],
    category: "مانیتورینگ",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(5),
    dateFa: seedDateFa(5),
    likes: 14,
    views: 250,
  },
  {
    slug: "media-video-7-rack-cabling",
    module: "media",
    title: "ویدیو: کابل‌کشی تمیز رک و مستندسازی پچ‌پنل",
    excerpt: "اصول ساده اما مهم برای کابل‌کشی، لیبل‌گذاری و کاهش خطای انسانی در اتاق سرور.",
    content: "این ویدیو درباره استانداردسازی کابل‌کشی و مستندسازی رک است تا در زمان عیب‌یابی و توسعه سرویس‌ها سردرگمی ایجاد نشود.",
    image: `${BLOB}/thumbnails/thumbnail7.jpg`,
    videoUrl: `${BLOB}/videos/video7.mp4`,
    videoDuration: "01:15",
    videoMimeType: "video/mp4",
    videoFileSize: "47.86 MB",
    tags: ["rack", "cabling", "documentation", "video"],
    category: "اتاق سرور",
    authorUsername: "hoomanmodeq",
    date: seedDateIso(6),
    dateFa: seedDateFa(6),
    likes: 11,
    views: 190,
  },
];

async function upsertPosts(posts: SeedPost[]) {
  for (const post of posts) {
    const author = await prisma.user.findUnique({ where: { username: post.authorUsername } });
    await prisma.post.upsert({
      where: { module_slug: { module: post.module, slug: post.slug } },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image || null,
        videoUrl: post.videoUrl || null,
        videoDuration: post.videoDuration || null,
        videoMimeType: post.videoMimeType || null,
        videoFileSize: post.videoFileSize || null,
        gallery: post.gallery || [],
        tags: post.tags || [],
        category: post.category || null,
        authorId: author?.id || null,
        authorName: author?.name || post.authorUsername,
        date: new Date(post.date),
        dateFa: post.dateFa,
        likes: post.likes || 0,
        views: post.views || 0,
        rating: typeof post.rating === "number" ? post.rating : null,
        ratingCount: post.ratingCount || 0,
        fileName: post.fileName || null,
        fileUrl: post.fileUrl || null,
        fileSize: post.fileSize || null,
        downloadCount: post.downloadCount || 0,
        brand: post.brand || null,
        model: post.model || null,
        sku: post.sku || null,
        priceLabel: post.priceLabel || null,
        availability: post.availability || null,
        warranty: post.warranty || null,
        specs: post.specs || {},
        solved: typeof post.solved === "boolean" ? post.solved : false,
        published: true,
      },
      create: {
        slug: post.slug,
        module: post.module,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image || null,
        videoUrl: post.videoUrl || null,
        videoDuration: post.videoDuration || null,
        videoMimeType: post.videoMimeType || null,
        videoFileSize: post.videoFileSize || null,
        gallery: post.gallery || [],
        tags: post.tags || [],
        category: post.category || null,
        authorId: author?.id || null,
        authorName: author?.name || post.authorUsername,
        date: new Date(post.date),
        dateFa: post.dateFa,
        likes: post.likes || 0,
        views: post.views || 0,
        rating: typeof post.rating === "number" ? post.rating : null,
        ratingCount: post.ratingCount || 0,
        fileName: post.fileName || null,
        fileUrl: post.fileUrl || null,
        fileSize: post.fileSize || null,
        downloadCount: post.downloadCount || 0,
        brand: post.brand || null,
        model: post.model || null,
        sku: post.sku || null,
        priceLabel: post.priceLabel || null,
        availability: post.availability || null,
        warranty: post.warranty || null,
        specs: post.specs || {},
        solved: typeof post.solved === "boolean" ? post.solved : false,
        published: true,
      },
    });
  }
  console.log(`Upserted ${posts.length} posts.`);
}
const engagementUsers = ["alirastegaar", "amiralmasi", "aylingharagozloo", "mohsenakbari", "mohsenshafaat", "nazaninrastegaar", "parsaghahremanpoor", "pouryamodeq", "raminrastegaar", "hannamasoumy", "fatamehrastegaar"];

const commentPools: Record<string, string[]> = {
  blog: [
    "این مقاله برای مستندسازی داخلی تیم ما ایده‌های خوبی داشت.",
    "بخش چک‌لیست اجرایی خیلی کاربردی بود و می‌شود مستقیم در پروژه استفاده کرد.",
    "خوب است در نسخه بعدی یک نمونه دیاگرام هم اضافه شود.",
    "توضیح تفاوت سناریوهای کوچک و متوسط خیلی کمک‌کننده بود.",
  ],
  review: [
    "این نوع نقد عملی از جدول مشخصات خام برای تصمیم خرید مهم‌تر است.",
    "اگر تست مصرف انرژی هم اضافه شود تصویر کامل‌تری می‌دهد.",
    "جمع‌بندی برای سناریوی مناسب استفاده خیلی مفید بود.",
    "نکته‌های محدودیت محصول باعث می‌شود انتخاب واقع‌بینانه‌تر باشد.",
  ],
  shop: [
    "برای این محصول بهتر است سناریوی استفاده و ظرفیت رشد قبل از خرید بررسی شود.",
    "اگر امکان مقایسه با مدل‌های نزدیک اضافه شود انتخاب راحت‌تر می‌شود.",
    "برای دفترهای کوچک، مصرف برق و صدای دستگاه هم مهم است.",
    "مشاوره خرید برای چنین تجهیزاتی واقعاً لازم است چون فقط مشخصات کافی نیست.",
  ],
  media: [
    "ویدیو روان بود و روند اجرای سناریو را خوب نشان می‌داد.",
    "اگر فایل دیاگرام یا کانفیگ نمونه هم کنار ویدیو باشد عالی می‌شود.",
    "برای آموزش تیم تازه‌کار، این نوع ویدیو خیلی بهتر از متن تنهاست.",
    "کیفیت توضیح مرحله‌به‌مرحله خوب بود و قابل پیاده‌سازی است.",
  ],
  news: [
    "خوب است اثر عملی این خبر روی تصمیم‌های خرید هم توضیح داده شده.",
    "این روند احتمالاً روی بودجه زیرساخت سال آینده اثر می‌گذارد.",
    "برای تیم‌های کوچک هم دانستن این تغییرات بازار مهم است.",
    "خبر کوتاه و مفید بود؛ لینک منبع رسمی هم اگر اضافه شود عالی است.",
  ],
  download: [
    "لطفاً checksum فایل هم در آینده اضافه شود.",
    "دانلود مستقیم و شمارنده دانلود برای مدیریت نسخه‌ها خیلی خوب است.",
    "اگر نسخه جدید منتشر شد همین صفحه را بروزرسانی کنید.",
    "ثبت نام فایل و حجم در دیتابیس باعث می‌شود آرشیو قابل اعتمادتر باشد.",
  ],
  forum: [
    "من هم با این مسئله در پروژه مشابه روبه‌رو شدم و جداسازی شبکه خیلی کمک کرد.",
    "به نظرم اول نیازمندی‌ها و محدودیت‌های فعلی را دقیق‌تر بنویسید تا پیشنهاد بهتر شود.",
    "اگر لاگ یا دیاگرام توپولوژی دارید، اضافه کنید تا پاسخ‌ها دقیق‌تر شوند.",
    "این سوال برای خیلی از تیم‌های کوچک پیش می‌آید و بحث خوبی است.",
  ],
};

function commentForModule(module: string, index: number) {
  const pool = commentPools[module] || commentPools.blog;
  return pool[index % pool.length];
}

async function seedEngagement(posts: SeedPost[]) {
  const users = await prisma.user.findMany({ where: { username: { in: engagementUsers } }, orderBy: { username: "asc" } });
  const timelineUsers = await prisma.user.findMany({ take: 8, orderBy: { username: "asc" } });

  for (const [postIndex, post] of posts.entries()) {
    const dbPost = await prisma.post.findUnique({ where: { module_slug: { module: post.module, slug: post.slug } } });
    if (!dbPost) continue;

    await prisma.comment.deleteMany({ where: { postId: dbPost.id } });
    await prisma.like.deleteMany({ where: { module: post.module, slug: post.slug } });

    const selected = users.slice(postIndex % 3, Math.min(users.length, (postIndex % 3) + 5));
    for (const user of selected) {
      await prisma.like.upsert({
        where: { fingerprint_module_slug: { fingerprint: user.id, module: post.module, slug: post.slug } },
        update: {},
        create: { fingerprint: user.id, userId: user.id, module: post.module, slug: post.slug },
      });
    }
    await prisma.post.update({ where: { id: dbPost.id }, data: { likes: selected.length } });

    const commentCount = post.module === "forum" ? 4 : 3;
    for (let i = 0; i < Math.min(commentCount, users.length); i += 1) {
      const user = users[(postIndex + i) % users.length];
      const text = commentForModule(post.module, postIndex + i);
      await prisma.comment.create({ data: { postId: dbPost.id, authorId: user.id, authorName: user.name, text, likes: i % 3 } });
    }
  }

  const timelineEventsDb = await prisma.timelineEvent.findMany({ where: { published: true }, take: 17, orderBy: { dateGr: "asc" } });
  for (const [eventIndex, event] of timelineEventsDb.entries()) {
    await prisma.timelineComment.deleteMany({ where: { eventId: event.id } });
    await prisma.timelineLike.deleteMany({ where: { eventId: event.id } });
    for (const user of timelineUsers.slice(0, 4)) {
      await prisma.timelineLike.upsert({
        where: { timeline_fingerprint_eventId: { fingerprint: user.id, eventId: event.id } },
        update: {},
        create: { fingerprint: user.id, userId: user.id, eventId: event.id },
      });
    }
    const texts = [
      "این نقطه عطف نشان می‌دهد فناوری همیشه با نیاز واقعی انسان جلو رفته است.",
      "ارتباط این رویداد با زیرساخت‌های امروزی خیلی جالب است.",
      "خوب است در آینده منابع تاریخی بیشتری هم کنار کارت اضافه شود.",
    ];
    for (let i = 0; i < 3 && i < timelineUsers.length; i += 1) {
      await prisma.timelineComment.create({ data: { eventId: event.id, authorName: timelineUsers[(eventIndex + i) % timelineUsers.length].name, text: texts[i] } });
    }
  }
  console.log(`Seeded varied engagement for ${posts.length} posts and ${timelineEventsDb.length} timeline events.`);
}

const timelineEvents = [
  { title: "نخستین ابزارهای سنگی", description: "آغاز فناوری با ابزارهای سنگی ساده، توان انسان را برای شکار، ساخت و بقا چند برابر کرد.", image: `${BLOB}/timeline-images/timeline1.jpg`, dateGr: "0001-01-01T00:00:00.000Z", dateFa: "حدود ۳.۳ میلیون سال پیش", year: 1, yearFa: 1, importance: 9, tags: ["ابزار", "سنگ", "آغاز فناوری"] },
  { title: "مهار آتش", description: "کنترل آتش مسیر پخت غذا، گرمایش، امنیت و شکل‌گیری اجتماع‌های انسانی را دگرگون کرد.", image: `${BLOB}/timeline-images/timeline2.jpg`, dateGr: "0002-01-01T00:00:00.000Z", dateFa: "حدود ۱ میلیون سال پیش", year: 2, yearFa: 2, importance: 9, tags: ["آتش", "انرژی", "تمدن"] },
  { title: "انقلاب کشاورزی", description: "کشاورزی و اهلی‌سازی حیوانات باعث سکونت‌گاه‌های پایدار، ذخیره غذا و رشد شهرها شد.", image: `${BLOB}/timeline-images/timeline3.jpg`, dateGr: "0003-01-01T00:00:00.000Z", dateFa: "حدود ۱۰٬۰۰۰ سال پیش", year: 3, yearFa: 3, importance: 8, tags: ["کشاورزی", "تمدن", "شهرنشینی"] },
  { title: "اختراع چرخ", description: "چرخ حمل‌ونقل، سفال‌گری، ماشین‌های اولیه و در نهایت مهندسی مکانیک را متحول کرد.", image: `${BLOB}/timeline-images/timeline4.jpg`, dateGr: "0004-01-01T00:00:00.000Z", dateFa: "حدود ۳۵۰۰ پیش از میلاد", year: 4, yearFa: 4, importance: 8, tags: ["چرخ", "حمل‌ونقل", "مکانیک"] },
  { title: "خط و ثبت دانش", description: "نوشتار امکان انتقال دقیق دانش، حسابداری، قانون و مدیریت فناوری در مقیاس بزرگ را فراهم کرد.", image: `${BLOB}/timeline-images/timeline5.jpg`, dateGr: "0005-01-01T00:00:00.000Z", dateFa: "حدود ۳۲۰۰ پیش از میلاد", year: 5, yearFa: 5, importance: 9, tags: ["نوشتار", "دانش", "اطلاعات"] },
  { title: "عصر برنز", description: "آلیاژسازی مس و قلع ابزارها، سلاح‌ها و سازه‌های مقاوم‌تری را وارد زندگی انسان کرد.", image: `${BLOB}/timeline-images/timeline6.jpg`, dateGr: "0006-01-01T00:00:00.000Z", dateFa: "حدود ۳۰۰۰ پیش از میلاد", year: 6, yearFa: 6, importance: 7, tags: ["فلزکاری", "برنز", "ابزار"] },
  { title: "عصر آهن", description: "فناوری استخراج و شکل‌دهی آهن، کشاورزی، جنگ‌افزار و ساخت‌وساز را وارد مرحله تازه‌ای کرد.", image: `${BLOB}/timeline-images/timeline7.jpg`, dateGr: "0007-01-01T00:00:00.000Z", dateFa: "حدود ۱۲۰۰ پیش از میلاد", year: 7, yearFa: 7, importance: 7, tags: ["آهن", "متالورژی", "صنعت"] },
  { title: "کاغذ و تکثیر دانش", description: "کاغذ هزینه ثبت و انتقال دانش را کاهش داد و زیرساختی برای آموزش، علم و دیوان‌سالاری شد.", image: `${BLOB}/timeline-images/timeline8.jpg`, dateGr: "0105-01-01T00:00:00.000Z", dateFa: "۱۰۵ میلادی", year: 105, yearFa: 105, importance: 8, tags: ["کاغذ", "دانش", "آموزش"] },
  { title: "قطب‌نما و ناوبری", description: "قطب‌نما سفرهای دریایی، تجارت جهانی و نقشه‌برداری دقیق‌تر را ممکن کرد.", image: `${BLOB}/timeline-images/timeline9.jpg`, dateGr: "1100-01-01T00:00:00.000Z", dateFa: "حدود قرن ۱۲ میلادی", year: 1100, yearFa: 1100, importance: 7, tags: ["قطب‌نما", "ناوبری", "تجارت"] },
  { title: "چاپ با حروف متحرک", description: "چاپ گوتنبرگ سرعت تکثیر کتاب و انتشار دانش را به شکل بی‌سابقه‌ای افزایش داد.", image: `${BLOB}/timeline-images/timeline10.jpg`, dateGr: "1450-01-01T00:00:00.000Z", dateFa: "حدود ۱۴۵۰ میلادی", year: 1450, yearFa: 1450, importance: 9, tags: ["چاپ", "کتاب", "رسانه"] },
  { title: "موتور بخار", description: "موتور بخار پایه انقلاب صنعتی، کارخانه‌ها، راه‌آهن و تولید انبوه مدرن شد.", image: `${BLOB}/timeline-images/timeline11.jpg`, dateGr: "1712-01-01T00:00:00.000Z", dateFa: "۱۷۱۲ میلادی", year: 1712, yearFa: 1712, importance: 9, tags: ["بخار", "انقلاب صنعتی", "ماشین"] },
  { title: "تلگراف و ارتباط سریع", description: "تلگراف برای نخستین بار پیام‌ها را سریع‌تر از حمل فیزیکی در مسافت‌های طولانی منتقل کرد.", image: `${BLOB}/timeline-images/timeline12.jpg`, dateGr: "1837-01-01T00:00:00.000Z", dateFa: "۱۸۳۷ میلادی", year: 1837, yearFa: 1837, importance: 8, tags: ["تلگراف", "ارتباطات", "شبکه"] },
  { title: "تلفن", description: "تلفن ارتباط صوتی زنده را به خانه‌ها، شرکت‌ها و شبکه‌های شهری آورد.", image: `${BLOB}/timeline-images/timeline13.jpg`, dateGr: "1876-01-01T00:00:00.000Z", dateFa: "۱۸۷۶ میلادی", year: 1876, yearFa: 1876, importance: 8, tags: ["تلفن", "صوت", "ارتباطات"] },
  { title: "برق‌رسانی و روشنایی", description: "شبکه‌های برق و لامپ‌های کاربردی، کار شبانه، کارخانه‌های مدرن و زندگی شهری را متحول کردند.", image: `${BLOB}/timeline-images/timeline14.jpg`, dateGr: "1879-01-01T00:00:00.000Z", dateFa: "۱۸۷۹ میلادی", year: 1879, yearFa: 1879, importance: 9, tags: ["برق", "لامپ", "انرژی"] },
  { title: "پرواز کنترل‌شده", description: "پرواز برادران رایت نشان داد ماشین‌های سنگین‌تر از هوا می‌توانند کنترل‌شده و پایدار پرواز کنند.", image: `${BLOB}/timeline-images/timeline15.jpg`, dateGr: "1903-01-01T00:00:00.000Z", dateFa: "۱۹۰۳ میلادی", year: 1903, yearFa: 1903, importance: 8, tags: ["هواپیما", "پرواز", "حمل‌ونقل"] },
  { title: "ترانزیستور", description: "ترانزیستور کوچک‌سازی، پایداری و رشد انفجاری رایانه‌ها و الکترونیک دیجیتال را ممکن کرد.", image: `${BLOB}/timeline-images/timeline16.jpg`, dateGr: "1947-01-01T00:00:00.000Z", dateFa: "۱۹۴۷ میلادی", year: 1947, yearFa: 1947, importance: 10, tags: ["ترانزیستور", "رایانه", "الکترونیک"] },
  { title: "اینترنت و وب", description: "شبکه‌های رایانه‌ای و وب، دسترسی جهانی به اطلاعات، ارتباطات و اقتصاد دیجیتال را شکل دادند.", image: `${BLOB}/timeline-images/timeline17.jpg`, dateGr: "1989-01-01T00:00:00.000Z", dateFa: "۱۹۸۹ میلادی", year: 1989, yearFa: 1989, importance: 10, tags: ["اینترنت", "وب", "اطلاعات"] },
];

async function replaceTimeline() {
  await prisma.timelineCommentVote.deleteMany();
  await prisma.timelineComment.deleteMany();
  await prisma.timelineLike.deleteMany();
  await prisma.timelineEvent.deleteMany();
  for (const event of timelineEvents) {
    await prisma.timelineEvent.create({
      data: {
        title: event.title,
        description: event.description,
        image: event.image,
        dateGr: new Date(event.dateGr),
        dateFa: event.dateFa,
        year: event.year,
        yearFa: event.yearFa,
        importance: event.importance,
        tags: event.tags,
        published: true,
      },
    });
  }
  console.log(`Replaced timeline with ${timelineEvents.length} technology history events.`);
}

const duplicateSeedTexts = [
  "مقاله کاربردی بود؛ مخصوصاً بخش چک‌لیست اجرایی برای تیم‌های کوچک خیلی کمک می‌کند.",
  "در تصمیم خرید، بخش تجربه عملی و محدودیت‌های محصول برای ما از مشخصات خام مهم‌تر است.",
  "برای انتخاب نهایی بهتر است سناریوی استفاده و ظرفیت رشد هم کنار مشخصات محصول بررسی شود.",
  "ویدیو روان و قابل فهم بود؛ اگر فایل‌های نمونه یا دیاگرام هم اضافه شود عالی می‌شود.",
  "خوب است کنار خبر، اثر عملی آن روی تصمیم‌های زیرساختی هم توضیح داده شده.",
  "لطفاً اگر checksum یا نسخه جدیدتر منتشر شد در همین صفحه بروزرسانی شود.",
  "مطلب مفیدی بود و برای تصمیم‌گیری فنی کمک کرد.",
];

async function cleanOldContent() {
  const seedUsernames = seedUsers.map((u) => u.username);
  const seedPosts = [...mediaPosts, ...articlePosts, ...reviewPosts, ...newsPosts, ...downloadPosts, ...forumPosts, ...productPosts];
  const modules = ["blog", "news", "media", "review", "download", "shop", "forum"];
  const seedByModule = new Map<string, string[]>();
  for (const post of seedPosts) seedByModule.set(post.module, [...(seedByModule.get(post.module) || []), post.slug]);

  if (DRY_RUN) console.log("DRY RUN: cleanup will only report old content/users, no deletes.");
  if (!DRY_RUN) await prisma.comment.deleteMany({ where: { text: { in: duplicateSeedTexts } } });

  for (const moduleKey of modules) {
    const keep = seedByModule.get(moduleKey) || [];
    const oldPosts = await prisma.post.findMany({ where: { module: moduleKey, slug: { notIn: keep } }, select: { slug: true } });
    if (oldPosts.length) {
      const oldSlugs = oldPosts.map((post: any) => post.slug);
      console.log(`${DRY_RUN ? "DRY RUN: would remove" : "Removing"} ${oldSlugs.length} old ${moduleKey} posts: ${oldSlugs.join(", ")}`);
      if (!DRY_RUN) {
        await prisma.like.deleteMany({ where: { module: moduleKey, slug: { in: oldSlugs } } });
        await prisma.post.deleteMany({ where: { module: moduleKey, slug: { in: oldSlugs } } });
      }
    }
  }

  const oldUsers = await prisma.user.findMany({ where: { username: { notIn: seedUsernames } }, select: { id: true } });
  const oldUserIds = oldUsers.map((u: any) => u.id);
  if (oldUserIds.length) {
    console.log(`${DRY_RUN ? "DRY RUN: would remove" : "Removing"} ${oldUserIds.length} old users.`);
    if (!DRY_RUN) {
      await prisma.post.updateMany({ where: { authorId: { in: oldUserIds } }, data: { authorId: null } });
      await prisma.comment.updateMany({ where: { authorId: { in: oldUserIds } }, data: { authorId: null } });
      await prisma.user.deleteMany({ where: { id: { in: oldUserIds } } });
    }
  }

  console.log(`${DRY_RUN ? "Dry-run checked" : "Cleaned"} old content/users. Kept ${seedPosts.length} posts and ${seedUsers.length} users.`);
}
const defaultRedirects = [
  { sourceModule: "news", sourceSlug: "open-source-siem-growth", targetModule: "news", targetSlug: "news-03", reason: "old static news slug" },
  { sourceModule: "blog", sourceSlug: "zero-trust-for-smb-iran", targetModule: "blog", targetSlug: "article-06-zero-trust", reason: "old static article slug" },
  { sourceModule: "media", sourceSlug: "proxmox-ha-demo-video", targetModule: "media", targetSlug: "media-video-2-proxmox-backup", reason: "old static media slug" },
  { sourceModule: "review", sourceSlug: "qnap-2277-full-review", targetModule: "review", targetSlug: "review-02", reason: "old static review slug" },
];

async function seedRedirects() {
  for (const row of defaultRedirects) {
    await prisma.slugRedirect.upsert({
      where: { source_module_slug: { sourceModule: row.sourceModule, sourceSlug: row.sourceSlug } },
      update: row,
      create: row,
    });
  }
  console.log(`Upserted ${defaultRedirects.length} slug redirects.`);
}

async function upsertUsers() {
  const password = await bcrypt.hash(_PASSWORD, 10);
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: `${user.username}@techbox.local`,
        role: user.role,
        roleFa: user.roleFa,
        job: user.job || null,
        modules: user.modules || [],
        avatar: user.avatar,
      },
      create: {
        name: user.name,
        username: user.username,
        email: `${user.username}@techbox.local`,
        role: user.role,
        roleFa: user.roleFa,
        job: user.job || null,
        modules: user.modules || [],
        avatar: user.avatar,
        password,
      },
    });
  }
  console.log(`Upserted ${seedUsers.length} real users.`);
}

async function main() {
  const stepArg = process.argv.find((arg) => arg.startsWith("--step="));
  const step = stepArg?.split("=")[1] || "all";
  if (step === "clean" || step === "reset" || step === "all") await cleanOldContent();
  if (step === "0" || step === "users" || step === "all") await upsertUsers();
  if (step === "1" || step === "media" || step === "all") await upsertPosts(mediaPosts);
  if (step === "2" || step === "articles" || step === "blog" || step === "all") await upsertPosts(articlePosts);
  if (step === "3" || step === "reviews" || step === "review" || step === "all") await upsertPosts(reviewPosts);
  if (step === "4" || step === "news" || step === "all") await upsertPosts(newsPosts);
  if (step === "5" || step === "downloads" || step === "download" || step === "all") await upsertPosts(downloadPosts);
  if (step === "6" || step === "forum" || step === "all") {
    await upsertPosts(forumPosts);
    await upsertComments(seedComments);
    await seedLikesForPosts([...forumPosts, ...articlePosts, ...reviewPosts, ...newsPosts, ...mediaPosts, ...downloadPosts]);
  }
  if (step === "7" || step === "shop" || step === "products" || step === "all") await upsertPosts(productPosts);
  if (step === "redirects" || step === "all") await seedRedirects();
  if (step === "timeline" || step === "all") await replaceTimeline();
  if (step === "8" || step === "engagement" || step === "all") {
    await seedEngagement([...mediaPosts, ...articlePosts, ...reviewPosts, ...newsPosts, ...downloadPosts, ...forumPosts, ...productPosts]);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
