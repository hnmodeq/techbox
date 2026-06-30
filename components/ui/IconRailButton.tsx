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
  | "warning"
  | "danger";

const toneVar: Record<Tone, string> = {
  default: "--tb-foreground",
  brand: "--tb-brand",
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
  account: "--tb-account",
  warning: "--tb-warning",
  danger: "--tb-danger",
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
        className={cn("icon-rail-btn relative", className)}
        style={{ color: active ? `var(${cssVar})` : undefined, ...style }}
        {...props}
      />
    );
  }
);
IconRailButton.displayName = "IconRailButton";
export default IconRailButton;
