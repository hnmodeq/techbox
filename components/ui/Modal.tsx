"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { zIndex } from "@/design";
import { OverlayBackdrop } from "./Overlay";
import { Panel } from "./Panel";
export function Modal({ open, onClose, children, className }: { open: boolean; onClose: ()=>void; children: React.ReactNode; className?: string }){
 if(!open) return null;
 return (
 <div className="fixed inset-0 flex items-center justify-center p-4" dir="rtl" style={{zIndex:zIndex.modal}}>
 <OverlayBackdrop onClick={onClose} />
 <Panel className={cn("relative w-full max-w-lg max-h-[85vh] overflow-auto", className)} style={{zIndex:zIndex.modalContent}}>{children}</Panel>
 </div>
 );
}
export default Modal;
