import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "brand" |
 "home" | "blog" | "news" | "media" | "shop" | "tools" | "raid" | "subnet" | "vip" | "forum" | "review" | "download" | "timeline" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
 variant?: Variant;
}

const base =
 "inline-flex items-center gap-1 rounded-full border px-[10px] py-[3px] " +
 "text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-[600] whitespace-nowrap " +
 "transition-colors duration-[150ms]";

const variants: Record<Variant, string> = {
 default: "bg-[var(--muted-background)] text-[var(--primary-text)] border-[var(--border-color)]",
 secondary: "bg-[var(--muted-background)] paragraph-color border-[var(--border-color)]",
 outline: "bg-transparent text-[var(--primary-text)] border-[var(--border-color)]",
 brand: "bg-[color-mix(in_oklch,var(--home)_14%,transparent)] text-[var(--home)] border-[color-mix(in_oklch,var(--home)_30%,transparent)]",
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
 timeline: "",
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
 "forum", "review", "download", "timeline", "success", "warning", "danger", "info",
]);

const neutralClass =
 "bg-transparent paragraph-color border-[var(--border-color)]";

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
