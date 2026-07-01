"use client";
import * as React from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "@/lib/utils";

export function IconButton({ size="icon", variant="ghost", className, ...props }: ButtonProps){
 return <Button size={size} variant={variant} className={cn("shrink-0", className)} {...props} />;
}
export default IconButton;
