"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { moduleColors } from "@/config/module-colors";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useHomeTicker } from "@/features/home/lib/home-data";


type TickerItem = {
  slug: string;
  title: string;
  module?: ModuleSlug | string;
  date?: string;
  date_fa?: string;
  time?: string;
  author?: { name?: string };
};

type NewsTickerProps = { items: TickerItem[]; className?: string };

const KNOWN: ModuleSlug[] = ["blog", "news", "media", "review", "tools", "download", "shop", "forum"];
const NORMAL_SPEED = 48;
const HOVER_SPEED = 7;

const moduleCopy: Partial<Record<ModuleSlug, { type: string; place: string; action: string }>> = {
  blog: { type: "مقاله", place: "مجله", action: "منتشر شد" },
  news: { type: "خبر", place: "اخبار", action: "منتشر شد" },
  media: { type: "ویدیو", place: "ویدیوهای کوتاه", action: "منتشر شد" },
  review: { type: "نقد و بررسی", place: "نقد و بررسی", action: "منتشر شد" },
  download: { type: "فایل", place: "دانلود", action: "اضافه شد" },
  shop: { type: "محصول", place: "فروشگاه", action: "اضافه شد" },
  forum: { type: "موضوع", place: "انجمن", action: "ایجاد شد" },
  tools: { type: "ابزار", place: "ابزارها", action: "اضافه شد" },
};

const nf = new Intl.NumberFormat("fa-IR");

function getModule(item: TickerItem): ModuleSlug {
  return KNOWN.includes(item.module as ModuleSlug) ? (item.module as ModuleSlug) : "blog";
}

function getModuleCopy(module: ModuleSlug) {
  return moduleCopy[module] ?? { type: moduleMeta[module]?.titleFa || module, place: moduleMeta[module]?.titleFa || module, action: "منتشر شد" };
}

function formatRelativeDate(value: string | undefined, nowMs: number | null) {
  if (!value || nowMs === null) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = nowMs - date.getTime();
  if (diffMs < 0) return "";
  if (diffMs < 60_000) return "همین حالا";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${nf.format(minutes)} دقیقه پیش`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${nf.format(hours)} ساعت پیش`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${nf.format(days)} روز پیش`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${nf.format(months)} ماه پیش`;

  const years = Math.floor(months / 12);
  return `${nf.format(years)} سال پیش`;
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  const { items: liveItems } = useHomeTicker();
  const live = liveItems.length ? liveItems : items;
  const filtered = useMemo(() => live.filter((item) => item.module !== "news").slice(0, 30), [live]);
  const shouldReduceMotion = useReducedMotion();
  const [nowMs, setNowMs] = useState<number | null>(null);
  const x = useMotionValue(0);
  const targetSpeed = useMotionValue(NORMAL_SPEED);
  const speed = useSpring(targetSpeed, { stiffness: 45, damping: 18, mass: 0.8 });
  const groupWidthRef = useRef(0);
  const [groupNode, setGroupNode] = useState<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const updateNow = () => setNowMs(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!groupNode) return;

    const measure = () => {
      const width = groupNode.getBoundingClientRect().width;
      if (width > 0) {
        groupWidthRef.current = width;
        x.set(-width);
        setReady(true);
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(groupNode);
    return () => observer.disconnect();
  }, [groupNode, x]);

  useAnimationFrame((_time, delta) => {
    if (shouldReduceMotion || !ready) return;

    const width = groupWidthRef.current;
    if (!width) return;

    const nextX = x.get() + speed.get() * (delta / 1000);
    x.set(nextX >= 0 ? nextX - width : nextX);
  });

  if (!filtered.length) return null;

  const renderGroup = (groupIndex: number) => (
    <div
      ref={groupIndex === 0 ? setGroupNode : undefined}
      className="ticker-group flex shrink-0 items-center gap-8 py-1"
      aria-hidden={groupIndex > 0}
    >
      {filtered.map((item, index) => {
        const itemModule = getModule(item);
        const copy = getModuleCopy(itemModule);
        const relativeDate = formatRelativeDate(item.date, nowMs);
        const tone = moduleColors[itemModule].active;
        const hoverTone = moduleColors[itemModule].hover;

        return (
          <Link
            key={`${groupIndex}-${item.module}-${item.slug}-${index}`}
            href={`/${itemModule}/${item.slug}`}
            tabIndex={groupIndex > 0 ? -1 : undefined}
            className={`ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-semibold text-foreground transition-colors duration-200 ${hoverTone}`}
            dir="rtl"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 transition-transform group-hover:scale-125" />
            <span>
              <span className="font-bold text-foreground">{copy.type}</span>{" "}
              <span>{item.title}</span>{" "}
              <span className="text-muted-foreground">در</span>{" "}
              <span className={`font-bold ${tone}`}>{copy.place}</span>{" "}
              <span className="text-muted-foreground">{copy.action}.</span>
            </span>
            {relativeDate && <span className="text-muted-foreground">{relativeDate}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <section className={`w-full max-w-full overflow-x-hidden overflow-hidden ${className}`} aria-label="آخرین به‌روزرسانی‌ها">
      <motion.div
        dir="ltr"
        className="ticker-wrapper relative w-full max-w-full overflow-x-hidden overflow-hidden"
        onHoverStart={() => targetSpeed.set(HOVER_SPEED)}
        onHoverEnd={() => targetSpeed.set(NORMAL_SPEED)}
        onFocusCapture={() => targetSpeed.set(HOVER_SPEED)}
        onBlurCapture={() => targetSpeed.set(NORMAL_SPEED)}
      >
        <motion.div
          className="ticker-motion-track flex w-max min-w-max items-center"
          style={shouldReduceMotion ? undefined : { x }}
        >
          {renderGroup(0)}
          {!shouldReduceMotion && renderGroup(1)}
        </motion.div>
      </motion.div>
    </section>
  );
}
