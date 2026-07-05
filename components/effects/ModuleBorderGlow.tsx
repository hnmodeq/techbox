"use client";

import React from "react";

type ModuleBorderGlowProps = {
  children: React.ReactNode;
  moduleColor?: string;
  className?: string;
};

export default function ModuleBorderGlow({ children, className = "" }: ModuleBorderGlowProps) {
  return (
    <div
      className={`card bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] transition-all ${className}`}
    >
      {children}
    </div>
  );
}
