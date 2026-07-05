'use client';

import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { Heart, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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

const milestoneCommentsMap: Record<string, string[]> = {
  'tl-dc-1': [
    'معماری ۳۶۰ واقعاً تعریف استاندارد سرورها رو برای همیشه عوض کرد.',
    'هنوز هم اصول I/O Channel و جداسازی سخت‌افزار از نرم‌افزار که اون زمان طراحی شد در مین‌فریم‌ها کاربرد داره.',
    'پدربزرگ دیتاسنترهای مدرن امروزی! وزن و ابعاد اون تجهیزات در اتاق سرورهای دهه ۶۰ میلادی باورکردنی نبود.',
    'اولین باری که مفهوم آپگرید سخت‌افزار بدون تغییر کد برنامه مطرح شد و سرمایه‌گذاری نرم‌افزاری سازمان‌ها حفظ شد.',
    'سرمایه‌گذاری ۵ میلیارد دلاری IBM روی این پروژه در زمان خودش بزرگ‌ترین ریسک تاریخ فناوری اطلاعات بود.',
  ],
  'tl-dc-2': [
    'باب متکالف وقتی اترنت رو طراحی کرد شاید تصور نمی‌کرد سرعتش از ۳ مگابیت به ۸۰۰ گیگابیت برسه!',
    'پروتکل CSMA/CD اترنت یکی از شاهکارهای بی‌بدیل تاریخ مهندسی شبکه است.',
    'هنوز بعد از نیم قرن، فریم‌های اترنت ساختار اصلی ارتباط سوئیچ‌های دیتاسنتری رو تشکیل می‌دن.',
    'رقابت اترنت با Token Ring و پیروزی قاطعش به خاطر سادگی و هزینه کمتر واقعاً دیدنی بود.',
  ],
  'tl-dc-3': [
    'مقاله پترسون و همکارانش در دانشگاه برکلی اساس تمام استوریج‌های سازمانی امروزی شد.',
    'ایده استفاده از هارد دیسک‌های ارزان‌قیمت PC به جای دیسک‌های گران‌قیمت مین‌فریم نبوغ‌آمیز بود.',
    'مفهوم Parity در RAID 5 هنوز هم یکی از جذاب‌ترین محاسبات منطقی در مهندسی ذخیره‌سازی است.',
  ],
  'tl-dc-4': [
    'پروتکل فیبر نوری (Fibre Channel) سرعت انتقال داده بین سرور و SAN رو وارد ابعاد کاملاً جدیدی کرد.',
    'تاخیر بسیار پایین و بدون Loss بودن فریم‌های FC باعث شد تمام بانک‌ها و سازمان‌ها به سمت SAN حرکت کنند.',
  ],
  'tl-dc-5': [
    'تأسیس VMware و معرفی ESX در سال ۱۹۹۸ بزرگ‌ترین تحول بهره‌وری سرورهای x86 بود.',
    'قبل از مجازی‌سازی، راندمان استفاده از پردازنده سرورها زیر ۱۵ درصد بود و کلی منابع هدر می‌رفت!',
  ],
  'tl-dc-6': [
    'سرورهای تیغه‌ای (Blade) مفهوم تراکم پردازشی در هر یونیت از رک دیتاسنتر رو متحول کردند.',
    'اشتراک پاور ساپلای‌های قدرتمند و فن‌های خنک‌کننده در شاسی Blade مصرف انرژی رو بسیار کاهش داد.',
  ],
  'tl-dc-7': [
    'سال ۲۰۰۶ وقتی آمازون EC2 رو معرفی کرد، دوران سرورهای فیزیکی اختصاصی وارد مرحله جدیدی شد.',
    'سرویس S3 هنوز هم استاندارد طلایی Object Storage در تمام دیتاسنترهای ابری دنیاست.',
  ],
  'tl-dc-8': [
    'معرفی Proxmox VE به عنوان یک هایپروایزر متن‌باز مبتنی بر دبیان، هدیه بزرگی به جامعه متن‌باز بود.',
    'ترکیب بی‌نظیر ماشین‌های مجازی KVM و کانتینرهای سبک LXC در یک رابط کاربری وب عالی کار شده.',
  ],
  'tl-dc-9': [
    'پروژه OCP فیس‌بوک انحصار طراحی سخت‌افزارهای دیتاسنتری رو شکست و استانداردها رو باز کرد.',
    'تغییر ولتاژ توزیع برق در رک از ۱۲ ولت به ۴۸ ولت تلفات انرژی در دیتاسنترها رو به شدت کاهش داد.',
  ],
  'tl-dc-10': [
    'معرفی Docker در سال ۲۰۱۳ نحوه توسعه، تست و استقرار نرم‌افزارها روی سرورها را برای همیشه عوض کرد.',
    'ایزوله‌سازی کانتینرها بدون سربار سنگین ماشین‌های مجازی (Overhead) مصرف RAM سرورها رو به شدت کاهش داد.',
  ],
  'tl-dc-11': [
    'متن‌باز کردن کوبرنتیز (Kubernetes) توسط گوگل بر پایه تجربه یک دهه کار با Borg بزرگ‌ترین هدیه به دنیای DevOps بود.',
    'کوبرنتیز به سرعت به سیستم‌عامل استاندارد مدیریت و هماهنگ‌سازی کلاسترها در تمام دیتاسنترها تبدیل شد.',
  ],
  'tl-dc-12': [
    'معرفی معماری سوپرکلاسترهای هوش مصنوعی با ارتباطات پرسرعت NVLink دیتاسنترها رو وارد عصر جدیدی کرد.',
    'تراکم توان مصرفی در هر رک از ۱۰ کیلووات کلاسیک به بیش از ۱۰۰ کیلووات در رک‌های هوش مصنوعی رسید!',
  ],
};

const defaultGeneralComments = [
  'نقطه عطف بسیار مهمی در تاریخ زیرساخت و فناوری اطلاعات بود.',
  'این رویداد مسیر طراحی معماری دیتاسنترها را برای همیشه تغییر داد.',
];

export function TimelineCard({ event, style, importance }: TimelineCardProps) {
  const baseFallbackLikes = (Math.abs((event.id || 'tl').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 45) + 12;
  const initialLikesCount = Array.isArray(event.likes) && event.likes.length > 0
    ? event.likes.length
    : typeof event.likes === 'number' && event.likes > 0
      ? event.likes
      : baseFallbackLikes;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [commentError, setCommentError] = useState('');

  const defaultCommentsList = (milestoneCommentsMap[event.id] || []).map((text, i) => ({
    authorName: 'کاربر انجمن تکباکس',
    text,
    createdAt: 'لحظاتی پیش'
  }));

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{ authorName: string; text: string; createdAt: string }>>(
    Array.isArray(event.comments) && event.comments.length > 0
      ? event.comments.map((c: any) => ({ authorName: c.authorName || 'کاربر', text: c.text, createdAt: 'لحظاتی پیش' }))
      : defaultCommentsList
  );
  const [newCommentText, setNewCommentText] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch(`/api/timeline/like?eventId=${encodeURIComponent(event.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted && data) {
          if (typeof data.likes === 'number' && data.likes > 0) {
            setLikesCount(data.likes);
          }
          if (typeof data.liked === 'boolean') {
            setLiked(data.liked);
          }
        }
      })
      .catch(() => {});

    fetch(`/api/timeline/comments?eventId=${encodeURIComponent(event.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setComments(
            data.map((c: any) => ({
              authorName: c.authorName || 'عضو تکباکس',
              text: c.text,
              createdAt: 'لحظاتی پیش',
            }))
          );
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, [event.id]);

  const widthClass =
    importance >= 8
      ? 'w-72 sm:w-80'
      : importance >= 6
        ? 'w-64 sm:w-72'
        : 'w-60 sm:w-64';

  const cardImage = event.image || fallbackImages[Math.abs((event.title?.length || 0) % fallbackImages.length)];

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLoginPrompt(false);
    try {
      const res = await fetch('/api/timeline/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("tb_open_auth"));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        if (typeof data.likes === 'number') {
          setLikesCount(data.likes);
        }
      }
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentError('');
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch('/api/timeline/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, text: newCommentText.trim() }),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("tb_open_auth"));
        return;
      }

      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [
          { authorName: created.authorName || 'شما', text: created.text, createdAt: 'لحظاتی پیش' },
          ...prev,
        ]);
        setNewCommentText('');
      } else {
        const err = await res.json();
        setCommentError(err.message || err.error || 'خطا در ثبت نظر');
      }
    } catch {
      setCommentError('خطا در برقراری ارتباط با سرور');
    }
  };

  return (
    <div style={style} className={`${widthClass} select-none shrink-0 group flex flex-col justify-start relative`}>
      {/* TIER 1: STRICTLY FIXED HEIGHT CARD BOX */}
      <div className="relative h-[340px] sm:h-[360px] w-full rounded-[var(--corner-radius)] overflow-hidden shadow-[var(--shadow-size)] border-[length:var(--border-size)] border-[var(--border-color)] hover:border-[var(--timeline)] transition-colors duration-[200ms] flex flex-col justify-end bg-slate-950">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src={cardImage}
            alt={event.title || 'تصویر رویداد'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-4.5 flex flex-col justify-end h-full text-white">
          <div className="flex-1 flex flex-col justify-end overflow-hidden mb-4">
            <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-white mb-2 line-clamp-2 leading-7">
              {event.title}
            </h3>
            <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-300 line-clamp-4 leading-6">
              {event.description}
            </p>
          </div>

          <div className="border-t-[length:var(--border-size)] border-white/20 pt-3 flex items-center justify-between gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={handleLikeToggle}
                className="flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-300 hover:text-red-400 transition-colors cursor-pointer font-bold"
              >
                <Heart size={16} className={liked ? 'fill-current text-red-500' : ''} />
                <span>{likesCount.toLocaleString('fa-IR')}</span>
              </button>

              {showLoginPrompt && (
                <div className="absolute bottom-full mb-2 right-0 z-50 w-56 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-slate-900 p-2.5 shadow-[var(--shadow-size)] text-center">
                  <p className="text-xs text-white mb-2">برای پسندیدن رویداد ابتدا وارد شوید.</p>
                  <div className="flex justify-center gap-1.5">
                    <Button size="xs" onClick={() => router.push('/account')}>ورود / عضویت</Button>
                    <Button variant="ghost" size="xs" onClick={() => setShowLoginPrompt(false)}>بستن</Button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer font-bold"
            >
              <MessageCircle size={16} />
              <span>{comments.length.toLocaleString('fa-IR')} نظر</span>
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2: EXPANDING COMMENT DRAWER */}
      {showComments && (
        <div
          className="w-full mt-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-slate-950/95 p-3.5 shadow-[var(--shadow-size)] flex flex-col gap-3 max-h-80 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-300 z-20"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleAddComment} className="flex flex-col gap-2 shrink-0">
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => {
                  setNewCommentText(e.target.value);
                  setCommentError('');
                }}
                placeholder="نظر یا تجربه خود را بنویسید..."
                className="input !h-9 !py-1 !px-2.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex-1 !bg-slate-900 !text-white !border-slate-700"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-[var(--corner-radius)] bg-[var(--timeline)] text-slate-950 font-bold flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer shrink-0"
                title="ارسال نظر"
              >
                <Send size={14} className="rtl:rotate-180" />
              </button>
            </div>
            {commentError && (
              <div className="text-[11px] text-red-400 bg-red-950/40 p-1.5 rounded border-[length:var(--border-size)] border-red-800 flex justify-between items-center">
                <span>{commentError}</span>
                <button type="button" onClick={() => router.push('/account')} className="underline font-bold text-white">ورود</button>
              </div>
            )}
          </form>

          <ul className="space-y-2 text-right">
            {comments.map((comment, idx) => (
              <li
                key={idx}
                className="rounded-[var(--corner-radius)] bg-slate-900/90 p-2.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-slate-200 border-[length:var(--border-size)] border-slate-700/60 leading-5"
              >
                <div className="flex items-center justify-between text-[11px] text-cyan-400 mb-1">
                  <span className="font-bold">{comment.authorName}</span>
                  <span className="text-slate-400">{comment.createdAt}</span>
                </div>
                <p className="text-xs">{comment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
