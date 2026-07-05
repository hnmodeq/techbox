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
 primary: "text-[#ffffff] bg-[var(--home)] hover:brightness-[1.06] active:scale-[0.985] shadow-[var(--shadow-size)]",
 secondary: "text-[var(--primary-text)] bg-[var(--muted-background)] hover:brightness-[1.03]",
 ghost: "bg-transparent text-[var(--primary-text)] hover:bg-[var(--muted-background)] border border-[var(--border-color)]",
 outline: "bg-transparent border border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[var(--muted-background)]",
 danger: "text-[#ffffff] bg-[var(--tb-danger)] border-transparent hover:brightness-[1.05] active:scale-[0.985]",
 vip: "tb-cta tb-cta-vip px-4",
 link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto border-0 shadow-none"
};

const sizes: Record<Size,string> = {
 xs: "h-7 px-2.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] rounded-[var(--corner-radius)]",
 sm: "h-8 px-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] rounded-[var(--corner-radius)]",
 md: "h-10 px-4 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] rounded-[var(--corner-radius)]",
 lg: "h-11 px-5 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold rounded-[var(--corner-radius)]",
 icon: "h-10 w-10 p-0 rounded-[var(--corner-radius)]",
 iconSm: "h-7 w-7 p-0 rounded-[var(--corner-radius)]"
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
