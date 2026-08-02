/*
 * Populate a real database with an idempotent set of Persian infrastructure
 * content for visual QA of the homepage. This is deliberately a CLI script:
 * the homepage itself never renders fixtures, placeholders, or hard-coded
 * cards. Re-running it is safe — users, posts, comments, accepted answers,
 * and likes are looked up by stable keys before insertion.
 *
 * Run only against the intended database:
 *   pnpm content:populate-home
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Person = {
  username: string;
  name: string;
  job: string;
  bio: string;
};

type Article = {
  module: "blog" | "news" | "forum";
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  daysAgo: number;
  solved?: boolean;
  views: number;
};

const PEOPLE: Person[] = [
  {
    username: "community_mahsa",
    name: "مهسا نادری",
    job: "مهندس قابلیت اطمینان سرویس",
    bio: "روی مشاهده‌پذیری، ظرفیت‌سنجی و پایداری سرویس‌های ابری کار می‌کند.",
  },
  {
    username: "community_arash",
    name: "آرش رستمی",
    job: "مهندس شبکه",
    bio: "علاقه‌مند به طراحی شبکه‌های امن، WireGuard و عیب‌یابی مسیرهای پیچیده است.",
  },
  {
    username: "community_sara",
    name: "سارا کریمی",
    job: "مهندس پلتفرم",
    bio: "تیم‌های محصول را در مسیر Kubernetes، CI/CD و استانداردسازی محیط‌ها همراهی می‌کند.",
  },
  {
    username: "community_pouya",
    name: "پویا حاتمی",
    job: "توسعه‌دهنده بک‌اند",
    bio: "به طراحی API، PostgreSQL و الگوهای پایدار اتصال به پایگاه‌داده علاقه دارد.",
  },
  {
    username: "community_elham",
    name: "الهام صادقی",
    job: "کارشناس امنیت زیرساخت",
    bio: "تمرکزش روی کنترل دسترسی، لاگ‌برداری و امن‌سازی سرویس‌های اینترنتی است.",
  },
  {
    username: "community_milad",
    name: "میلاد یوسفی",
    job: "مهندس ذخیره‌سازی",
    bio: "از تجربه‌های عملی در Ceph، Proxmox و آزمون بازیابی نسخه پشتیبان می‌نویسد.",
  },
  {
    username: "community_nazanin",
    name: "نازنین مرادی",
    job: "مهندس عملیات",
    bio: "به بهبود گردش رخداد، داشبوردهای عملیاتی و مستندسازی Runbookها علاقه دارد.",
  },
  {
    username: "community_reza",
    name: "رضا امینی",
    job: "معمار راهکارهای ابری",
    bio: "در طراحی معماری‌های مقیاس‌پذیر و انتخاب ابزارهای زیرساختی همکاری می‌کند.",
  },
];

const ARTICLES: Article[] = [
  // Solved Forum topics — eligible for the main Community feature.
  {
    module: "forum",
    slug: "prometheus-high-cardinality-guide",
    title: "برای کنترل high cardinality در Prometheus از کجا شروع کنیم؟",
    excerpt: "بعد از اضافه کردن چند label جدید، مصرف حافظه Prometheus بالا رفته است. چه روشی برای پیدا کردن سری‌های پرهزینه پیشنهاد می‌کنید؟",
    content: "در خوشه Kubernetes ما بعد از اضافه شدن labelهای پویا، تعداد سری‌های Prometheus رشد کرده است. دنبال روشی هستم که ابتدا منابع پرمصرف را پیدا کنم و بعد بدون از دست دادن داده‌های مفید، labelها را اصلاح کنیم.",
    category: "مانیتورینگ",
    tags: ["Prometheus", "Observability", "Kubernetes"],
    author: "community_mahsa",
    daysAgo: 12,
    solved: true,
    views: 184,
  },
  {
    module: "forum",
    slug: "private-registry-imagepullbackoff",
    title: "خطای ImagePullBackOff برای رجیستری خصوصی را چطور عیب‌یابی کنیم؟",
    excerpt: "Podها روی یک node به رجیستری خصوصی دسترسی دارند اما روی چند node دیگر ImagePullBackOff می‌گیرند.",
    content: "imagePullSecret در namespace وجود دارد، اما خطا فقط روی بخشی از nodeها دیده می‌شود. می‌خواهیم بدانیم ترتیب درست بررسی DNS، گواهی و دسترسی رجیستری چیست.",
    category: "Kubernetes",
    tags: ["Kubernetes", "Container Registry", "Troubleshooting"],
    author: "community_sara",
    daysAgo: 10,
    solved: true,
    views: 161,
  },
  {
    module: "forum",
    slug: "postgresql-connection-pool-pattern",
    title: "الگوی امن برای مدیریت connection pool در PostgreSQL چیست؟",
    excerpt: "در زمان افزایش ترافیک، اتصال‌های سرویس به PostgreSQL به سقف می‌رسند. برای تشخیص و کنترل آن چه الگوهایی داریم؟",
    content: "یک API چند نمونه‌ای به PostgreSQL متصل است و در زمان اوج ترافیک خطای timeout اتصال می‌گیریم. هدف این است که هم تنظیمات pool و هم مسیرهای leak احتمالی را مرحله‌به‌مرحله بررسی کنیم.",
    category: "پایگاه‌داده",
    tags: ["PostgreSQL", "Connection Pool", "Backend"],
    author: "community_pouya",
    daysAgo: 8,
    solved: true,
    views: 208,
  },
  {
    module: "forum",
    slug: "proxmox-restore-drill-checklist",
    title: "برای آزمون بازیابی نسخه پشتیبان در Proxmox چه چک‌لیستی لازم است؟",
    excerpt: "نسخه پشتیبان روزانه داریم، اما هنوز بازیابی کامل یک سرویس را در محیط جداگانه تمرین نکرده‌ایم.",
    content: "می‌خواهیم یک Restore Drill قابل تکرار طراحی کنیم؛ از انتخاب نمونه تا بررسی سازگاری داده و ثبت زمان بازیابی. تجربه‌های عملی شما چیست؟",
    category: "ذخیره‌سازی",
    tags: ["Proxmox", "Backup", "Disaster Recovery"],
    author: "community_milad",
    daysAgo: 6,
    solved: true,
    views: 143,
  },
  // Unsolved Forum topics — eligible only for the right Community rail.
  {
    module: "forum",
    slug: "opentelemetry-trace-context-between-services",
    title: "چطور trace context را بین سرویس‌های Node و Go حفظ کنیم؟",
    excerpt: "در مسیر یک درخواست، trace در سرویس Node شروع می‌شود اما هنگام ورود به سرویس Go شناسه جدید می‌گیرد.",
    content: "هر دو سرویس از OpenTelemetry استفاده می‌کنند ولی بعضی درخواست‌ها در داشبورد به چند trace جدا تبدیل می‌شوند. دنبال تجربه عملی درباره propagation و middleware هستیم.",
    category: "مشاهده‌پذیری",
    tags: ["OpenTelemetry", "Tracing", "Microservices"],
    author: "community_nazanin",
    daysAgo: 4,
    solved: false,
    views: 96,
  },
  {
    module: "forum",
    slug: "ceph-latency-after-rebalance",
    title: "بعد از rebalance در Ceph چطور علت latency را پیدا کنیم؟",
    excerpt: "پس از اضافه کردن چند OSD، latency نوشتن بالا رفته و بعضی VMها کند شده‌اند.",
    content: "وضعیت کلی cluster healthy است اما نمودار latency بعد از rebalance تغییر کرده. چه metricها و چه ترتیب بررسی‌ای برای جدا کردن مشکل شبکه از دیسک پیشنهاد می‌کنید؟",
    category: "ذخیره‌سازی",
    tags: ["Ceph", "Storage", "Performance"],
    author: "community_reza",
    daysAgo: 3,
    solved: false,
    views: 121,
  },
  {
    module: "forum",
    slug: "nginx-rate-limit-per-api-consumer",
    title: "rate limit در Nginx را برای هر مصرف‌کننده API چگونه طراحی کنیم؟",
    excerpt: "می‌خواهیم بدون اثر گذاشتن روی مشتریان دیگر، مصرف‌کننده‌های پرخطا را محدود کنیم.",
    content: "کلید API در header می‌آید و بخشی از ترافیک از reverse proxy عبور می‌کند. دنبال الگویی هستیم که هم قابل مشاهده باشد و هم در زمان خطا به اشتباه کاربران سالم را محدود نکند.",
    category: "وب و شبکه",
    tags: ["Nginx", "API", "Rate Limiting"],
    author: "community_elham",
    daysAgo: 2,
    solved: false,
    views: 88,
  },
  {
    module: "forum",
    slug: "kubernetes-rolling-update-readiness",
    title: "چطور readiness probe را برای rolling update بدون قطعی تنظیم کنیم؟",
    excerpt: "در زمان rollout، بخشی از درخواست‌ها پیش از آماده شدن کامل Pod جدید به آن می‌رسند.",
    content: "سرویس ما warm-up کوتاهی دارد و با وجود readiness probe هنوز خطاهای گذرا می‌بینیم. می‌خواهیم تفاوت startup، readiness و preStop را در یک الگوی عملی بررسی کنیم.",
    category: "Kubernetes",
    tags: ["Kubernetes", "Deployment", "Reliability"],
    author: "community_arash",
    daysAgo: 1,
    solved: false,
    views: 109,
  },
  {
    module: "forum",
    slug: "wireguard-site-to-site-monitoring",
    title: "برای مانیتورینگ تونل‌های WireGuard بین دو سایت چه شاخص‌هایی مهم‌اند؟",
    excerpt: "تونل پایدار است اما گاهی کاربران از کندی مقطعی شکایت می‌کنند و لاگ کافی برای تشخیص نداریم.",
    content: "دو سایت با WireGuard به هم متصل‌اند و مسیرهای داخلی از تونل عبور می‌کنند. چه metric، health check و alertی برای تشخیص سریع افت کیفیت پیشنهاد می‌کنید؟",
    category: "شبکه",
    tags: ["WireGuard", "Network", "Monitoring"],
    author: "community_arash",
    daysAgo: 0,
    solved: false,
    views: 74,
  },
  // Magazine.
  {
    module: "blog",
    slug: "runbook-design-for-small-ops-teams",
    title: "Runbook خوب برای تیم‌های کوچک عملیات چه ویژگی‌هایی دارد؟",
    excerpt: "Runbook زمانی ارزشمند است که در لحظه رخداد، تصمیم‌گیری را کوتاه و قابل تکرار کند.",
    content: "یک Runbook عملی از نشانه‌های شروع رخداد، فرضیه‌های قابل بررسی، دستورهای امن، معیار پایان و مسیر escalation تشکیل می‌شود. در این یادداشت یک چارچوب کوچک و قابل استفاده برای سرویس‌های روزمره مرور می‌کنیم.",
    category: "عملیات",
    tags: ["Runbook", "SRE", "Operations"],
    author: "community_nazanin",
    daysAgo: 9,
    views: 238,
  },
  {
    module: "blog",
    slug: "capacity-planning-before-traffic-spike",
    title: "پیش از رشد ترافیک، ظرفیت‌سنجی را از کدام نمودارها شروع کنیم؟",
    excerpt: "ظرفیت‌سنجی فقط پیدا کردن CPU آزاد نیست؛ باید محدودیت‌های صف، اتصال و ذخیره‌سازی را کنار هم دید.",
    content: "برای یک مرور موثر، ابتدا سرویس‌های حیاتی و SLOها را مشخص کنید، سپس روند مصرف منابع، صف‌های انتظار و نرخ خطا را در بازه‌های مشابه مقایسه کنید. نتیجه باید به تصمیم‌های مشخص برای مقیاس‌پذیری برسد.",
    category: "زیرساخت",
    tags: ["Capacity Planning", "SRE", "Performance"],
    author: "community_mahsa",
    daysAgo: 7,
    views: 219,
  },
  {
    module: "blog",
    slug: "database-migration-rollback-notes",
    title: "چرا هر migration پایگاه‌داده به برنامه بازگشت نیاز دارد؟",
    excerpt: "بازگشت همیشه به معنای rollback خودکار نیست؛ گاهی امن‌ترین مسیر، سازگاری تدریجی و نگه‌داری داده است.",
    content: "در migrationهای حساس، تغییر schema، تغییر برنامه و پاک‌سازی داده باید از هم جدا شوند. این مقاله درباره ترتیب انتشار سازگار، معیار توقف و ثبت تصمیم‌های بازگشت صحبت می‌کند.",
    category: "پایگاه‌داده",
    tags: ["Database", "Migration", "PostgreSQL"],
    author: "community_pouya",
    daysAgo: 5,
    views: 204,
  },
  {
    module: "blog",
    slug: "security-review-for-public-api",
    title: "مرور امنیتی کوتاه برای APIهای عمومی",
    excerpt: "قبل از رشد یک API عمومی، کنترل دسترسی، ثبت رخداد و محدودسازی مصرف باید قابل اندازه‌گیری باشند.",
    content: "این چک‌لیست کوتاه روی احراز هویت، مجوزدهی، مدیریت secret، محدودسازی نرخ درخواست و کیفیت لاگ‌ها تمرکز دارد. هدف، پیدا کردن ریسک‌های پراثر پیش از تبدیل شدن به رخداد است.",
    category: "امنیت",
    tags: ["API Security", "Authentication", "Logging"],
    author: "community_elham",
    daysAgo: 3,
    views: 192,
  },
  // News.
  {
    module: "news",
    slug: "weekly-infrastructure-brief-observability",
    title: "بولتن زیرساخت: چرا مشاهده‌پذیری از داشبورد فراتر می‌رود؟",
    excerpt: "تیم‌های فنی در مرورهای هفتگی خود بیش از گذشته روی ارتباط metric، log و trace تمرکز دارند.",
    content: "در این بولتن، چند نکته عملی درباره ساختن داشبوردهای تصمیم‌ساز، نگه‌داری context در رخدادها و انتخاب alertهای قابل اقدام مرور می‌شود.",
    category: "زیرساخت",
    tags: ["Observability", "SRE", "News"],
    author: "community_mahsa",
    daysAgo: 4,
    views: 302,
  },
  {
    module: "news",
    slug: "weekly-infrastructure-brief-platform-teams",
    title: "بولتن پلتفرم: استانداردسازی مسیر تحویل نرم‌افزار",
    excerpt: "تیم‌های پلتفرم با ساده کردن مسیرهای تکراری، زمان تمرکز تیم‌های محصول را افزایش می‌دهند.",
    content: "این گزارش کوتاه به الگوهای مشترک برای templateهای سرویس، کنترل کیفیت CI و بازخورد سریع در فرآیند انتشار می‌پردازد.",
    category: "پلتفرم",
    tags: ["Platform Engineering", "CI/CD", "News"],
    author: "community_sara",
    daysAgo: 3,
    views: 275,
  },
  {
    module: "news",
    slug: "weekly-infrastructure-brief-data-resilience",
    title: "بولتن داده: آزمون بازیابی، بخش فراموش‌شده پشتیبان‌گیری",
    excerpt: "داشتن نسخه پشتیبان بدون آزمون بازیابی، تصویر دقیقی از آمادگی عملیاتی نمی‌دهد.",
    content: "در این بولتن به طراحی سناریوی بازیابی، ثبت زمان واقعی بازگردانی و بررسی وابستگی‌های سرویس پس از restore پرداخته‌ایم.",
    category: "داده",
    tags: ["Backup", "Resilience", "News"],
    author: "community_milad",
    daysAgo: 2,
    views: 244,
  },
  {
    module: "news",
    slug: "weekly-infrastructure-brief-network-visibility",
    title: "بولتن شبکه: دیدپذیری مسیر، پایه عیب‌یابی سریع‌تر",
    excerpt: "وقتی تغییر مسیر یا افت کیفیت رخ می‌دهد، داده‌های درست از حدس‌های طولانی ارزشمندترند.",
    content: "این مرور کوتاه روی ثبت latency، خطای DNS، کیفیت تونل‌ها و انتخاب آستانه‌های مناسب برای هشدارهای شبکه تمرکز دارد.",
    category: "شبکه",
    tags: ["Network", "Monitoring", "News"],
    author: "community_arash",
    daysAgo: 1,
    views: 226,
  },
];

const SOLUTIONS: Array<{ slug: string; author: string; text: string }> = [
  {
    slug: "prometheus-high-cardinality-guide",
    author: "community_sara",
    text: "ابتدا از TSDB status و داشبورد cardinality برای پیدا کردن labelهای پویا استفاده کنید. labelهایی مثل شناسه درخواست، آدرس کامل URL یا شناسه کاربر معمولاً باید از metric حذف و به log یا trace منتقل شوند. بعد از اصلاح، اثر تغییر را در یک بازه مشخص با تعداد سری و حافظه مقایسه کنید.",
  },
  {
    slug: "private-registry-imagepullbackoff",
    author: "community_elham",
    text: "روی nodeهای مشکل‌دار ابتدا resolve شدن نام رجیستری، سپس زنجیره گواهی و در نهایت دسترسی credential را جداگانه بررسی کنید. تفاوت تنظیمات runtime یا proxy بین nodeها معمولاً سرنخ اصلی است. لاگ kubelet و container runtime را با یک node سالم مقایسه کنید.",
  },
  {
    slug: "postgresql-connection-pool-pattern",
    author: "community_pouya",
    text: "سقف pool را برای هر نمونه سرویس مشخص کنید و مجموع آن را با ظرفیت واقعی PostgreSQL بسنجید. سپس زمان انتظار اتصال، اتصال‌های idle و مسیرهای خطا را اندازه بگیرید. استفاده از یک pooler و بستن قطعی اتصال در مسیرهای exception، قبل از افزایش کورکورانه سقف اتصال اهمیت دارد.",
  },
  {
    slug: "proxmox-restore-drill-checklist",
    author: "community_milad",
    text: "Restore Drill را با یک سرویس غیرحیاتی در شبکه ایزوله شروع کنید. زمان شروع، پایان، حجم بازیابی‌شده، سلامت برنامه و وابستگی‌های بیرونی را ثبت کنید. مهم‌تر از موفق بودن restore، این است که بتوانید زمان واقعی رسیدن سرویس به وضعیت قابل استفاده را اندازه بگیرید.",
  },
];

const DISCUSSIONS: Array<{ slug: string; author: string; text: string }> = [
  {
    slug: "opentelemetry-trace-context-between-services",
    author: "community_pouya",
    text: "مطمئن شوید headerهای propagation در هر دو سمت preserve می‌شوند و middleware پیش از ساخت span جدید اجرا می‌شود. یک درخواست نمونه را با log کردن traceparent در مرز هر سرویس دنبال کنید تا نقطه قطع context مشخص شود.",
  },
  {
    slug: "ceph-latency-after-rebalance",
    author: "community_milad",
    text: "هم‌زمان با latency، وضعیت recovery/backfill، استفاده دیسک و خطاهای شبکه بین OSDها را کنار هم ببینید. اگر فقط یک host تفاوت دارد، مقایسه latency دیسک و NIC همان host با بقیه، مسیر بررسی را کوتاه می‌کند.",
  },
  {
    slug: "nginx-rate-limit-per-api-consumer",
    author: "community_elham",
    text: "کلید rate limit را از API key یا شناسه مصرف‌کننده بسازید و پاسخ 429 را همراه با شناسه محدودسازی در log ثبت کنید. بهتر است ابتدا نرخ را در حالت گزارش‌گیری مشاهده کنید تا آستانه‌ها بر اساس رفتار واقعی تنظیم شوند.",
  },
  {
    slug: "kubernetes-rolling-update-readiness",
    author: "community_sara",
    text: "اگر warm-up دارید، startup probe باید قبل از readiness فرصت کافی بدهد. همچنین preStop و termination grace period را با زمان قطع شدن endpoint از load balancer هماهنگ کنید تا Pod قدیمی پیش از پایان درخواست‌ها حذف نشود.",
  },
  {
    slug: "wireguard-site-to-site-monitoring",
    author: "community_arash",
    text: "علاوه بر handshake age، latency مصنوعی بین دو مقصد داخلی، packet loss و تغییر مسیر را ثبت کنید. یک health check سبک از هر سمت تونل باعث می‌شود تفاوت مشکل تونل و مشکل سرویس مقصد سریع‌تر مشخص شود.",
  },
  {
    slug: "runbook-design-for-small-ops-teams",
    author: "community_reza",
    text: "اگر Runbook یک معیار پایان روشن نداشته باشد، در رخداد فقط به فهرست دستورها تبدیل می‌شود. اضافه کردن «چه زمانی escalation کنیم» و «چه شواهدی ثبت شود» آن را عملی‌تر می‌کند.",
  },
  {
    slug: "weekly-infrastructure-brief-observability",
    author: "community_nazanin",
    text: "پیوند دادن شناسه رخداد به dashboard و queryهای آماده، زمان رسیدن تیم از alert به شواهد قابل اقدام را به شکل محسوسی کم می‌کند.",
  },
  {
    slug: "weekly-infrastructure-brief-data-resilience",
    author: "community_mahsa",
    text: "ثبت زمان بازیابی در هر Drill کمک می‌کند RTO از یک عدد روی کاغذ به یک معیار عملیاتی قابل پیگیری تبدیل شود.",
  },
];

function dateDaysAgo(days: number, extraHours = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - extraHours, 0, 0, 0);
  return date;
}

async function ensurePeople() {
  const people = new Map<string, { id: string; name: string; username: string }>();
  for (const person of PEOPLE) {
    const user = await prisma.user.upsert({
      where: { username: person.username },
      update: {},
      create: {
        username: person.username,
        name: person.name,
        email: `${person.username}@content.techbox.invalid`,
        role: "user",
        roleFa: "عضو جامعه",
        status: "active",
        job: person.job,
        bio: person.bio,
        // The script never exposes login credentials. This random hash simply
        // satisfies the account schema for persisted community identities.
        password: await bcrypt.hash(randomUUID(), 12),
      },
      select: { id: true, name: true, username: true },
    });
    people.set(person.username, user);
  }
  return people;
}

async function ensurePosts(people: Map<string, { id: string; name: string; username: string }>) {
  const posts = new Map<string, { id: string; module: string; slug: string; authorId: string }>();
  for (const article of ARTICLES) {
    const author = people.get(article.author);
    if (!author) throw new Error(`Unknown article author: ${article.author}`);
    const post = await prisma.post.upsert({
      where: { module_slug: { module: article.module, slug: article.slug } },
      update: {},
      create: {
        module: article.module,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        tags: article.tags,
        authorId: author.id,
        authorName: author.name,
        date: dateDaysAgo(article.daysAgo),
        solved: article.module === "forum" ? Boolean(article.solved) : false,
        published: true,
        status: "published",
        views: article.views,
      },
      select: { id: true, module: true, slug: true, authorId: true },
    });
    posts.set(article.slug, { ...post, authorId: post.authorId || author.id });
  }
  return posts;
}

async function ensureComment(
  postId: string,
  person: { id: string; name: string },
  text: string,
  createdAt: Date,
) {
  const existing = await prisma.comment.findFirst({
    where: { postId, authorId: person.id, text, deletedAt: null },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.comment.create({
    data: {
      postId,
      authorId: person.id,
      authorName: person.name,
      text,
      status: "approved",
      createdAt,
    },
    select: { id: true },
  });
}

async function ensureConversation(
  people: Map<string, { id: string; name: string; username: string }>,
  posts: Map<string, { id: string; module: string; slug: string; authorId: string }>,
) {
  for (const [index, solution] of SOLUTIONS.entries()) {
    const post = posts.get(solution.slug);
    const author = people.get(solution.author);
    if (!post || !author) throw new Error(`Missing solved discussion data for ${solution.slug}`);
    const comment = await ensureComment(post.id, author, solution.text, dateDaysAgo(1, index + 1));
    await prisma.post.update({
      where: { id: post.id },
      data: { solved: true, acceptedCommentId: comment.id },
    });
  }

  for (const [index, discussion] of DISCUSSIONS.entries()) {
    const post = posts.get(discussion.slug);
    const author = people.get(discussion.author);
    if (!post || !author) throw new Error(`Missing discussion data for ${discussion.slug}`);
    await ensureComment(post.id, author, discussion.text, dateDaysAgo(0, index + 2));
  }
}

async function ensureLikes(
  people: Map<string, { id: string; name: string; username: string }>,
  posts: Map<string, { id: string; module: string; slug: string; authorId: string }>,
) {
  const users = [...people.values()];
  for (const post of posts.values()) {
    let offset = users.findIndex((user) => user.id === post.authorId);
    if (offset < 0) offset = 0;
    const likers = Array.from({ length: Math.min(3, users.length - 1) }, (_, index) =>
      users[(offset + index + 1) % users.length],
    );
    for (const liker of likers) {
      const fingerprint = `content-seed:${liker.username}`;
      const existing = await prisma.like.findUnique({
        where: { fingerprint_module_slug: { fingerprint, module: post.module, slug: post.slug } },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.like.create({
        data: {
          fingerprint,
          userId: liker.id,
          module: post.module,
          slug: post.slug,
          postId: post.id,
        },
      });
      await prisma.post.update({ where: { id: post.id }, data: { likes: { increment: 1 } } });
    }
  }
}

async function main() {
  const people = await ensurePeople();
  const posts = await ensurePosts(people);
  await ensureConversation(people, posts);
  await ensureLikes(people, posts);

  const byModule = ARTICLES.reduce<Record<string, number>>((result, article) => {
    result[article.module] = (result[article.module] || 0) + 1;
    return result;
  }, {});
  console.log(`✓ Homepage content is present in the database: ${JSON.stringify(byModule)}`);
  console.log(`✓ ${PEOPLE.length} community identities, ${SOLUTIONS.length + DISCUSSIONS.length} approved comments, and likes were checked idempotently.`);
}

main()
  .catch((error) => {
    console.error("Failed to populate homepage content:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
