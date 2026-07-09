"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center" dir="rtl">
      <div className="bg-red-500/10 p-4 rounded-full mb-6">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold mb-2">خطایی رخ داده است</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        متأسفانه در اجرای این بخش مشکلی پیش آمده. خطا به صورت خودکار ثبت شد و تیم فنی در حال بررسی آن است.
      </p>
      
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary">تلاش مجدد</Button>
        <Button onClick={() => window.location.href = "/"} variant="ghost">بازگشت به خانه</Button>
      </div>
      
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-8 p-4 bg-black/50 rounded-lg text-left text-xs text-red-400 overflow-auto max-w-full" dir="ltr">
          {error.message}
          {"\n"}
          {error.stack}
        </pre>
      )}
    </main>
  );
}
