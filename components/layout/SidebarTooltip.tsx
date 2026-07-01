"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
 const [mounted, setMounted] = React.useState(false);
 const triggerRef = React.useRef<HTMLSpanElement | null>(null);

 React.useEffect(() => {
 setMounted(true);
 }, []);

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
 {mounted && visible && pos && createPortal(
 <span
 role="tooltip"
 className={`pointer-events-none fixed whitespace-nowrap rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] px-2.5 py-1.5 tb-text-sm shadow-[var(--tb-shadow-md)] animate-in fade-in-0 zoom-in-95 duration-[var(--tb-motion-sm)] ${tooltipClassName}`}
 style={{
 right: pos.right,
 top: pos.top,
 zIndex: zIndex.tooltip,
 transform: "translateY(-50%)",
 }}
 >
 {label}
 </span>,
 document.body
 )}
 </>
 );
}
