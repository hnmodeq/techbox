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
 "transition-all duration-[200ms] ease-[ease] " +
 "focus-visible:outline-none focus-visible:shadow-[var(--shadow-size)] " +
 "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant,string> = {
 primary: "text-[var(--primary-text)] bg-[var(--button-background)] hover:brightness-[1.06] active:scale-[0.985] shadow-[var(--shadow-size)] border-[length:var(--border-size)] border-[var(--border-color)]",
 secondary: "text-[var(--primary-text)] bg-[var(--button-background)]/80 hover:brightness-[1.03] border-[length:var(--border-size)] border-[var(--border-color)]",
 ghost: "bg-transparent text-[var(--primary-text)] hover:bg-[var(--button-background)]/40 border-[length:var(--border-size)] border-[var(--border-color)]",
 outline: "bg-transparent border-[length:var(--border-size)] border-[var(--border-color)] text-[var(--primary-text)] hover:bg-[var(--button-background)]/40",
 danger: "text-[#ffffff] bg-[var(--danger)] border-transparent hover:brightness-[1.05] active:scale-[0.985]",
 vip: "px-4 py-2 font-bold rounded-[var(--corner-radius)] bg-[linear-gradient(135deg,var(--home),var(--vip))] text-white shadow-[var(--shadow-size)] transition-transform hover:scale-[1.02]",
 link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto border-0 shadow-none text-[var(--primary-text)]"
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
 {loading && <span className="w-3.5 h-3.5 border-[length:var(--border-size)] border-current border-t-transparent rounded-full animate-spin" />}
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
