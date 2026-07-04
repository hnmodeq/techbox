'use client';

import React, { useState } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { Heart, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';

interface TimelineCardProps {
  event: TimelineEvent;
  style?: React.CSSProperties;
  importance: number;
}

const fallbackImages = [
  '/assets/blog-1.jpg',
  '/assets/blog-2.jpg',
  '/assets/blog-4.jpg',
  '/assets/blog-5.jpg',
  '/assets/blog-6.png',
];

// Rich, authentic topic-specific Data Center comments for each milestone ID
const milestoneCommentsMap: Record<string, string[]> = {
  'tl-dc-1': [
    'معماری ۳۶۰ واقعاً تعریف استاندارد سرورها رو برای همیشه عوض کرد.',
    'هنوز هم اصول I/O Channel و جداسازی سخت‌افزار از نرم‌افزار که اون زمان طراحی شد در مین‌فریم‌ها کاربرد داره.',
    'پدربزرگ دیتاسنترهای مدرن امروزی! وزن و ابعاد اون تجهیزات در اتاق سرورهای دهه ۶۰ میلادی باورکردنی نبود.',
    'اولین باری که مفهوم آپگرید سخت‌افزار بدون تغییر کد برنامه مطرح شد و سرمایه‌گذاری نرم‌افزاری سازمان‌ها حفظ شد.',
    'سرمایه‌گذاری ۵ میلیارد دلاری IBM روی این پروژه در زمان خودش بزرگ‌ترین ریسک تاریخ فناوری اطلاعات بود.',
    'کاش یک مقاله تفصیلی در مجله تکباکس درباره سیر تکامل سیستم‌عامل OS/360 بنویسید.',
  ],
  'tl-dc-2': [
    'باب متکالف وقتی اترنت رو طراحی کرد شاید تصور نمی‌کرد سرعتش از ۳ مگابیت به ۸۰۰ گیگابیت برسه!',
    'پروتکل CSMA/CD اترنت یکی از شاهکارهای بی‌بدیل تاریخ مهندسی شبکه است.',
    'هنوز بعد از نیم قرن، فریم‌های اترنت ساختار اصلی ارتباط سوئیچ‌های دیتاسنتری رو تشکیل می‌دن.',
    'رقابت اترنت با Token Ring و پیروزی قاطعش به خاطر سادگی و هزینه کمتر واقعاً دیدنی بود.',
    'بدون کابل‌های اترنت و کواکسیال اولیه، مفهوم شبکه محلی (LAN) در سازمان‌ها شکل نمی‌گرفت.',
    'قانون متکالف (ارزش شبکه متناسب با مجذور کاربران است) دقیقاً از همین نقطه متولد شد.',
  ],
  'tl-dc-3': [
    'مقاله پترسون و همکارانش در دانشگاه برکلی اساس تمام استوریج‌های سازمانی امروزی شد.',
    'ایده استفاده از هارد دیسک‌های ارزان‌قیمت PC به جای دیسک‌های گران‌قیمت مین‌فریم نبوغ‌آمیز بود.',
    'مفهوم Parity در RAID 5 هنوز هم یکی از جذاب‌ترین محاسبات منطقی در مهندسی ذخیره‌سازی است.',
    'امروز با ظهور SSDهای پرسرعت، معماری‌های جدیدتری مثل RAID 10 یا Erasure Coding در ZFS جایگزین شدند.',
    'تحمل خرابی دیسک بدون قطع شدن سرویس‌دهی سرور، بزرگ‌ترین دغدغه مدیران سیستم رو حل کرد.',
    'ابزار محاسبه RAID در بخش ابزارهای تکباکس دقیقاً بر پایه همین اصول ریاضی کار می‌کنه.',
  ],
  'tl-dc-4': [
    'پروتکل فیبر نوری (Fibre Channel) سرعت انتقال داده بین سرور و SAN رو وارد ابعاد کاملاً جدیدی کرد.',
    'تاخیر بسیار پایین و بدون Loss بودن فریم‌های FC باعث شد تمام بانک‌ها و سازمان‌ها به سمت SAN حرکت کنند.',
    'رقابت FC با iSCSI و بعداً NVMe over Fabrics یکی از جذاب‌ترین مباحث معماری ذخیره‌سازی دیتاسنتره.',
    'سوییچ‌های Director فیبر نوری در دیتاسنترهای بزرگ مثل قلب تپنده زیرساخت کار می‌کنند.',
    'جداسازی شبکه ذخیره‌سازی (SAN) از شبکه ترافیک کاربران (LAN) امنیت و پایداری رو تضمین کرد.',
    'کارت‌های HBA فیبر نوری هنوز هم در سرورهای حیاتی پایگاه‌داده بی‌رقیب هستند.',
  ],
  'tl-dc-5': [
    'تأسیس VMware و معرفی ESX در سال ۱۹۹۸ بزرگ‌ترین تحول بهره‌وری سرورهای x86 بود.',
    'قبل از مجازی‌سازی، راندمان استفاده از پردازنده سرورها زیر ۱۵ درصد بود و کلی منابع هدر می‌رفت!',
    'قابلیت vMotion و Live Migration در دیتاسنترها زمان خودش شبیه معجزه بود.',
    'هنوز هم پایداری ESXi در محیط‌های Enterprise مثال‌زدنیه و استاندارد طلایی مجازی‌سازی محسوب می‌شه.',
    'مجازی‌سازی باعث شد تعداد رک‌های مورد نیاز سازمان‌ها به یک‌دهم کاهش پیدا کنه و برق دیتاسنتر سیو بشه.',
    'تکنولوژی Binary Translation که VMware برای مجازی‌سازی x86 ابداع کرد یک شاهکار مهندسی نرم‌افزار بود.',
  ],
  'tl-dc-6': [
    'سرورهای تیغه‌ای (Blade) مفهوم تراکم پردازشی در هر یونیت از رک دیتاسنتر رو متحول کردند.',
    'اشتراک پاور ساپلای‌های قدرتمند و فن‌های خنک‌کننده در شاسی Blade مصرف انرژی رو بسیار کاهش داد.',
    'کاهش حجم کابل‌کشی پشت سرورها (Cable Management) یکی از بهترین مزیت‌های شاسی‌های بلید بود.',
    'بعداً برندهایی مثل HP با سری c-Class و Cisco با UCS بازار سرورهای تیغه‌ای رو به اوج رساندند.',
    'مدیریت متمرکز ده‌ها سرور از طریق یک پورت مدیریتی کار ادمین‌های دیتاسنتر رو خیلی راحت کرد.',
    'امروز سرورهای Multi-Node و ساختارهای OCP تا حدودی جایگزین بلیدهای کلاسیک شدند.',
  ],
  'tl-dc-7': [
    'سال ۲۰۰۶ وقتی آمازون EC2 رو معرفی کرد، دوران سرورهای فیزیکی اختصاصی وارد مرحله جدیدی شد.',
    'سرویس S3 هنوز هم استاندارد طلایی Object Storage در تمام دیتاسنترهای ابری دنیاست.',
    'مفهوم IaaS و پردازش ابری واقعی و مقیاس‌پذیر از همین نقطه شروع شد.',
    'تغییر مدل هزینه سازمان‌ها از سرمایه‌گذاری اولیه (CapEx) به هزینه جاری (OpEx) بزرگ‌ترین دستاورد کلاود بود.',
    'الگوی طراحی APIهای AWS امروز توسط تمام ارائه‌دهندگان ابری الگوبرداری می‌شه.',
    'قابلیت Elasticity و افزایش خودکار سرورها در زمان پیک ترافیک انقلابی در وب‌سایت‌های پرترافیک ایجاد کرد.',
  ],
  'tl-dc-8': [
    'معرفی Proxmox VE به عنوان یک هایپروایزر متن‌باز مبتنی بر دبیان، هدیه بزرگی به جامعه متن‌باز بود.',
    'ترکیب بی‌نظیر ماشین‌های مجازی KVM و کانتینرهای سبک LXC در یک رابط کاربری وب عالی کار شده.',
    'پشتیبانی پیش‌فرض از فایل‌سیستم ZFS و کلاسترینگ Ceph باعث شد بدون هزینه لایسنس یک زیرساخت قوی بسازیم.',
    'بکاپ سرور اختصاصی Proxmox Backup Server (PBS) با قابلیت Deduplication یکی از بهترین ابزارهای ادمین‌هاست.',
    'امروز با تغییر سیاست‌های لایسنسینگ برخی برندها، مهاجرت سازمان‌ها به سمت Proxmox چندبرابر شده.',
    'رابط کاربری وب روان و عدم نیاز به سرور مدیریتی جداگانه (مثل vCenter) مدیریت کلاستر رو ساده کرده.',
  ],
  'tl-dc-9': [
    'پروژه OCP فیس‌بوک انحصار طراحی سخت‌افزارهای دیتاسنتری رو شکست و استانداردها رو باز کرد.',
    'تغییر ولتاژ توزیع برق در رک از ۱۲ ولت به ۴۸ ولت تلفات انرژی در دیتاسنترها رو به شدت کاهش داد.',
    'طراحی سرورها بدون قطعات اضافی (Vanity-free) و تمرکز روی خنک‌کنندگی عالی راندمان رو به اوج رساند.',
    'مشارکت غول‌هایی مثل مایکروسافت، گوگل و اینتل در OCP باعث شد کل صنعت سخت‌افزار تغییر کنه.',
    'شاخص PUE در دیتاسنترهای مدرن به لطف استانداردهای OCP به نزدیکی ۱.۰۸ رسید.',
    'مفهوم Disaggregated Storage و Open Networking دقیقا دستاورد همین جنبش سخت‌افزار باز بود.',
  ],
  'tl-dc-10': [
    'معرفی Docker در سال ۲۰۱۳ نحوه توسعه، تست و استقرار نرم‌افزارها روی سرورها را برای همیشه عوض کرد.',
    'ایزوله‌سازی کانتینرها بدون سربار سنگین ماشین‌های مجازی (Overhead) مصرف RAM سرورها رو به شدت کاهش داد.',
    'شعار Build, Ship, and Run Anywhere مشکل همیشگی «روی سیستم من کار می‌کنه» رو حل کرد.',
    'رجیستری Docker Hub اشتراک‌گذاری ایمیج سرویس‌ها مثل دیتابیس‌ها و وب‌سرورها رو در چند ثانیه ممکن کرد.',
    'معماری مایکروسرویس‌ها (Microservices) بدون وجود کانتینرهای داکر عملاً غیرقابل پیاده‌سازی بود.',
    'تکباکس هم بسیاری از ابزارها و سرویس‌های خودش رو روی زیرساخت کانتینری و داکر مدیریت می‌کنه.',
  ],
  'tl-dc-11': [
    'متن‌باز کردن کوبرنتیز (Kubernetes) توسط گوگل بر پایه تجربه یک دهه کار با Borg بزرگ‌ترین هدیه به دنیای DevOps بود.',
    'کوبرنتیز به سرعت به سیستم‌عامل استاندارد مدیریت و هماهنگ‌سازی کلاسترها در تمام دیتاسنترها تبدیل شد.',
    'قابلیت خودترمیمی (Self-healing)، مقیاس‌دهی خودکار و رولینگ آپدیت بدون داون‌تایم بی‌نظیره.',
    'اکوسیستم عظیم Cloud Native (CNCF) که دور کوبرنتیز شکل گرفت کل صنعت نرم‌افزار رو متحول کرد.',
    'مفهوم Infrastructure as Code و تعریف تمام زیرساخت با فایل‌های YAML مدیریت کلاسترها رو منظم کرد.',
    'امروز تمام ارائه‌دهندگان ابری دنیا سرویس مدیریت‌شده کوبرنتیز (مثل EKS، GKE و AKS) رو ارائه می‌دن.',
  ],
  'tl-dc-12': [
    'معرفی معماری سوپرکلاسترهای هوش مصنوعی با ارتباطات پرسرعت NVLink دیتاسنترها رو وارد عصر جدیدی کرد.',
    'تراکم توان مصرفی در هر رک از ۱۰ کیلووات کلاسیک به بیش از ۱۰۰ کیلووات در رک‌های هوش مصنوعی رسید!',
    'محدودیت خنک‌کننده هوایی (Air Cooling) باعث شد تمام دیتاسنترهای جدید به سمت خنک‌کننده مایع (Liquid Cooling) بروند.',
    'ارتباط مستقیم هزاران پردازنده گرافیکی با پهنای باند ترابایتی نیازمند معماری شبکه InfiniBand و Spectrum-X شد.',
    'دیتاسنترهای مدرن امروز بیشتر به کارخانه‌های عظیم پردازش هوش مصنوعی (AI Factories) تبدیل شده‌اند.',
    'سرمایه‌گذاری صدها میلیارد دلاری روی زیرساخت‌های AI بزرگ‌ترین جهش سخت‌افزاری تاریخ فناوری اطلاعاته.',
  ],
};

const defaultGeneralComments = [
  'نقطه عطف بسیار مهمی در تاریخ زیرساخت و فناوری اطلاعات بود.',
  'این رویداد مسیر طراحی معماری دیتاسنترها را برای همیشه تغییر داد.',
  'ممنون از تکباکس بابت گردآوری دقیق تاریخچه فناوری اطلاعات.',
  'تأثیر این تحول روی سرعت و بهره‌وری شبکه‌های سازمانی فوق‌العاده بود.',
  'یکی از جذاب‌ترین بخش‌های تاریخ مهندسی کامپیوتر و سرور.',
];

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const initialLikes = Array.isArray(event.likes)
    ? event.likes.length
    : typeof event.likes === 'number'
      ? event.likes
      : (Math.abs((event.id || 'tl').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 45) + 12;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikes);

  const initialComments = milestoneCommentsMap[event.id] || defaultGeneralComments;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<string[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');

  const widthClass =
    importance >= 8
      ? 'w-72 sm:w-80'
      : importance >= 6
        ? 'w-64 sm:w-72'
        : 'w-60 sm:w-64';

  const cardImage = event.image || fallbackImages[Math.abs((event.title?.length || 0) % fallbackImages.length)];

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      fetch(`/api/timeline/events/${event.id}`, { method: 'PUT', body: JSON.stringify({ likes: nextLiked ? likesCount + 1 : likesCount - 1 }) }).catch(() => {});
    } catch {}
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newCommentText.trim()) return;
    setComments((prev) => [newCommentText.trim(), ...prev]);
    setNewCommentText('');
  };

  return (
    /* Outer wrapper managing fixed top card height (Tier 1) and expanding comment drawer below (Tier 2) */
    <div style={style} className={`${widthClass} select-none shrink-0 group flex flex-col justify-start`}>
      
      {/* TIER 1: STRICTLY FIXED HEIGHT CARD BOX (h-[340px] sm:h-[360px])
          When comments open below, this top card stays 100% untouched and fixed in place! */}
      <div className="relative h-[340px] sm:h-[360px] w-full rounded-xl overflow-hidden shadow-[var(--tb-shadow-lg)] border border-[var(--tb-border)] hover:border-[var(--tb-timeline)] transition-colors duration-[var(--tb-motion-md)] flex flex-col justify-end bg-slate-950">
        
        {/* Fixed Background Image filling the exact fixed card box */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src={cardImage}
            alt={event.title || 'تصویر رویداد'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          {/* Bottom-to-top gradient overlay ensuring high-contrast readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        {/* Content & Toolbar fixed inside Tier 1 */}
        <div className="relative z-10 p-4.5 flex flex-col justify-end h-full text-white">
          <div className="flex-1 flex flex-col justify-end overflow-hidden mb-4">
            <h3 className="tb-text-md font-bold text-white mb-2 line-clamp-2 leading-7">
              {event.title}
            </h3>
            <p className="tb-text-sm text-slate-300 line-clamp-4 leading-6">
              {event.description}
            </p>
          </div>

          <div className="border-t border-white/20 pt-3 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLikeToggle}
              className="flex items-center gap-1.5 tb-text-sm text-slate-300 hover:text-red-400 transition-colors cursor-pointer font-bold"
            >
              <Heart size={16} className={liked ? 'fill-current text-red-500' : ''} />
              <span>{likesCount.toLocaleString('fa-IR')}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1.5 tb-text-sm text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer font-bold"
            >
              <MessageCircle size={16} />
              <span>{comments.length.toLocaleString('fa-IR')} نظر</span>
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2: EXPANDING COMMENT DRAWER
          Sits directly beneath Tier 1. Opening it glides downwards without touching or moving anything in Tier 1! */}
      {showComments && (
        <div
          className="w-full mt-2 rounded-xl border border-[var(--tb-border)] bg-slate-950/95 p-3.5 shadow-2xl flex flex-col gap-3 max-h-80 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-300 z-20"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleAddComment} className="flex gap-1.5 items-center shrink-0">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="نظر یا تجربه خود را بنویسید..."
              className="input !h-9 !py-1 !px-2.5 tb-text-sm flex-1 !bg-slate-900 !text-white !border-slate-700"
            />
            <button
              type="submit"
              className="h-9 px-3 rounded-[var(--tb-radius-md)] bg-[var(--tb-timeline)] text-slate-950 font-bold flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer shrink-0"
              title="ارسال نظر"
            >
              <Send size={14} className="rtl:rotate-180" />
            </button>
          </form>

          <ul className="space-y-2 text-right">
            {comments.map((commentText, idx) => (
              <li
                key={idx}
                className="rounded-[var(--tb-radius-sm)] bg-slate-900/90 p-2.5 tb-text-sm text-slate-200 border border-slate-700/60 leading-5"
              >
                <div className="flex items-center justify-between text-[11px] text-cyan-400 mb-1">
                  <span className="font-bold">کاربر انجمن تکباکس</span>
                  <span className="text-slate-400">لحظاتی پیش</span>
                </div>
                <p className="text-xs">{commentText}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
