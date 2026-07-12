import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Legacy TechBox variant/size names mapped to shadcn names during migration.
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "vip"
  | "link";
export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "icon"
  | "iconSm"
  | "icon-sm"
  | "icon-xs"
  | "icon-lg"
  | "default";

function mapVariant(variant?: ButtonVariant): VariantProps<typeof buttonVariants>["variant"] {
  switch (variant) {
    case "primary":
      return "default";
    case "danger":
      return "destructive";
    case "vip":
      return "default";
    case "secondary":
    case "ghost":
    case "outline":
    case "link":
      return variant;
    default:
      return "default";
  }
}

function mapSize(size?: ButtonSize): VariantProps<typeof buttonVariants>["size"] {
  switch (size) {
    case "md":
    case "default":
      return "default";
    case "iconSm":
    case "icon-sm":
      return "icon-sm";
    case "icon-xs":
      return "icon-xs";
    case "icon-lg":
      return "icon-lg";
    case "xs":
    case "sm":
    case "lg":
    case "icon":
      return size;
    default:
      return "default";
  }
}

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    Omit<VariantProps<typeof buttonVariants>, "variant" | "size"> {
  /** @deprecated Use shadcn `variant` names instead. Legacy names are mapped for compatibility. */
  variant?: ButtonVariant;
  /** @deprecated Use shadcn `size` names instead. Legacy names are mapped for compatibility. */
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, ...props },
    ref
  ) => {
    const mappedVariant = mapVariant(variant);
    const mappedSize = mapSize(size);
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        className={cn(
          buttonVariants({ variant: mappedVariant, size: mappedSize }),
          variant === "vip" &&
            "bg-gradient-to-br from-[var(--home)] to-[var(--admin)] text-white hover:opacity-90",
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <Spinner className="me-2 size-3.5" />
        )}
        {children}
      </ButtonPrimitive>
    );
  }
);
Button.displayName = "Button";

export interface ButtonLinkProps
  extends LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  /** @deprecated Use shadcn `variant` names instead. Legacy names are mapped for compatibility. */
  variant?: ButtonVariant;
  /** @deprecated Use shadcn `size` names instead. Legacy names are mapped for compatibility. */
  size?: ButtonSize;
}

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const mappedVariant = mapVariant(variant);
    const mappedSize = mapSize(size);
    const Primitive = ButtonPrimitive as React.ComponentType<
      React.PropsWithChildren<{
        asChild?: boolean;
        className?: string;
        "data-slot"?: string;
      }>
    >;
    return (
      <Primitive
        asChild
        data-slot="button"
        className={cn(
          buttonVariants({ variant: mappedVariant, size: mappedSize }),
          variant === "vip" &&
            "bg-gradient-to-br from-[var(--home)] to-[var(--admin)] text-white hover:opacity-90",
          className
        )}
      >
        <Link ref={ref} {...props}>
          {children}
        </Link>
      </Primitive>
    );
  }
);
ButtonLink.displayName = "ButtonLink";

export { buttonVariants };
export default Button;
