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

// NOTE: Tags/categories must NOT carry module/semantic colors anymore.
// Every former colored variant now renders as a single neutral chip so the
// only colors in the UI come from intentional module headers/feeds, not tags.
const neutralVariants = new Set<Variant>([
  "home", "blog", "news", "media", "shop", "tools", "raid", "subnet", "vip",
  "forum", "review", "download", "success", "warning", "danger", "info",
]);

const neutralClass =
  "bg-transparent text-[var(--tb-muted-foreground)] border-[var(--tb-border)]";

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant="default", style, ...props }, ref) => {
    const isNeutralized = neutralVariants.has(variant);
    const variantClass = isNeutralized ? neutralClass : variants[variant as keyof typeof variants];
    return (
      <span
        ref={ref}
        className={cn(base, variantClass, className)}
        style={style}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
export default Badge;
