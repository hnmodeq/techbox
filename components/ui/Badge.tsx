import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "brand" |
 "home" | "blog" | "news" | "media" | "shop" | "tools" | "raid" | "subnet" | "vip" | "forum" | "review" | "download" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
 variant?: Variant;
}

const base =
 "inline-flex items-center gap-1 rounded-full border px-[10px] py-[3px] " +
 "tb-text-sm font-[600] whitespace-nowrap " +
 "transition-colors duration-[var(--tb-motion-sm)]";

const variants: Record<Variant, string> = {
 default: "bg-[var(--tb-bg-muted)] text-[var(--tb-fg-primary)] border-[var(--tb-border)]",
 secondary: "bg-[var(--tb-bg-muted)] text-[var(--tb-fg-muted)] border-[var(--tb-border)]",
 outline: "bg-transparent text-[var(--tb-fg-primary)] border-[var(--tb-border)]",
 brand: "bg-[color-mix(in_oklch,var(--tb-primary)_14%,transparent)] text-[var(--tb-primary)] border-[color-mix(in_oklch,var(--tb-primary)_30%,transparent)]",
 home: "",
 blog: "",
 news: "",
 media: "",
 shop: "",
 tools: "",
 raid: "",
 subnet: "",
 vip: "",
 forum: "",
 review: "",
 download: "",
 success: "",
 warning: "",
 danger: "",
 info: "",
};

// NOTE: Tags/categories must NOT carry module/semantic colors anymore.
// Every former colored variant now renders as a single neutral chip so the
// only colors in the UI come from intentional module headers/feeds, not tags.
const neutralVariants = new Set<Variant>([
 "home", "blog", "news", "media", "shop", "tools", "raid", "subnet", "vip",
 "forum", "review", "download", "success", "warning", "danger", "info",
]);

const neutralClass =
 "bg-transparent text-[var(--tb-fg-muted)] border-[var(--tb-border)]";

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
