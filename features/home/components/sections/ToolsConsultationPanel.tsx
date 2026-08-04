"use client";

import { MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToolsConsultationPanel() {
  const openConsultation = () => {
    window.dispatchEvent(new CustomEvent("tb_open_support"));
  };

  return (
    <div className="grid gap-5 border border-red-500/25 bg-red-500/[0.04] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <MessageSquareText className="size-5" />
          <h3 className="text-lg font-black">ابزارها کافی نبود؟ با متخصص مشورت کنید</h3>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          مسئله زیرساختی شما را در قالب یک گفت‌وگوی قابل پیگیری ثبت می‌کنیم؛ پاسخ‌ها، فایل مسئله و ادامه مکالمه در همان درخواست مشاوره باقی می‌ماند.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-red-500" /> بررسی توسط تیم فنی</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-red-500" /> گفت‌وگوی امن و قابل پیگیری</span>
        </div>
      </div>
      <Button
        type="button"
        size="xl"
        onClick={openConsultation}
        className="w-full bg-red-600 px-6 font-bold text-white hover:bg-red-700 lg:w-auto"
      >
        درخواست مشاوره
      </Button>
    </div>
  );
}

export default ToolsConsultationPanel;
