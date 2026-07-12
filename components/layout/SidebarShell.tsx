"use client";

import { useRef, useState } from "react";
import SidebarContent from "@/components/layout/SidebarContent";
import { sidebarBase } from "@/config/sidebar.config";
import { SidebarShellProps } from "@/types/sidebar.types";
import { useFabTop, saveFabTop } from "@/hooks/useFabTop";
import { zIndex } from "@/design";

const DRAG_THRESHOLD = 15;
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
 const lastOpenRef = useRef(0);

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
 e.preventDefault();
 e.stopPropagation();
 if (movedRef.current) return;
 if (Date.now() - lastOpenRef.current < 450) return;
 lastOpenRef.current = Date.now();
 onToggleMobile();
 };

 return (
 <>
 {!mobileOpen && (
   <button
     ref={btnRef}
     type="button"
     onClick={() => {
       lastOpenRef.current = Date.now();
       onToggleMobile();
     }}
     style={{ top: `${btnTop}px`, zIndex: zIndex.mobileFab }}
     className="fixed right-0 select-none rounded-l-full sm:hidden transition-all duration-[300ms] shadow-[var(--shadow-size)] cursor-pointer"
     aria-label="باز کردن منو"
   >
     <div className="relative flex h-16 w-16 items-center justify-center rounded-l-full border-[length:var(--border-size)] border-r-0 border-[var(--border-color)] bg-[var(--card-background)]/95 bg-[url('/logo.png')] bg-[length:48px_48px] bg-center bg-no-repeat shadow-[var(--shadow-size)] backdrop-blur-md" />
   </button>
 )}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden"
          style={{ zIndex: zIndex.sidebarBackdrop }}
          onClick={() => {
            if (Date.now() - lastOpenRef.current < 400) return;
            onCloseMobile();
          }}
        />
      )}

      <aside
        className={`fixed right-0 top-0 h-full transition-transform duration-[300ms] sm:hidden ${MOBILE_SIDEBAR_WIDTH} ${sidebarBase}`}
        aria-hidden={!mobileOpen}
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          zIndex: zIndex.sidebar
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <SidebarContent
          expanded
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogoClick={onCloseMobile}
          onLinkClick={onCloseMobile}
        />
      </aside>

 <div
 className={`main-sidebar-spacer hidden shrink-0 sm:block transition-[width] duration-[300ms] ease-[ease] ${
 desktopOpen
 ? DESKTOP_SIDEBAR_OPEN_WIDTH
 : DESKTOP_SIDEBAR_CLOSED_WIDTH
 }`}
 aria-hidden="true"
 />

 <aside
 className={`main-sidebar-panel fixed right-0 top-0 hidden h-screen flex-col overflow-hidden sm:flex transition-[width] duration-[300ms] ease-[ease] ${
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
