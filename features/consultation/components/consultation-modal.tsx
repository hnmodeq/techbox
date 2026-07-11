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
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName,
          email: phone, // Use phone as contact; contact form requires email
          subject: "درخواست مشاوره زیرساخت",
          message: message || "درخواست مشاوره زیرساخت از فرم مشاوره",
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "خطا در ارسال درخواست. لطفاً دوباره تلاش کنید.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("خطا در اتصال به سرور.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: zIndex.modal }} dir="rtl">
      <OverlayBackdrop onClick={onClose} />
      <Panel className="relative w-full max-w-md space-y-4" style={{ zIndex: zIndex.modalContent }}>
        <div className="flex items-center justify-between">
          <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-[var(--consultation)]">درخواست مشاوره زیرساخت</h3>
          <CloseButton onClick={onClose} label="بستن" />
        </div>

        {status === "success" ? (
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--success)]/30 bg-[var(--success)]/15 p-4 text-center text-[length:var(--paragraph-font-size)] text-[var(--success)]">
            درخواست شما ثبت شد. کارشناسان تکباکس به‌زودی با شما تماس می‌گیرند.
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              className="input"
              placeholder="نام سازمان"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <input
              className="input"
              placeholder="تلفن"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className="input min-h-[110px]"
              placeholder="نیاز شما؟ سرور، شبکه، ذخیره‌سازی…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {status === "error" && (
              <p className="text-[length:var(--paragraph-font-size)] text-[var(--danger)]">{errorMsg}</p>
            )}
            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? "در حال ارسال..." : "ارسال درخواست"}
            </Button>
          </form>
        )}
      </Panel>
    </div>
  );
}
