"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8" dir="rtl">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">مشکلی پیش آمد</h2>
            <p className="mb-6 text-muted-foreground">
              متأسفانه خطایی رخ داده است. تیم ما از این مشکل مطلع شد.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
