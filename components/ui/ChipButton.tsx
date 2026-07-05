"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
 | "default"
 | "brand"
 | "home"
 | "blog"
 | "news"
 | "media"
 | "shop"
 | "tools"
 | "raid"
 | "subnet"
 | "vip"
 | "forum"
 | "review"
 | "download"
 | "success"
 | "warning"
 | "danger"
 | "info";

export interface ChipButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 tone?: Tone;
 active?: boolean;
}

const toneVar: Record<Tone, string> = {
 default: "--tb-fg-muted",
 brand: "--tb-primary",
 home: "--tb-home",
 blog: "--tb-blog",
 news: "--tb-news",
 media: "--tb-media",
 shop: "--tb-shop",
 tools: "--tb-tools",
 raid: "--tb-raid",
 subnet: "--tb-subnet",
 vip: "--tb-vip",
 forum: "--tb-forum",
 review: "--tb-review",
 download: "--tb-download",
 success: "--tb-success",
 warning: "--tb-warning",
 danger: "--tb-danger",
 info: "--tb-info",
};

export const ChipButton = React.forwardRef<HTMLButtonElement, ChipButtonProps>(
 ({ className, tone = "default", active = false, style, ...props }, ref) => {
 const cssVar = toneVar[tone];
 return (
 <button
 ref={ref}
 type="button"
 className={cn(
 "inline-flex items-center justify-center gap-1 rounded-[var(--corner-radius)] border px-3 py-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ",
 "transition-colors duration-[var(--tb-motion-sm)] ease-[var(--tb-ease)]",
 "focus-visible:outline-none focus-visible:shadow-[var(--tb-ring-3)] disabled:pointer-events-none disabled:opacity-50",
 className
 )}
 style={{
 color: `var(${cssVar})`,
 borderColor: `color-mix(in oklch, var(${cssVar}) ${active ? "38%" : "22%"}, transparent)`,
 background: active
 ? `color-mix(in oklch, var(${cssVar}) 16%, transparent)`
 : "color-mix(in oklch, var(--muted-background) 78%, transparent)",
 ...style,
 }}
 {...props}
 />
 );
 }
);
ChipButton.displayName = "ChipButton";
export default ChipButton;
