"use client";

import { useState } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { OverlayBackdrop } from "@/components/ui/Overlay";
import { Panel } from "@/components/ui/Panel";

type ConsultationModalProps = {
 open: boolean;
 onClose: () => void;
};

export default function ConsultationModal({ open, onClose }: ConsultationModalProps) {
 const [sent, setSent] = useState(false);

 if (!open) return null;

 return (
 <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: zIndex.modal }} dir="rtl">
 <OverlayBackdrop onClick={onClose} />
 <Panel className="relative w-full max-w-md space-y-4" style={{ zIndex: zIndex.modalContent }}>
 <div className="flex items-center justify-between">
 <h3 className="tb-text-md text-[var(--tb-consultation)]">درخواست مشاوره زیرساخت</h3>
 <CloseButton onClick={onClose} label="بستن" />
 </div>

 {sent ? (
 <div className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] p-4 text-center tb-text-sm text-[var(--tb-fg-muted)]">
 درخواست شما ثبت شد. کارشناسان تکباکس به‌زودی با شما تماس می‌گیرند.
 </div>
 ) : (
 <form
 className="space-y-3"
 onSubmit={(e) => {
 e.preventDefault();
 setSent(true);
 }}
 >
 <input className="input" placeholder="نام سازمان" required />
 <input className="input" placeholder="تلفن" required />
 <textarea className="input min-h-[110px]" placeholder="نیاز شما؟ سرور، شبکه، ذخیره‌سازی…" />
 <Button type="submit" className="w-full">ارسال درخواست</Button>
 </form>
 )}
 </Panel>
 </div>
 );
}
