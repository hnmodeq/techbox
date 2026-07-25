import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Calculator,
  Check,
  CircleDot,
  Clock3,
  Command,
  Film,
  Headphones,
  History,
  LifeBuoy,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Search,
  ShoppingBag,
  Sparkles,
  TicketCheck,
  Wrench,
  Zap,
} from "lucide-react";
import styles from "./LinearInspiredPreview.module.css";

const modules = [
  { label: "مجله", english: "Magazine", href: "/blog", icon: BookOpen, tone: "violet" },
  { label: "اخبار", english: "News", href: "/news", icon: Newspaper, tone: "blue" },
  { label: "ریل‌ها", english: "Reels", href: "/media", icon: Film, tone: "pink" },
  { label: "فروشگاه", english: "Shop", href: "/shop", icon: ShoppingBag, tone: "green" },
  { label: "ابزارها", english: "Tools", href: "/tools", icon: Calculator, tone: "amber" },
  { label: "انجمن", english: "Forum", href: "/forum", icon: MessagesSquare, tone: "cyan" },
  { label: "تایم‌لاین", english: "Timeline", href: "/timeline", icon: History, tone: "violet" },
  { label: "مشاوره", english: "Consultation", href: "/consultation", icon: Headphones, tone: "blue" },
  { label: "پشتیبانی", english: "Support", href: "/support", icon: LifeBuoy, tone: "green" },
] as const;

const workflowRows = [
  { code: "MAG-284", title: "راهنمای طراحی شبکه پایدار", status: "مجله", tone: "violet" },
  { code: "NWS-279", title: "خبرهای امروز زیرساخت و کلاد", status: "اخبار", tone: "blue" },
  { code: "RLS-271", title: "ویدیوی کوتاه انتخاب NAS", status: "ریل", tone: "pink" },
  { code: "FRM-263", title: "بحث کاربران درباره RAID 6", status: "انجمن", tone: "cyan" },
];

const capabilityCards = [
  {
    icon: ShoppingBag,
    title: "فروشگاه تخصصی",
    english: "SHOP",
    href: "/shop",
    text: "محصولات زیرساختی را با مشخصات فنی، وضعیت موجودی و مسیر خرید روشن مقایسه کنید.",
    visual: "shop",
  },
  {
    icon: Calculator,
    title: "ابزارهای مهندسی",
    english: "TOOLS",
    href: "/tools",
    text: "RAID، Subnet، NAS و NVR را در یک مجموعه ابزار سریع و کاربردی محاسبه کنید.",
    visual: "tools",
  },
  {
    icon: MessagesSquare,
    title: "انجمن تکباکس",
    english: "FORUM",
    href: "/forum",
    text: "سؤال‌های واقعی، پاسخ‌های متخصصان و تجربه‌های اجرایی جامعه فناوری را دنبال کنید.",
    visual: "forum",
  },
  {
    icon: History,
    title: "تایم‌لاین فناوری",
    english: "TIMELINE",
    href: "/timeline",
    text: "رویدادها و نقاط عطف فناوری را در یک مسیر زمانی زنده و قابل کاوش ببینید.",
    visual: "timeline",
  },
] as const;

function ProductWindow() {
  return (
    <div className={styles.window}>
      <div className={styles.windowTop}>
        <div className={styles.trafficLights} aria-hidden="true"><span /><span /><span /></div>
        <div className={styles.windowSearch}>
          <Search size={13} /><span>جستجو در تمام تکباکس</span><kbd>⌘ K</kbd>
        </div>
        <div className={styles.windowAvatar}>TB</div>
      </div>

      <div className={styles.windowBody}>
        <aside className={styles.demoRail} aria-label="ماژول‌های نمایشی تکباکس">
          <div className={styles.demoBrand}>
            <span className={styles.demoBrandMark}><Sparkles size={14} /></span>
            <span>TechBox</span>
          </div>
          <nav>
            {modules.slice(0, 6).map(({ label, icon: Icon }, index) => (
              <span className={index === 0 ? styles.demoNavActive : undefined} key={label}>
                <Icon size={14} /> {label}
              </span>
            ))}
          </nav>
          <div className={styles.demoRailLabel}>دسترسی مستقیم</div>
          <div className={styles.demoProject}><i className={styles.dotViolet} /> تایم‌لاین</div>
          <div className={styles.demoProject}><i className={styles.dotBlue} /> مشاوره</div>
          <div className={styles.demoProject}><i className={styles.dotGreen} /> پشتیبانی</div>
        </aside>

        <div className={styles.demoMain}>
          <div className={styles.demoMainHeader}>
            <div><span className={styles.demoKicker}>خانه ماژولار</span><h3>مرکز فرمان تکباکس</h3></div>
            <button type="button" aria-label="باز کردن جستجوی نمایشی">جستجوی سریع</button>
          </div>
          <div className={styles.demoMetrics}>
            <div><strong>۹</strong><span>ماژول متصل</span></div>
            <div><strong>۲۴</strong><span>تازه‌های امروز</span></div>
            <div><strong>زنده</strong><span>وضعیت پلتفرم</span></div>
          </div>
          <div className={styles.issueList}>
            <div className={styles.issueListHeader}><span>تازه‌های اکوسیستم</span><span>ماژول</span></div>
            {workflowRows.map((row) => (
              <div className={styles.issueRow} key={row.code}>
                <span className={styles.issueTitle}>
                  <i data-tone={row.tone}><Check size={10} /></i><small>{row.code}</small><b>{row.title}</b>
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

function ModuleStrip() {
  return (
    <section className={styles.clientStrip} aria-label="ماژول‌های تکباکس">
      <p>تمام مسیرهای تکباکس، در یک خانه واحد</p>
      <div className={styles.moduleStripGrid}>
        {modules.map(({ icon: Icon, label, english, href, tone }) => (
          <Link href={href} key={english} data-tone={tone}>
            <Icon size={17} /><span>{label}<small>{english}</small></span>
          </Link>
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
          <i key={index} style={{ left: `${(index * 37) % 97}%`, top: `${(index * 53) % 89}%`, animationDelay: `${(index % 8) * -0.45}s`, opacity: 0.25 + (index % 5) * 0.12 }} />
        ))}
      </div>
      <span className={styles.orbitLineOne} /><span className={styles.orbitLineTwo} />
    </div>
  );
}

function EditorialPreview() {
  return (
    <div className={styles.editorialPreview}>
      <div className={styles.editorialTopbar}>
        <span><Sparkles size={14} /> جریان تحریریه</span>
        <div><small>Magazine</small><small>News</small><small>Reels</small></div>
      </div>
      <div className={styles.editorialGrid}>
        <article className={styles.magazinePreview}>
          <div className={styles.previewImage}><BookOpen size={30} /><span>FEATURE STORY</span></div>
          <div><small>مجله تکباکس</small><h3>روایت عمیق فناوری، فراتر از تیترها</h3><p>مقاله‌های تخصصی، راهنماهای عملی و تحلیل‌هایی که برای تصمیم بهتر ساخته شده‌اند.</p></div>
        </article>
        <div className={styles.editorialSide}>
          <article className={styles.newsPreview}>
            <span><Newspaper size={17} /> اخبار زنده</span>
            <ul><li><i /> تحول تازه در زیرساخت ابری</li><li><i /> نسل جدید تجهیزات ذخیره‌سازی</li><li><i /> به‌روزرسانی امنیت شبکه</li></ul>
          </article>
          <article className={styles.reelsPreview}>
            <div className={styles.reelFrame}><Film size={27} /><span>00:45</span></div>
            <div><small>REELS</small><strong>یک نکته فنی در کمتر از یک دقیقه</strong></div>
          </article>
        </div>
      </div>
    </div>
  );
}

function CardVisual({ type }: { type: (typeof capabilityCards)[number]["visual"] }) {
  if (type === "shop") {
    return (
      <div className={styles.shopVisual} aria-hidden="true">
        <div><span>NAS</span><strong>TS-464</strong><small>موجود</small></div>
        <div><span>Server</span><strong>R760</strong><small>استعلام</small></div>
        <div><span>Network</span><strong>CCR</strong><small>موجود</small></div>
      </div>
    );
  }
  if (type === "tools") {
    return (
      <div className={styles.toolsVisual} aria-hidden="true">
        <div><span>RAID 6</span><strong>۳۲ TB</strong></div>
        <div className={styles.toolBars}>{[72, 72, 72, 72, 34, 34].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
        <small><Wrench size={13} /> محاسبه ظرفیت قابل استفاده</small>
      </div>
    );
  }
  if (type === "forum") {
    return (
      <div className={styles.forumVisual} aria-hidden="true">
        <span><i>م</i><b>بهترین RAID برای آرشیو چیست؟</b><small>۱۲ پاسخ</small></span>
        <span><i>ه</i><b>پیشنهاد برای طراحی VLAN</b><small>۸ پاسخ</small></span>
        <span><i>ت</i><b>تجربه کار با NAS سازمانی</b><small>۲۱ پاسخ</small></span>
      </div>
    );
  }
  return (
    <div className={styles.timelineCardVisual} aria-hidden="true">
      <span><i /> ۱۹۶۹<small>تولد اینترنت</small></span>
      <span><i /> ۱۹۹۱<small>وب جهان‌گستر</small></span>
      <span><i /> امروز<small>عصر هوش مصنوعی</small></span>
    </div>
  );
}

function ServiceCenter() {
  return (
    <div className={styles.serviceCenter}>
      <div className={styles.serviceBackdrop} aria-hidden="true"><span>نیازسنجی</span><span>گفت‌وگو</span><span>راه‌حل</span></div>
      <div className={styles.servicePanel}>
        <div className={styles.servicePanelHead}><MessageCircle size={17} /><span>چطور می‌توانیم کمک کنیم؟</span><kbd>ESC</kbd></div>
        <div className={styles.serviceOptions}>
          <Link href="/consultation" className={styles.consultationOption}>
            <span className={styles.serviceIcon}><Headphones size={19} /></span>
            <div><small>CONSULTATION</small><strong>مشاوره تخصصی</strong><p>برای انتخاب معماری، محصول یا مسیر اجرا با ما صحبت کنید.</p></div>
            <ArrowLeft size={17} />
          </Link>
          <Link href="/support" className={styles.supportOption}>
            <span className={styles.serviceIcon}><LifeBuoy size={19} /></span>
            <div><small>SUPPORT</small><strong>پشتیبانی و پیگیری</strong><p>تیکت جدید بسازید و پاسخ تیم تکباکس را در یک مسیر امن دنبال کنید.</p></div>
            <ArrowLeft size={17} />
          </Link>
        </div>
        <div className={styles.serviceStatus}><TicketCheck size={15} /><span>پیگیری شفاف درخواست</span><i /><span>پاسخ کارشناسی</span><i /><span>تاریخچه امن</span></div>
      </div>
    </div>
  );
}

function TimelinePreview() {
  const periods = ["گذشته", "امروز", "آینده"];
  return (
    <div className={styles.roadmapVisual}>
      <div className={styles.roadmapTop}>
        <span><History size={15} /> تایم‌لاین فناوری</span>
        <div>{periods.map((period) => <small key={period}>{period}</small>)}</div>
      </div>
      <div className={styles.roadmapGrid}>
        <div className={styles.roadmapLabels}><span>زیرساخت</span><span>اینترنت</span><span>هوش مصنوعی</span></div>
        <div className={styles.roadmapTracks}>
          <i className={styles.trackOne}>۱۹۵۶ — نخستین هارددیسک</i>
          <i className={styles.trackTwo}>۱۹۹۱ — تولد وب</i>
          <i className={styles.trackThree}>امروز — مدل‌های هوشمند</i>
        </div>
      </div>
    </div>
  );
}

export default function LinearInspiredPreview() {
  return (
    <div className={styles.page} dir="rtl">
      <section className={styles.hero} aria-labelledby="preview-home-title">
        <div className={styles.heroGrid} aria-hidden="true" /><div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.eyebrow}><span /> ۹ ماژول، یک اکوسیستم فناوری</div>
          <h1 id="preview-home-title">همه دنیای فناوری،<br /><em>در یک تکباکس</em></h1>
          <p className={styles.heroLead}>مجله، اخبار، ویدیو، فروشگاه، ابزار، انجمن، تایم‌لاین، مشاوره و پشتیبانی؛ متصل و متمرکز در یک تجربه واحد.</p>
          <div className={styles.heroActions}>
            <Link href="/blog" className={styles.primaryAction}>ورود به مجله <ArrowLeft size={16} /></Link>
            <Link href="/tools" className={styles.secondaryAction}><Calculator size={15} /> ابزارهای مهندسی</Link>
          </div>
          <div className={styles.previewStage}><ProductWindow /></div>
        </div>
      </section>

      <div className={styles.container}><ModuleStrip /></div>
      <AmbientOrbit />

      <section className={`${styles.featureSection} ${styles.violetSection}`} aria-labelledby="editorial-title">
        <div className={styles.sectionGlow} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span><Newspaper size={14} /> Magazine · News · Reels</span>
            <h2 id="editorial-title">بخوانید. ببینید.<br /><em>در جریان بمانید.</em></h2>
            <p>سه قالب متفاوت برای یک هدف: فهم عمیق‌تر فناوری، از تحلیل بلند تا خبر فوری و ویدیوی کوتاه.</p>
          </div>
          <EditorialPreview />
        </div>
      </section>

      <section className={styles.cardsSection} aria-labelledby="modules-title">
        <div className={styles.container}>
          <div className={styles.sectionIntroSmall}>
            <span><Command size={14} /> Shop · Tools · Forum · Timeline</span>
            <h2 id="modules-title">از انتخاب و محاسبه،<br />تا گفت‌وگو و کشف تاریخ.</h2>
          </div>
          <div className={styles.cardGrid}>
            {capabilityCards.map(({ icon: Icon, title, english, href, text, visual }) => (
              <Link href={href} className={styles.capabilityCard} key={title}>
                <div className={styles.cardCopy}><span className={styles.cardIcon}><Icon size={18} /></span><small>{english}</small><h3>{title}</h3><p>{text}</p></div>
                <CardVisual type={visual} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.featureSection} ${styles.blueSection}`} aria-labelledby="service-title">
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <span><Headphones size={14} /> Consultation · Support</span>
            <h2 id="service-title">از سؤال تا راه‌حل،<br /><em>یک مسیر مستقیم.</em></h2>
            <p>برای تصمیم‌های فنی مشاوره بگیرید یا درخواست پشتیبانی را با دسترسی امن و تاریخچه شفاف پیگیری کنید.</p>
          </div>
          <ServiceCenter />
          <div className={styles.featureFacts}>
            <div><Headphones size={18} /><strong>مشاوره تخصصی</strong><span>انتخاب معماری و محصول متناسب با نیاز واقعی</span></div>
            <div><TicketCheck size={18} /><strong>تیکت امن</strong><span>گفت‌وگوی خصوصی با قابلیت پیگیری مرحله‌به‌مرحله</span></div>
            <div><Zap size={18} /><strong>دسترسی سریع</strong><span>ورود مستقیم از خانه تکباکس به مسیر درست</span></div>
          </div>
        </div>
      </section>

      <section className={styles.roadmapSection} aria-labelledby="timeline-title">
        <div className={styles.container}>
          <div className={styles.splitIntro}>
            <div><span><Clock3 size={14} /> Timeline</span><h2 id="timeline-title">گذشته را ببینید.<br />آینده را بهتر بفهمید.</h2></div>
            <p>رویدادهای اثرگذار فناوری، از زیرساخت و اینترنت تا هوش مصنوعی، در یک مسیر زمانی قابل کاوش.</p>
          </div>
          <TimelinePreview />
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="preview-cta-title">
        <div className={styles.finalGlow} aria-hidden="true" />
        <div className={styles.container}>
          <span className={styles.finalMark}><Sparkles size={24} /></span>
          <h2 id="preview-cta-title">خانه جدید تکباکس، ماژول به ماژول.</h2>
          <p>این شِمای بصری آماده است تا در گام‌های بعدی با داده‌ها، کارت‌ها و تعاملات واقعی هر ماژول تکمیل شود.</p>
          <div className={styles.heroActions}>
            <Link href="/consultation" className={styles.primaryAction}>درخواست مشاوره <ArrowLeft size={16} /></Link>
            <Link href="/support" className={styles.secondaryAction}>پشتیبانی تکباکس</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
