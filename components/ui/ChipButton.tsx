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
 default: "--paragraph-color",
 brand: "--home",
 home: "--home",
 blog: "--blog",
 news: "--news",
 media: "--media",
 shop: "--shop",
 tools: "--tools",
 raid: "--raid",
 subnet: "--subnet",
 vip: "--vip",
 forum: "--forum",
 review: "--review",
 download: "--download",
 success: "--success",
 warning: "--warning",
 danger: "--danger",
 info: "--info",
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
 "transition-colors duration-[150ms] ease-[ease]",
 "focus-visible:outline-none focus-visible:shadow-[var(--shadow-size)] disabled:pointer-events-none disabled:opacity-50",
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
