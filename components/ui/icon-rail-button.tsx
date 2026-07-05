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
 | "account"
 | "admin"
 | "consultation"
 | "about"
 | "contact"
 | "workwithus"
 | "warning"
 | "danger";

const toneVar: Record<Tone, string> = {
 default: "--primary-text",
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
 account: "--account",
 admin: "--admin",
 consultation: "--consultation",
 about: "--about",
 contact: "--contact",
 workwithus: "--workwithus",
 warning: "--warning",
 danger: "--danger",
};

export interface IconRailButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 tone?: Tone;
 active?: boolean;
}

export const IconRailButton = React.forwardRef<HTMLButtonElement, IconRailButtonProps>(
 ({ className, tone = "default", active = false, style, ...props }, ref) => {
 const cssVar = toneVar[tone];
 return (
 <button
 ref={ref}
 type="button"
 className={cn("inline-flex h-9 w-9 items-center justify-center rounded-[var(--corner-radius)] text-[var(--paragraph-color)] hover:bg-[var(--muted-background)] hover:text-[var(--primary-text)] transition-colors cursor-pointer relative", className)}
 style={{ color: active ? `var(${cssVar})`: undefined, ...style }}
 {...props}
 />
 );
 }
);
IconRailButton.displayName = "IconRailButton";
export default IconRailButton;
