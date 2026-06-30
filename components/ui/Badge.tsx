import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "brand" |
  "home" | "blog" | "news" | "media" | "shop" | "tools" | "raid" | "subnet" | "vip" | "forum" | "review" | "download" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center gap-1 rounded-full border px-[10px] py-[3px] " +
  "text-[11px] font-[600] leading-none whitespace-nowrap " +
  "transition-colors duration-[var(--tb-duration-fast)]";

const variants: Record<Variant, string> = {
  default:   "bg-[var(--tb-secondary)] text-[var(--tb-secondary-foreground)] border-[var(--tb-border)]",
  secondary: "bg-[var(--tb-muted)] text-[var(--tb-muted-foreground)] border-[var(--tb-border)]",
  outline:   "bg-transparent text-[var(--tb-foreground)] border-[var(--tb-border)]",
  brand:     "bg-[color-mix(in_oklch,var(--tb-brand)_14%,transparent)] text-[var(--tb-brand)] border-[color-mix(in_oklch,var(--tb-brand)_30%,transparent)]",
  home:      "",
  blog:      "",
  news:      "",
  media:     "",
  shop:      "",
  tools:     "",
  raid:      "",
  subnet:    "",
  vip:       "",
  forum:     "",
  review:    "",
  download:  "",
  success:   "",
  warning:   "",
  danger:    "",
  info:      "",
};

// fill module variants with CSS variables – keeps everything token-driven
const moduleMap: Record<string, string> = {
  home:     "background:color-mix(in oklch, var(--tb-home) 14%, transparent); color:var(--tb-home); border-color:color-mix(in oklch, var(--tb-home) 30%, transparent)",
  blog:     "background:color-mix(in oklch, var(--tb-blog) 14%, transparent); color:var(--tb-blog); border-color:color-mix(in oklch, var(--tb-blog) 30%, transparent)",
  news:     "background:color-mix(in oklch, var(--tb-news) 14%, transparent); color:var(--tb-news); border-color:color-mix(in oklch, var(--tb-news) 30%, transparent)",
  media:    "background:color-mix(in oklch, var(--tb-media) 14%, transparent); color:var(--tb-media); border-color:color-mix(in oklch, var(--tb-media) 30%, transparent)",
  shop:     "background:color-mix(in oklch, var(--tb-shop) 14%, transparent); color:var(--tb-shop); border-color:color-mix(in oklch, var(--tb-shop) 30%, transparent)",
  tools:    "background:color-mix(in oklch, var(--tb-tools) 14%, transparent); color:var(--tb-tools); border-color:color-mix(in oklch, var(--tb-tools) 30%, transparent)",
  raid:     "background:color-mix(in oklch, var(--tb-raid) 14%, transparent); color:var(--tb-raid); border-color:color-mix(in oklch, var(--tb-raid) 30%, transparent)",
  subnet:   "background:color-mix(in oklch, var(--tb-subnet) 14%, transparent); color:var(--tb-subnet); border-color:color-mix(in oklch, var(--tb-subnet) 30%, transparent)",
  vip:      "background:color-mix(in oklch, var(--tb-vip) 14%, transparent); color:var(--tb-vip); border-color:color-mix(in oklch, var(--tb-vip) 30%, transparent)",
  forum:    "background:color-mix(in oklch, var(--tb-forum) 14%, transparent); color:var(--tb-forum); border-color:color-mix(in oklch, var(--tb-forum) 30%, transparent)",
  review:   "background:color-mix(in oklch, var(--tb-review) 14%, transparent); color:var(--tb-review); border-color:color-mix(in oklch, var(--tb-review) 30%, transparent)",
  download: "background:color-mix(in oklch, var(--tb-download) 14%, transparent); color:var(--tb-download); border-color:color-mix(in oklch, var(--tb-download) 30%, transparent)",
  success:  "background:color-mix(in oklch, var(--tb-success) 14%, transparent); color:var(--tb-success); border-color:color-mix(in oklch, var(--tb-success) 30%, transparent)",
  warning:  "background:color-mix(in oklch, var(--tb-warning) 14%, transparent); color:var(--tb-warning); border-color:color-mix(in oklch, var(--tb-warning) 30%, transparent)",
  danger:   "background:color-mix(in oklch, var(--tb-danger) 14%, transparent); color:var(--tb-danger); border-color:color-mix(in oklch, var(--tb-danger) 30%, transparent)",
  info:     "background:color-mix(in oklch, var(--tb-info) 14%, transparent); color:var(--tb-info); border-color:color-mix(in oklch, var(--tb-info) 30%, transparent)",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant="default", style, ...props }, ref) => {
    const isModule = Object.prototype.hasOwnProperty.call(moduleMap, variant);
    return (
      <span
        ref={ref}
        className={cn(base, !isModule && variants[variant as keyof typeof variants], className)}
        style={isModule ? { ...(style||{}), ...Object.fromEntries((moduleMap[variant]||"").split(";").filter(Boolean).map(s=>{const [k,...v]=s.split(":"); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(":").trim()]})) } : style}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
export default Badge;
