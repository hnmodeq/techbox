"use client";
import * as React from "react";
import { X } from "lucide-react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "@/lib/utils";

export interface CloseButtonProps extends Omit<ButtonProps, "children" | "variant" | "size"> {
 label?: string;
 icon?: React.ReactNode;
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
 ({ className, label = "بستن", icon, ...props }, ref) => (
 <Button
 ref={ref}
 type="button"
 variant="ghost"
 size="iconSm"
 aria-label={label}
 className={cn("text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]", className)}
 {...props}
 >
 {icon ?? <X size={14} aria-hidden />}
 </Button>
 )
);
CloseButton.displayName = "CloseButton";
export default CloseButton;
