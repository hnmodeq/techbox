"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import SidebarContent from "@/components/layout/SidebarContent";
import { sidebarBase } from "@/config/sidebar.config";
import { SidebarShellProps } from "@/types/sidebar.types";
import { useFabTop, saveFabTop } from "@/hooks/useFabTop";
import { zIndex } from "@/design";
import { Overlay } from "@/components/ui/Overlay";

const DRAG_THRESHOLD = 6;
const BTN_SIZE = 72;
const SAFE_MARGIN = 16;

const MOBILE_SIDEBAR_WIDTH = "w-72";
const MOBILE_FAB_OPEN_RIGHT = "right-72";

const DESKTOP_SIDEBAR_OPEN_WIDTH = "w-64";
const DESKTOP_SIDEBAR_CLOSED_WIDTH = "w-16";

export default function SidebarShell({
 mobileOpen,
 desktopOpen,
 theme,
 onToggleTheme,
 onToggleMobile,
 onCloseMobile,
 onToggleDesktop,
}: SidebarShellProps) {
 const btnRef = useRef<HTMLButtonElement | null>(null);
 const [dragging, setDragging] = useState(false);
 const pointerStartYRef = useRef(0);
 const topStartRef = useRef(0);
 const movedRef = useRef(false);

 const storedTop = useFabTop();
 const [dragTop, setDragTop] = useState<number | null>(null);
 const btnTop = dragTop ?? storedTop;

 const getBtnHeight = () => btnRef.current?.offsetHeight ?? BTN_SIZE;

 const clampTopByHeight = (top: number, btnH: number) => {
 const minTop = SAFE_MARGIN;
 const maxTop = window.innerHeight - btnH - SAFE_MARGIN;
 if (maxTop <= minTop) return (window.innerHeight - btnH) / 2;
 return Math.min(Math.max(minTop, top), maxTop);
 };

 const clampTop = (top: number) => clampTopByHeight(top, getBtnHeight());

 const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
 pointerStartYRef.current = e.clientY;
 topStartRef.current = btnTop;
 movedRef.current = false;
 setDragging(true);
 setDragTop(btnTop);
 e.currentTarget.setPointerCapture(e.pointerId);
 };

 const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
 if (!dragging) return;
 const deltaY = e.clientY - pointerStartYRef.current;
 if (!movedRef.current && Math.abs(deltaY) >= DRAG_THRESHOLD) {
 movedRef.current = true;
 }
 setDragTop(clampTop(topStartRef.current + deltaY));
 };

 const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
 if (!dragging) return;
 setDragging(false);
 if (dragTop !== null) {
 saveFabTop(dragTop);
 setDragTop(null);
 }
 try {
 e.currentTarget.releasePointerCapture(e.pointerId);
 } catch {}
 };

 const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
 if (movedRef.current) {
 e.preventDefault();
 e.stopPropagation();
 return;
 }
 onToggleMobile();
 };

 return (
 <>
 <button
 ref={btnRef}
 type="button"
 onClick={handleClick}
 onPointerDown={handlePointerDown}
 onPointerMove={handlePointerMove}
 onPointerUp={endDrag}
 onPointerCancel={endDrag}
 style={{ top: `${btnTop}px`, touchAction: "none", zIndex: zIndex.mobileFab }}
 className={`fixed select-none rounded-full sm:hidden
 transition-[right] duration-[var(--tb-motion-lg)] translate-x-1/2
 ${mobileOpen ? MOBILE_FAB_OPEN_RIGHT : "right-0"}
 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
 aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
 >
 <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/90 shadow-[var(--tb-shadow-lg)] backdrop-blur-[var(--tb-blur-md)]">
 <Image
 src="/logo.png"
 alt="لوگو تکباکس"
 fill
 priority
 sizes="72px"
 draggable={false}
 onDragStart={(e) => e.preventDefault()}
 className="pointer-events-none rounded-full object-contain p-2"
 />
 </div>
 </button>

 {mobileOpen && (
 <Overlay
 layer="sidebarBackdrop"
 className="sm:hidden"
 onClick={onCloseMobile}
 />
 )}

 <aside
 className={`fixed right-0 top-0 h-full transform transition-transform duration-[var(--tb-motion-lg)] sm:hidden ${MOBILE_SIDEBAR_WIDTH} ${sidebarBase} ${
 mobileOpen ? "translate-x-0" : "translate-x-full"
 }`}
 aria-hidden={!mobileOpen}
 style={{ zIndex: zIndex.sidebar }}
 >
 <SidebarContent
 expanded
 theme={theme}
 onToggleTheme={onToggleTheme}
 onLinkClick={onCloseMobile}
 />
 </aside>

 <div
 className={`hidden shrink-0 sm:block transition-[width] duration-[var(--tb-motion-lg)] ease-[var(--tb-ease)] ${
 desktopOpen
 ? DESKTOP_SIDEBAR_OPEN_WIDTH
 : DESKTOP_SIDEBAR_CLOSED_WIDTH
 }`}
 aria-hidden="true"
 />

 <aside
 className={`fixed right-0 top-0 hidden h-screen flex-col overflow-hidden sm:flex transition-[width] duration-[var(--tb-motion-lg)] ease-[var(--tb-ease)] ${
 desktopOpen
 ? DESKTOP_SIDEBAR_OPEN_WIDTH
 : DESKTOP_SIDEBAR_CLOSED_WIDTH
 } ${sidebarBase}`}
 >
 <SidebarContent
 expanded={desktopOpen}
 theme={theme}
 onToggleTheme={onToggleTheme}
 onLogoClick={onToggleDesktop}
 />
 </aside>
 </>
 );
}
