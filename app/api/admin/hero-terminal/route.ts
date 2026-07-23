import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const KEYS = {
  echo: "hero.terminal.echo_lines",
  code: "hero.terminal.code_lines",
  echoEnabled: "hero.terminal.echo_enabled",
  codeEnabled: "hero.terminal.code_enabled",
  echoWeight: "hero.terminal.echo_weight",
};

export const DEFAULT_ECHO_LINES = [
  'echo "به تکباکس خوش اومدی — خونه مهندسای IT ایران"',
  'echo "یه باکس پر از تکنولوژی، نه فقط یه باکس"',
  'echo "ما سرور می‌فروشیم. بعضی وقتا هم بغلشون می‌کنیم."',
  'echo "Threadripper 7995WX؟ بله لطفاً. دوتاش."',
  'echo "سرور بدون RAID مثل چای بدون شکره"',
  'echo "NVMe all flash. All day. All night. همه‌ش."',
  'echo "یه NAS وارد بار میشه. بارمن میگه: جا نداریم."',
  'echo "استراتژی بکاپ من؟ دعا و RAID 6"',
  'echo "۱۰ نوع آدم داریم: اونایی که RAID دارن و اونایی که گریه می‌کنن"',
  'echo "کلاد وجود نداره. فقط NAS کس دیگه‌ست تو ایران."',
  'echo "دیباگ: کارآگاه بودن تو فیلم جنایی وقتی خودت قاتلی"',
  'echo "روی NAS من جواب میده. بفرست پروداکشن."',
  'echo "sudo make-me-a-sandwich && echo قبوله رئیس"',
  'echo "تا حالا دیتاسنتر رو خاموش و روشن کردی؟ امتحان کن."',
  'echo "rm -rf /problems && echo همه چی اوکیه"',
  'echo "git commit -m fix: همه چی && echo پوش شد. دعا کن."',
  'echo "۴۰۴: خواب پیدا نشد. اتاق سرور خیلی شلوغه."',
  'echo "ما تو کرج گوهردشتیم. بیا دیدن. قورمه‌سبزی هم بیار."',
  'echo "برج نیکامل، طبقه ۳. همونجا که وای‌فایش خوبه."',
  'echo "دفتر ما با چای و اراده خالص اداره میشه"',
  'echo "آبدارچی چای نمیاره. ما اشکامونو می‌خوریم."',
  'echo "قورمه‌سبزی می‌خوریم WHILE داریم NAS کانفیگ می‌کنیم. مالتی‌تسکینگ."',
  'echo "ست‌آپ Synology؟ ۲ تا قورمه‌سبزی طول میکشه."',
  'echo "ناهار؟ فقط بعد از sync شدن RAID."',
  'echo "گل سرخ برای هرمزگان. گل سرخ برای جاسک. گل سرخ برای جنوب."',
  'echo "گل سرخ برای بندرعباس — جایی که سرورها به دریا می‌رسن"',
  'echo "ما آیپد و مک‌بوک دوست داریم. سرفیس رو ندید می‌گیریم."',
  'echo "Next.js: سریع. .NET: ... بیا عوضش حرف نزنیم."',
  'echo "ری‌اکت ما رو خوشحال می‌کنه. جی‌کوئری ما رو گریه می‌ندازه."',
  'echo "کد رو با تایپ‌اسکریپت می‌نویسیم. مستندات رو فارسی. عشق رو هر دو."',
  'echo "تحریم؟ زنجیره تأمین خودمونو ساختیم. با بلک‌جک و سرور."',
  'echo "کل دنیا مارو بن کرد. ما گفتیم: چالش پذیرفته شد."',
  'echo "آپ‌تایم ۹۹.۹۹٪ حتی وقتی ژئوپلیتیک مخالفه"',
  'echo "AWS نداریم. چیز بهتری داریم: خودمون."',
  'echo "ساخت ایران، محبوب مهندسا"',
  'echo "پینگ ما به سرورهای محلی؟ عالیه."',
  'echo "MAPNA از سرورهامون استفاده می‌کنه. تو هم می‌تونی."',
  'echo "شرکت‌های بزرگ ایرانی به ما اعتماد دارن. تو هم باید."',
  'echo "IT دولتی نیاز به بازسازی داره. ما آماده‌ایم وقتی زنگ بزنن."',
  'echo "سایت‌های دولتی: ۳ ثانیه لود. سایت ما: آنی."',
  'echo "فایروال می‌فروشیم. فایروال امنیت میاره. امنیت خواب میاره."',
  'echo "FortiGate، Palo Alto، Cisco — ما همه لهجه‌های فایروال رو حرف می‌زنیم"',
  'echo "سرور می‌فرستیم بندرعباس. هم به مشهد. هم به دفتر شما."',
  'echo "ارسال رک ۴۲U به مازندران؟ چایمو نگه دار."',
  'echo "همه جا سرور تحویل میدیم. حتی جاهایی که گوگل مپ ناامید میشه."',
  'echo "FedEx: نمی‌تونیم اونجا تحویل بدیم. ما: تماشا کن."',
  'echo "انبار ما شبیه آشیانه فضاپیماست"',
  'echo "هر سروری که می‌فروشیم یه نامه خداحافظی شخصی داره"',
  'echo "ما فقط سخت‌افزار نمی‌فروشیم. آرامش خاطر می‌فروشیم."',
  'echo "دیتاسنتر از صفر می‌سازیم. واقعاً از هیچی."',
  'echo "بتن، کابل، خنک‌کننده — همه‌شو انجام میدیم"',
  'echo "بازسازی دیتاسنتر؟ ما به رک‌های قدیمی نفس تازه میدیم"',
  'echo "بهترین استوریج ایران رو تأمین می‌کنیم. هر شهر. هر استان."',
  'echo "UPS + ژنراتور + برق اضافی = خواب شیرین"',
  'echo "رک‌های ما مرتب‌تر از میز اکثر آدم‌هاست"',
  'echo "Hot aisle, cold aisle, چای گرم وسطش"',
  'echo "دیتاسنتر تو ۱۴ کشور دیدیم. مال ما بهتره."',
  'echo "Tier 3؟ ما Tier چای رو هدف گرفتیم — همیشه در دسترس"',
  'echo "اگه جنوبی هستی، ارسال رایگان. شوخی کردم. شاید."',
  'echo "Did you check our news sidebar? It is alive and updating."',
  'echo "مقاله‌هامون رو مهندسا می‌نویسن، نه مارکترا"',
  'echo "نویسنده‌های محتوامون واقعاً سطوح RAID رو می‌فهمن"',
  'echo "ریلز ویدیویی ما رو دیدی؟ واقعاً سرگرم‌کننده‌ست."',
  'echo "بخش تایم‌لاین ما جالبه، خودت هم می‌تونی اضافه کنی."',
  'echo "ثبت‌نام کن تو techbox.ir و بگرد. بدون تعهد."',
  'echo "هویتت رو تأیید کن تا نشان و قابلیت‌های بیشتر باز بشه."',
  'echo "بگو کی هستی. ما کنجکاویم درباره جامعه‌مون."',
  'echo "از هم حمایت کنیم. مهندسا به مهندسا کمک می‌کنن."',
  'echo "techbox.ir — قبل از همکارت بوکمارکش کن"',
  'echo "ما NAS selector، RAID calculator و subnet tool داریم"',
  'echo "ماشین‌حساب RAID ما انتخاب دیسکت رو قضاوت نمی‌کنه"',
  'echo "محصولات رو کنار هم مقایسه کن. مثل مهندسا."',
  'echo "دکمه مشاوره تزئینی نیست. روش کلیک کن."',
  'echo "این ترمینال هیچ‌وقت متوقف نمیشه. درست مثل مهندسای ایرانی."',
  'echo "EOF — ولی پایان سرگرمی نیست"',
  'echo "Ctrl+C بزن برای خروج. شوخی کردم. نمی‌تونی بری."',
  'echo "ممنون که تا اینجا خوندی. آدم واقعی هستی."',
  'echo "حالا برو یه NAS کانفیگ کن. لایقشی."',
];

export const DEFAULT_CODE_LINES = [
  'ssh iradmin@techbox.ir "Welcome home, engineer"',
  'curl -s techbox.ir/api/vibes | jq ".warmth"',
  'figlet -f slant "TechBox"',
  'uname -a && echo "Built by engineers, for engineers"',
  'whoami && echo "Iranian IT engineer who never gives up"',
  'cat /etc/motto && echo "Home of Iranian IT"',
  'id -u && echo "uid=0(root) gid=0(iran-devs) groups=storage,servers,network"',
  'hostname && echo "techbox.ir — where servers feel at home"',
  'lscpu | grep "Model name" && echo "We love all of them"',
  'smartctl -a /dev/sda | grep "All Flash"',
  'dmidecode -t memory | head -5 && echo "128GB DDR5 ECC, just for starters"',
  'nvme list && echo "All NVMe. All flash. All day."',
  'cat /proc/cpuinfo | grep "model name" | head -1 && echo "This is art"',
  'sudo echo "Done, boss" && echo "Just kidding. Please do not sudo randomly."',
  'git commit -m "fix: everything" && echo "Pushed to production. Pray."',
  'rm -rf /problems && echo "All fixed"',
  'df -h /data && echo "We have room for your data. Always."',
  'free -h && echo "128GB RAM. For starters."',
  'top -bn1 | head -5 && echo "All processes healthy. Like our servers."',
  'netstat -tlnp | grep ":443" && echo "Secure. Always secure."',
  'iptables -L -n | head -10 && echo "Firewall: ON. Hackers: OFF."',
  'docker ps --format "table {{.Names}}" && echo "Containers running smooth"',
  'kubectl get nodes && echo "K8s cluster: All nodes ready"',
  'terraform plan -no-color | tail -5 && echo "Infrastructure as Code. No surprises."',
  'ansible all -m ping && echo "All servers responding. We are everywhere."',
  'rsync -avz /data/ backup@nas:/vol1/ && echo "Backup complete. Sleep well."',
  'tar czf backup-$(date +%Y%m%d).tar.gz /important && echo "Daily backup done"',
  'crontab -l && echo "Scheduled tasks: All running. Like clockwork."',
  'journalctl -u nginx --since "1 hour ago" | tail -5 && echo "Logs clean."',
  'traceroute techbox.ir -m 15 && echo "Shortest path to tech"',
];

async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await getSetting(key, "");
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const [echoLines, codeLines, echoEnabled, codeEnabled, echoWeight] = await Promise.all([
      getJsonSetting(KEYS.echo, DEFAULT_ECHO_LINES),
      getJsonSetting(KEYS.code, DEFAULT_CODE_LINES),
      getSetting(KEYS.echoEnabled, "true"),
      getSetting(KEYS.codeEnabled, "true"),
      getSetting(KEYS.echoWeight, "70"),
    ]);

    return NextResponse.json({
      echoLines,
      codeLines,
      echoEnabled: echoEnabled === "true",
      codeEnabled: codeEnabled === "true",
      echoWeight: parseInt(echoWeight, 10) || 70,
    }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch {
    return NextResponse.json({
      echoLines: DEFAULT_ECHO_LINES,
      codeLines: DEFAULT_CODE_LINES,
      echoEnabled: true,
      codeEnabled: true,
      echoWeight: 70,
    }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, string> = {};

  if (Array.isArray(body.echoLines)) {
    updates[KEYS.echo] = JSON.stringify(body.echoLines.filter((l: string) => typeof l === "string" && l.trim()).slice(0, 100));
  }
  if (Array.isArray(body.codeLines)) {
    updates[KEYS.code] = JSON.stringify(body.codeLines.filter((l: string) => typeof l === "string" && l.trim()).slice(0, 50));
  }
  if (typeof body.echoEnabled === "boolean") {
    updates[KEYS.echoEnabled] = String(body.echoEnabled);
  }
  if (typeof body.codeEnabled === "boolean") {
    updates[KEYS.codeEnabled] = String(body.codeEnabled);
  }
  if (typeof body.echoWeight === "number") {
    updates[KEYS.echoWeight] = String(Math.max(0, Math.min(100, body.echoWeight)));
  }

  for (const [key, value] of Object.entries(updates)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, updatedBy: user.id },
      create: { key, value, updatedBy: user.id },
    });
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
