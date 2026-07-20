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
import { formatRelativeTime } from "@/lib/date-format";
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

const moduleCopy: Partial<Record<ModuleSlug, { type: string; action: string }>> = {
  blog: { type: "مقاله", action: "منتشر شد" },
  news: { type: "خبر", action: "منتشر شد" },
  media: { type: "ویدیو", action: "منتشر شد" },
  review: { type: "نقد و بررسی", action: "منتشر شد" },
  download: { type: "فایل", action: "اضافه شد" },
  shop: { type: "محصول", action: "اضافه شد" },
  forum: { type: "موضوع", action: "ایجاد شد" },
  tools: { type: "ابزار", action: "اضافه شد" },
};

function getModule(item: TickerItem): ModuleSlug {
  return KNOWN.includes(item.module as ModuleSlug) ? (item.module as ModuleSlug) : "blog";
}

function getModuleCopy(module: ModuleSlug) {
  return moduleCopy[module] ?? {
    type: moduleMeta[module]?.titleFa || module,
    action: "منتشر شد",
  };
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  const { items: liveItems } = useHomeTicker();
  const live = liveItems.length ? liveItems : items;
  const filtered = useMemo(
    () => live.filter((item) => item.module !== "news" && item.module !== "shop").slice(0, 30),
    [live]
  );
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const targetSpeed = useMotionValue(NORMAL_SPEED);
  const speed = useSpring(targetSpeed, { stiffness: 45, damping: 18, mass: 0.8 });
  const groupWidthRef = useRef(0);
  const [groupNode, setGroupNode] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!groupNode) return;

    const measure = () => {
      const width = groupNode.getBoundingClientRect().width;
      if (width > 0) {
        groupWidthRef.current = width;
        x.jump(-width);
        setVisible(true);
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(groupNode);
    return () => observer.disconnect();
  }, [groupNode, x]);

  useAnimationFrame((_time, delta) => {
    if (shouldReduceMotion || !visible) return;

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
        const relativeDate = formatRelativeTime(item.date);

        return (
          <Link
            key={`${groupIndex}-${item.module}-${item.slug}-${index}`}
            href={`/${itemModule}/${item.slug}`}
            tabIndex={groupIndex > 0 ? -1 : undefined}
            className="ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-light text-foreground hover:text-foreground/80 transition-colors duration-200"
            dir="rtl"
          >
            {/* Dot separator */}
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />

            {/* Sentence: «مقاله راهنمای ... منتشر شد.» */}
            <span className="text-foreground font-light">
              {copy.type}{" "}
              <span className="font-light">{item.title}</span>{" "}
              <span className="font-light">{copy.action}.</span>
            </span>

            {/* Relative date — different color, same weight */}
            {relativeDate && (
              <span className="text-muted-foreground font-light shrink-0">{relativeDate}</span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <section
      className={`w-full max-w-full overflow-x-hidden overflow-hidden ${className}`}
      aria-label="آخرین به‌روزرسانی‌ها"
    >
      <div
        dir="ltr"
        className="ticker-wrapper relative w-full max-w-full overflow-x-hidden overflow-hidden"
        onMouseEnter={() => targetSpeed.set(HOVER_SPEED)}
        onMouseLeave={() => targetSpeed.set(NORMAL_SPEED)}
      >
        <motion.div
          className="ticker-motion-track flex w-max min-w-max items-center"
          style={
            shouldReduceMotion
              ? undefined
              : { x, opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }
          }
        >
          {renderGroup(0)}
          {!shouldReduceMotion && renderGroup(1)}
        </motion.div>
      </div>
    </section>
  );
}
