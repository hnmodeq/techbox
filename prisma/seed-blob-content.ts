import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BLOB = "https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com";
const PASSWORD = "123456xX";
const ALL_MODULES = ["blog", "news", "media", "review", "download", "shop", "forum", "tools"];

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
};





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
    date: "2026-07-22",
    dateFa: "31 تیر 1405",
    fileName: "pdf1.pdf",
    fileUrl: `${BLOB}/archive/pdf/pdf1.pdf`,
    fileSize: "PDF",
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
    date: "2026-07-21",
    dateFa: "30 تیر 1405",
    fileName: "pdf2.pdf",
    fileUrl: `${BLOB}/archive/pdf/pdf2.pdf`,
    fileSize: "PDF",
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
    date: "2026-07-20",
    dateFa: "29 تیر 1405",
    fileName: "zip1.zip",
    fileUrl: `${BLOB}/archive/zip/zip1.zip`,
    fileSize: "ZIP",
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
    date: `2026-07-${String(22 - i).padStart(2, "0")}`,
    dateFa: `${31 - i} تیر 1405`,
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
    date: `2026-07-${String(22 - i).padStart(2, "0")}`,
    dateFa: `${31 - i} تیر 1405`,
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
  return {
    slug: `article-${String(n).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "techbox"}`,
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
    date: `2026-07-${String(22 - i).padStart(2, "0")}`,
    dateFa: `${31 - i} تیر 1405`,
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
    tags: ["edge-ai", "camera", "nvr", "video"],
    category: "ویدیو آموزشی",
    authorUsername: "hoomanmodeq",
    date: "2026-07-22",
    dateFa: "31 تیر 1405",
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
    tags: ["proxmox", "backup", "virtualization", "video"],
    category: "مجازی‌سازی",
    authorUsername: "hoomanmodeq",
    date: "2026-07-21",
    dateFa: "30 تیر 1405",
    likes: 23,
    views: 510,
  },
  {
    slug: "media-video-3-switching-vlan-lab",
    module: "media",
    title: "ویدیو: لَب VLAN و Switching برای رک‌های کوچک",
    excerpt: "ساختار VLAN، Trunk، Access و جداسازی ترافیک سرویس‌ها در یک سناریوی واقعی.",
    content: "این ویدیو یک لَب کوچک اما واقعی برای طراحی VLAN در رک‌های SMB را نشان می‌دهد؛ از پورت‌های Access تا Trunk و تست ارتباط بین شبکه‌ها.",
    image: `${BLOB}/thumbnails/thumbnail3.jpg`,
    videoUrl: `${BLOB}/videos/video3.mp4`,
    tags: ["vlan", "switch", "network", "video"],
    category: "شبکه",
    authorUsername: "hoomanmodeq",
    date: "2026-07-20",
    dateFa: "29 تیر 1405",
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
    tags: ["storage", "raid", "nas", "video"],
    category: "ذخیره‌سازی",
    authorUsername: "hoomanmodeq",
    date: "2026-07-19",
    dateFa: "28 تیر 1405",
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
    tags: ["firewall", "security", "vpn", "video"],
    category: "امنیت",
    authorUsername: "hoomanmodeq",
    date: "2026-07-18",
    dateFa: "27 تیر 1405",
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
    tags: ["monitoring", "zabbix", "prometheus", "video"],
    category: "مانیتورینگ",
    authorUsername: "hoomanmodeq",
    date: "2026-07-17",
    dateFa: "26 تیر 1405",
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
    tags: ["rack", "cabling", "documentation", "video"],
    category: "اتاق سرور",
    authorUsername: "hoomanmodeq",
    date: "2026-07-16",
    dateFa: "25 تیر 1405",
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
        gallery: JSON.stringify(post.gallery || []),
        tags: JSON.stringify(post.tags || []),
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
        gallery: JSON.stringify(post.gallery || []),
        tags: JSON.stringify(post.tags || []),
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
        solved: typeof post.solved === "boolean" ? post.solved : false,
        published: true,
      },
    });
  }
  console.log(`Upserted ${posts.length} posts.`);
}

async function upsertUsers() {
  const password = await bcrypt.hash(PASSWORD, 10);
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email: `${user.username}@techbox.local`,
        role: user.role,
        roleFa: user.roleFa,
        job: user.job || null,
        modules: JSON.stringify(user.modules || []),
        avatar: user.avatar,
      },
      create: {
        name: user.name,
        username: user.username,
        email: `${user.username}@techbox.local`,
        role: user.role,
        roleFa: user.roleFa,
        job: user.job || null,
        modules: JSON.stringify(user.modules || []),
        avatar: user.avatar,
        password,
      },
    });
  }
  console.log(`Upserted ${seedUsers.length} real users. Password for all: ${PASSWORD}`);
}

async function main() {
  const stepArg = process.argv.find((arg) => arg.startsWith("--step="));
  const step = stepArg?.split("=")[1] || "all";
  if (step === "0" || step === "users" || step === "all") await upsertUsers();
  if (step === "1" || step === "media" || step === "all") await upsertPosts(mediaPosts);
  if (step === "2" || step === "articles" || step === "blog" || step === "all") await upsertPosts(articlePosts);
  if (step === "3" || step === "reviews" || step === "review" || step === "all") await upsertPosts(reviewPosts);
  if (step === "4" || step === "news" || step === "all") await upsertPosts(newsPosts);
  if (step === "5" || step === "downloads" || step === "download" || step === "all") await upsertPosts(downloadPosts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
