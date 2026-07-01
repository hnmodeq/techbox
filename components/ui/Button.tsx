"use client";
import Link, { type LinkProps } from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "vip" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "icon" | "iconSm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: Variant;
 size?: Size;
 loading?: boolean;
}

export interface ButtonLinkProps extends LinkProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
 variant?: Variant;
 size?: Size;
}

const base =
 "inline-flex items-center justify-center gap-2 select-none " +
 "transition-all duration-[var(--tb-motion-md)] ease-[var(--tb-ease)] " +
 "focus-visible:outline-none focus-visible:shadow-[var(--tb-ring-3)] " +
 "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant,string> = {
 primary: "text-[var(--tb-on-accent)] bg-[var(--tb-primary)] hover:brightness-[1.06] active:scale-[0.985] shadow-[var(--tb-shadow-sm)]",
 secondary: "text-[var(--tb-fg-primary)] bg-[var(--tb-bg-muted)] hover:brightness-[1.03]",
 ghost: "bg-transparent text-[var(--tb-fg-primary)] hover:bg-[var(--tb-bg-muted)] border border-[var(--tb-border)]",
 outline: "bg-transparent border border-[var(--tb-border)] text-[var(--tb-fg-primary)] hover:bg-[var(--tb-bg-muted)]",
 danger: "text-[var(--tb-on-accent)] bg-[var(--tb-danger)] border-transparent hover:brightness-[1.05] active:scale-[0.985]",
 vip: "tb-cta tb-cta-vip px-4",
 link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto border-0 shadow-none"
};

const sizes: Record<Size,string> = {
 xs: "h-7 px-2.5 tb-text-sm rounded-[var(--tb-radius-md)]",
 sm: "h-8 px-3 tb-text-sm rounded-[var(--tb-radius-md)]",
 md: "h-10 px-4 tb-text-sm rounded-[var(--tb-radius-lg)]",
 lg: "h-11 px-5 tb-text-md rounded-[var(--tb-radius-lg)]",
 icon: "h-10 w-10 p-0 rounded-[var(--tb-radius-lg)]",
 iconSm: "h-7 w-7 p-0 rounded-[var(--tb-radius-md)]"
};

export function buttonClassName({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
 return cn(base, variants[variant], sizes[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant="primary", size="md", loading, children, ...props }, ref) => {
 return (
 <button
 ref={ref}
 className={buttonClassName({ variant, size, className })}
 disabled={loading || props.disabled}
 {...props}
 >
 {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
 {children}
 </button>
 );
 }
);
Button.displayName = "Button";

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
 ({ className, variant="primary", size="md", children, ...props }, ref) => (
 <Link ref={ref} className={buttonClassName({ variant, size, className })} {...props}>
 {children}
 </Link>
 )
);
ButtonLink.displayName = "ButtonLink";

export default Button;
