import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Boxes,
  Check,
  CircleDot,
  Cloud,
  Command,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import styles from "./LinearInspiredPreview.module.css";

const workflowRows = [
  { code: "TBX-284", title: "طراحی جریان محتوای هفته", status: "در حال انجام", tone: "violet" },
  { code: "TBX-279", title: "بازبینی معماری شبکه", status: "بازبینی", tone: "blue" },
  { code: "TBX-271", title: "انتشار گزارش ذخیره‌سازی", status: "انجام شد", tone: "green" },
  { code: "TBX-263", title: "هماهنگی موجودی فروشگاه", status: "برنامه‌ریزی", tone: "amber" },
];

const capabilityCards = [
  {
    icon: Layers3,
    title: "نمای یکپارچه",
    text: "موضوعات، محتوا و فعالیت‌های مهم را در یک فضای آرام و منظم ببینید.",
    visual: "layers",
  },
  {
    icon: Gauge,
    title: "ریتم سریع",
    text: "از تصمیم تا اجرا، مراحل کوتاه‌تر و بازخوردها شفاف‌تر باقی می‌مانند.",
    visual: "pulse",
  },
  {
    icon: GitBranch,
    title: "جریان قابل پیگیری",
    text: "هر تغییر یک مسیر روشن دارد؛ بدون گم شدن میان صفحه‌ها و ابزارها.",
    visual: "branch",
  },
  {
    icon: Command,
    title: "کنترل از هرجا",
    text: "دسترسی سریع به بخش‌ها و عملیات پرتکرار با یک تجربه متمرکز.",
    visual: "command",
  },
] as const;

const signalBars = [38, 52, 44, 68, 57, 76, 62, 88, 70, 92, 78, 96];

function ProductWindow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.window} ${compact ? styles.windowCompact : ""}`}>
      <div className={styles.windowTop}>
        <div className={styles.trafficLights} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.windowSearch}>
          <Search size={13} />
          <span>جستجو در فضای کاری</span>
          <kbd>⌘ K</kbd>
        </div>
        <div className={styles.windowAvatar}>T</div>
      </div>

      <div className={styles.windowBody}>
        <aside className={styles.demoRail} aria-label="ناوبری نمایشی">
          <div className={styles.demoBrand}>
            <span className={styles.demoBrandMark}><Sparkles size={14} /></span>
            <span>TechFlow</span>
          </div>
          <nav>
            <span className={styles.demoNavActive}><Activity size={14} /> نمای امروز</span>
            <span><CircleDot size={14} /> موضوعات</span>
            <span><Boxes size={14} /> پروژه‌ها</span>
            <span><Database size={14} /> منابع</span>
          </nav>
          <div className={styles.demoRailLabel}>فضاهای فعال</div>
          <div className={styles.demoProject}><i className={styles.dotViolet} /> تحریریه</div>
          <div className={styles.demoProject}><i className={styles.dotBlue} /> زیرساخت</div>
          <div className={styles.demoProject}><i className={styles.dotGreen} /> فروشگاه</div>
        </aside>

        <div className={styles.demoMain}>
          <div className={styles.demoMainHeader}>
            <div>
              <span className={styles.demoKicker}>چرخه جاری</span>
              <h3>حرکت این هفته</h3>
            </div>
            <button type="button" aria-label="افزودن آیتم نمایشی">+ آیتم جدید</button>
          </div>

          <div className={styles.demoMetrics}>
            <div><strong>۲۴</strong><span>موضوع فعال</span></div>
            <div><strong>۸</strong><span>در حال بازبینی</span></div>
            <div><strong>۷۶٪</strong><span>پیشرفت چرخه</span></div>
          </div>

          <div className={styles.issueList}>
            <div className={styles.issueListHeader}>
              <span>عنوان</span><span>وضعیت</span>
            </div>
            {workflowRows.map((row) => (
              <div className={styles.issueRow} key={row.code}>
                <span className={styles.issueTitle}>
                  <i data-tone={row.tone}><Check size={10} /></i>
                  <small>{row.code}</small>
                  <b>{row.title}</b>
                </span>
                <span className={styles.issueStatus} data-tone={row.tone}>{row.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className={styles.scanLine} aria-hidden="true" />
    </div>
  );
}

function ClientStrip() {
  const items = [
    { icon: Network, label: "NETWORK" },
    { icon: Cloud, label: "CLOUD" },
    { icon: Database, label: "STORAGE" },
    { icon: ShieldCheck, label: "SECURITY" },
    { icon: Zap, label: "SYSTEMS" },
  ];

  return (
    <section className={styles.clientStrip} aria-label="حوزه‌های نمونه">
      <p>یک فضای متمرکز برای تیم‌های فنی و محتوایی</p>
      <div>
        {items.map(({ icon: Icon, label }) => (
          <span key={label}><Icon size={18} /> {label}</span>
        ))}
      </div>
    </section>
  );
}

function AmbientOrbit() {
  return (
    <div className={styles.orbit} aria-hidden="true">
      <div className={styles.orbitStars}>
        {Array.from({ length: 32 }).map((_, index) => (
          <i
            key={index}
            style={{
              left: `${(index * 37) % 97}%`,
              top: `${(index * 53) % 89}%`,
              animationDelay: `${(index % 8) * -0.45}s`,
              opacity: 0.25 + (index % 5) * 0.12,
            }}
          />
        ))}
      </div>
      <span className={styles.orbitLineOne} />
      <span className={styles.orbitLineTwo} />
    </div>
  );
}

function CardVisual({ type }: { type: (typeof capabilityCards)[number]["visual"] }) {
  if (type === "layers") {
    return (
      <div className={styles.layerVisual} aria-hidden="true">
        <span><i /> لایه برنامه‌ریزی</span>
        <span><i /> لایه اجرا</span>
        <span><i /> لایه گزارش</span>
      </div>
    );
  }

  if (type === "pulse") {
    return (
      <div className={styles.pulseVisual} aria-hidden="true">
        <div className={styles.pulseBars}>
          {signalBars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
        </div>
        <span><Activity size={14} /> سیگنال زنده</span>
      </div>
    );
  }

  if (type === "branch") {
    return (
      <div className={styles.branchVisual} aria-hidden="true">
        <span className={styles.branchRoot}><i /> ایده</span>
        <span className={styles.branchLine} />
        <span className={styles.branchNodeOne}><i /> طراحی</span>
        <span className={styles.branchNodeTwo}><i /> انتشار</span>
      </div>
    );
  }

  return (
    <div className={styles.commandVisual} aria-hidden="true">
      <span><Search size={14} /> جستجوی فرمان یا صفحه <kbd>⌘ K</kbd></span>
      <small><Command size={13} /> ایجاد موضوع جدید</small>
      <small><ArrowLeft size={13} /> رفتن به گزارش‌ها</small>
    </div>
  );
}

function CommandCenter() {
  return (
    <div className={styles.commandCenter}>
      <div className={styles.commandBackdrop} aria-hidden="true">
        <span>TBX-281</span><span>TBX-282</span><span>TBX-283</span>
      </div>
      <div className={styles.commandPalette}>
        <div className={styles.commandInput}><Search size={17} /><span>یک فرمان وارد کنید...</span><kbd>ESC</kbd></div>
        <div className={styles.commandGroupLabel}>پیشنهادهای سریع</div>
        <button type="button"><Sparkles size={16} /><span>ساخت یک فضای کاری تازه</span><kbd>↵</kbd></button>
        <button type="button"><CircleDot size={16} /><span>ثبت موضوع و تعیین مسئول</span><kbd>N</kbd></button>
        <button type="button"><Activity size={16} /><span>مشاهده وضعیت چرخه</span><kbd>G</kbd></button>
      </div>
    </div>
  );
}

function RoadmapVisual() {
  const quarters = ["اکنون", "بعدی", "آینده"];
  return (
    <div className={styles.roadmapVisual}>
      <div className={styles.roadmapTop}>
        <span><GitBranch size={15} /> مسیر محصول</span>
        <div>{quarters.map((quarter) => <small key={quarter}>{quarter}</small>)}</div>
      </div>
      <div className={styles.roadmapGrid}>
        <div className={styles.roadmapLabels}><span>پلتفرم</span><span>محتوا</span><span>فروشگاه</span></div>
        <div className={styles.roadmapTracks}>
          <i className={styles.trackOne}>هسته تجربه</i>
          <i className={styles.trackTwo}>انتشار هوشمند</i>
          <i className={styles.trackThree}>خرید یکپارچه</i>
        </div>
      </div>
    </div>
  );
}

export default function LinearInspiredPreview() {
  return (
    <div className={styles.page} dir="rtl">
      <section className={styles.hero} aria-labelledby="preview-home-title">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.eyebrow}><span /> تجربه آینده، در یک فضای آرام</div>
          <h1 id="preview-home-title">جایی برای تبدیل<br /><em>فکر به حرکت</em></h1>
          <p className={styles.heroLead}>
            یک پیش‌نمایش بصری برای خانه جدید تکباکس؛ سریع، متمرکز و ساخته‌شده برای جریان‌های پیچیده فناوری.
          </p>
          <div className={styles.heroActions}>
            <Link href="/blog" className={styles.primaryAction}>شروع کاوش <ArrowLeft size={16} /></Link>
            <Link href="/tools" className={styles.secondaryAction}><Sparkles size={15} /> مشاهده امکانات</Link>
          </div>
          <div className={styles.previewStage}>
            <ProductWindow />
          </div>
        </div>
      </section>

      <div className={styles.container}><ClientStrip /></div>
      <AmbientOrbit />

      <section className={`${styles.featureSection} ${styles.violetSection}`} aria-labelledby="focus-title">
        <div className={styles.sectionGlow} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span><CircleDot size={14} /> تمرکز بدون حواس‌پرتی</span>
            <h2 id="focus-title">پیچیدگی را پنهان کنید.<br /><em>کار مهم را جلو ببرید.</em></h2>
            <p>اطلاعات زیاد است؛ تجربه نباید شلوغ باشد. همه‌چیز با سلسله‌مراتب روشن و حرکت نرم کنار هم قرار می‌گیرد.</p>
          </div>
          <div className={styles.focusWindow}><ProductWindow compact /></div>
        </div>
      </section>

      <section className={styles.cardsSection} aria-labelledby="capabilities-title">
        <div className={styles.container}>
          <div className={styles.sectionIntroSmall}>
            <span><Layers3 size={14} /> یک سیستم، چند جریان</span>
            <h2 id="capabilities-title">طراحی‌شده برای سرعت،<br />بدون از دست دادن جزئیات.</h2>
          </div>
          <div className={styles.cardGrid}>
            {capabilityCards.map(({ icon: Icon, title, text, visual }) => (
              <article className={styles.capabilityCard} key={title}>
                <div className={styles.cardCopy}>
                  <span className={styles.cardIcon}><Icon size={18} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <CardVisual type={visual} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.featureSection} ${styles.blueSection}`} aria-labelledby="momentum-title">
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span><Command size={14} /> حرکت با یک فرمان</span>
            <h2 id="momentum-title">از ایده تا نتیجه،<br /><em>بدون توقف میان ابزارها.</em></h2>
            <p>فرمان‌ها، جستجو و عملیات پرتکرار در یک مرکز سریع جمع می‌شوند تا تمرکز روی تصمیم بعدی بماند.</p>
          </div>
          <CommandCenter />
          <div className={styles.featureFacts}>
            <div><Zap size={18} /><strong>پاسخ سریع</strong><span>دسترسی به کارهای پرتکرار در چند لحظه</span></div>
            <div><ShieldCheck size={18} /><strong>مرزهای روشن</strong><span>ساختار منظم برای تجربه‌ای قابل اعتماد</span></div>
            <div><Activity size={18} /><strong>بازخورد زنده</strong><span>دیدن حرکت سیستم بدون شلوغی اضافه</span></div>
          </div>
        </div>
      </section>

      <section className={styles.roadmapSection} aria-labelledby="direction-title">
        <div className={styles.container}>
          <div className={styles.splitIntro}>
            <div>
              <span><GitBranch size={14} /> مسیر روشن</span>
              <h2 id="direction-title">جهت را مشخص کنید.<br />تیم را هم‌مسیر نگه دارید.</h2>
            </div>
            <p>هدف‌های امروز، برنامه‌های بعدی و تصویر آینده در یک نمای منسجم قرار می‌گیرند.</p>
          </div>
          <RoadmapVisual />
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="preview-cta-title">
        <div className={styles.finalGlow} aria-hidden="true" />
        <div className={styles.container}>
          <span className={styles.finalMark}><Sparkles size={24} /></span>
          <h2 id="preview-cta-title">این فقط نقطه شروع است.</h2>
          <p>در مرحله بعد، هر بخش این پیش‌نمایش را با محتوای واقعی و ماژول‌های تکباکس جایگزین می‌کنیم.</p>
          <div className={styles.heroActions}>
            <Link href="/forum" className={styles.primaryAction}>ورود به انجمن <ArrowLeft size={16} /></Link>
            <Link href="/shop" className={styles.secondaryAction}>مشاهده فروشگاه</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
