"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: ReactNode;
  colors: string[];
  animationSpeed?: number;
  direction?: "horizontal" | "vertical";
  showBorder?: boolean;
  className?: string;
};

export default function GradientText({
  children,
  colors,
  animationSpeed = 6,
  direction = "horizontal",
  showBorder = false,
  className,
}: GradientTextProps) {
  const gradient = `linear-gradient(${direction === "horizontal" ? "90deg" : "180deg"}, ${colors.join(", ")})`;
  return (
    <span className={cn("relative inline-flex", showBorder && "rounded-[var(--tb-radius-xl)] p-[1px]")}> 
      {showBorder && <span className="absolute inset-0 rounded-[inherit]" style={{ background: gradient }} aria-hidden="true" />}
      <motion.span
        className={cn("relative inline-block bg-clip-text text-transparent", className)}
        style={{ backgroundImage: gradient, backgroundSize: "300% 100%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: animationSpeed, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.span>
    </span>
  );
}
