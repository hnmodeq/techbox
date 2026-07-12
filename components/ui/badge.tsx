import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Legacy TechBox variants mapped to shadcn-compatible styles during migration.
type LegacyBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | ModuleSlug;

type ModuleSlug =
  | "home"
  | "blog"
  | "news"
  | "media"
  | "shop"
  | "tools"
  | "raid"
  | "subnet"
  | "nas"
  | "nvr"
  | "timeline"
  | "vip"
  | "forum"
  | "review"
  | "download"
  | "account"
  | "admin"
  | "about"
  | "contact"
  | "workwithus"
  | "consultation";

const legacyVariantMap: Record<
  LegacyBadgeVariant,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  default: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  link: "link",
  destructive: "destructive",
  // TechBox semantic variants map to closest shadcn variants
  brand: "default",
  success: "secondary",
  warning: "outline",
  danger: "destructive",
  info: "secondary",
  // Module variants neutralized during migration; preserve custom colors via inline style
  home: "default",
  blog: "default",
  news: "default",
  media: "default",
  shop: "default",
  tools: "default",
  raid: "default",
  subnet: "default",
  nas: "default",
  nvr: "default",
  timeline: "default",
  vip: "default",
  forum: "default",
  review: "default",
  download: "default",
  account: "default",
  admin: "default",
  about: "default",
  contact: "default",
  workwithus: "default",
  consultation: "default",
};

function isModuleVariant(variant?: LegacyBadgeVariant): variant is ModuleSlug {
  if (!variant) return false;
  return [
    "home", "blog", "news", "media", "shop", "tools", "raid", "subnet",
    "nas", "nvr", "timeline", "vip", "forum", "review", "download",
    "account", "admin", "about", "contact", "workwithus", "consultation",
  ].includes(variant);
}

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-input/20 text-foreground dark:bg-input/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends useRender.ComponentProps<"span">,
    Omit<VariantProps<typeof badgeVariants>, "variant"> {
  /** @deprecated Use shadcn `variant` names instead. Legacy names are mapped for compatibility. */
  variant?: LegacyBadgeVariant;
}

function Badge({
  className,
  variant = "default",
  render,
  style,
  ...props
}: BadgeProps) {
  const mappedVariant = legacyVariantMap[variant] ?? "default";
  const moduleStyle = isModuleVariant(variant)
    ? ({
        backgroundColor: `color-mix(in oklch, var(--${variant}) 12%, var(--muted))`,
        color: `var(--${variant})`,
        borderColor: `color-mix(in oklch, var(--${variant}) 28%, var(--border))`,
      } as React.CSSProperties)
    : undefined;

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant: mappedVariant }), className),
        style: { ...moduleStyle, ...style },
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant: mappedVariant,
    },
  })
}

export { Badge, badgeVariants }
