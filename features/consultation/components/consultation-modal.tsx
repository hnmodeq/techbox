"use client";

import { useState } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import { OverlayBackdrop } from "@/components/ui/overlay";
import { Panel } from "@/components/ui/panel";

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
 <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-[var(--consultation)]">درخواست مشاوره زیرساخت</h3>
 <CloseButton onClick={onClose} label="بستن" />
 </div>

 {sent ? (
 <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] p-4 text-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
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
