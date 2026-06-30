"use client";

import * as React from "react";
import { zIndex } from "@/design";

type Props = {
  label: string;
  enabled: boolean;
  children: React.ReactNode;
  tooltipClassName?: string;
};

type Position = {
  right: number;
  top: number;
};

export default function SidebarTooltip({
  label,
  enabled,
  children,
  tooltipClassName = "",
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState<Position | null>(null);
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);

  const updatePosition = React.useCallback(() => {
    if (!enabled || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      right: window.innerWidth - rect.left + 12,
      top: rect.top + rect.height / 2,
    });
  }, [enabled]);

  const show = React.useCallback(() => {
    if (!enabled) return;
    updatePosition();
    setVisible(true);
  }, [enabled, updatePosition]);

  const hide = React.useCallback(() => {
    setVisible(false);
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    const handle = () => updatePosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [visible, updatePosition]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {visible && pos && (
        <span
          role="tooltip"
          className={`pointer-events-none fixed whitespace-nowrap rounded-md bg-popover px-2.5 py-1.5 text-xs font-medium shadow-md ring-1 ring-border/40 animate-in fade-in-0 zoom-in-95 duration-150 ${tooltipClassName}`}
          style={{
            right: pos.right,
            top: pos.top,
            zIndex: zIndex.tooltip,
            transform: "translateY(-50%)",
          }}
        >
          {label}
        </span>
      )}
    </>
  );
}
