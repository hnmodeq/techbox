"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart.provider";
import { AlertTriangle, CheckCircle, Package, RefreshCw, Truck } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("id") || "";
  const accessToken = searchParams.get("token") || "";
  const error = searchParams.get("error");
  const cancelled = searchParams.get("cancelled") === "true";
  const { clear } = useCart();
  const succeeded = Boolean(orderNumber && !error && !cancelled);

  useEffect(() => {
    if (succeeded) clear();
  }, [clear, succeeded]);

  const trackHref = orderNumber
    ? `/order/track?id=${encodeURIComponent(orderNumber)}${accessToken ? `&token=${encodeURIComponent(accessToken)}` : ""}`
    : "/order/track";

  if (!succeeded) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <div className="space-y-6 rounded-xl border border-border bg-card p-10">
          <AlertTriangle className="mx-auto size-20 text-amber-500" />
          <h1 className="text-[24px] font-black">
            {cancelled ? "پرداخت لغو شد" : "پرداخت تکمیل نشد"}
          </h1>
          <p className="text-[14px] leading-7 text-muted-foreground">
            {cancelled
              ? "سفارش شما محفوظ است و مبلغی کسر نشده. می‌توانید دوباره برای پرداخت تلاش کنید."
              : "تأیید پرداخت انجام نشد. اگر مبلغی از حساب شما کسر شده است، پیش از تلاش دوباره با پشتیبانی تماس بگیرید."}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            {orderNumber && (
              <Link href={trackHref}>
                <Button size="lg" className="gap-2">
                  <Truck className="size-4" />
                  مشاهده سفارش
                </Button>
              </Link>
            )}
            <Link href="/shop/checkout">
              <Button variant="outline" size="lg" className="gap-2">
                <RefreshCw className="size-4" />
                بازگشت به پرداخت
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
      <div className="space-y-6 rounded-xl border border-border bg-card p-10">
        <CheckCircle className="mx-auto size-20 text-emerald-500" />
        <h1 className="text-[24px] font-black">پرداخت با موفقیت تأیید شد</h1>
        <p className="text-[14px] leading-7 text-muted-foreground">
          سفارش شما با شناسه <b className="text-foreground" dir="ltr">{orderNumber}</b> ثبت و پرداخت شد.
          <br />
          تیم تکباکس سفارش را برای ارسال آماده خواهد کرد.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
          <Link href={trackHref}>
            <Button size="lg" className="gap-2">
              <Truck className="size-4" />
              پیگیری سفارش
            </Button>
          </Link>
          <Link href="/shop/storage">
            <Button variant="outline" size="lg" className="gap-2">
              <Package className="size-4" />
              ادامه خرید
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
