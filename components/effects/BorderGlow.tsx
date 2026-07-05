"use client";

import React from "react";

interface BorderGlowProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const BorderGlow: React.FC<BorderGlowProps> = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

export default BorderGlow;
