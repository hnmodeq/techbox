"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, CreditCard, Package, RefreshCw, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TechboxLoader } from "@/components/ui/techbox-loader";

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

type OrderInfo = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: Array<{ title: string; slug: string; quantity: number; price: number }>;
  total: number;
  paymentReference?: string | null;
};

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; Icon: React.ElementType }[] = [
  { key: "pending", label: "در انتظار پرداخت", desc: "سفارش ثبت شده و منتظر تکمیل پرداخت است.", Icon: Clock },
  { key: "paid", label: "پرداخت تأیید شد", desc: "درگاه پرداخت، تراکنش سفارش را تأیید کرده است.", Icon: CheckCircle },
  { key: "processing", label: "در حال آماده‌سازی", desc: "تیم فروش موجودی را نهایی و سفارش را آماده می‌کند.", Icon: Package },
  { key: "shipped", label: "ارسال شد", desc: "سفارش تحویل شرکت حمل‌ونقل شده است.", Icon: Truck },
  { key: "delivered", label: "تحویل داده شد", desc: "سفارش با موفقیت به مشتری تحویل شده است.", Icon: CheckCircle },
];

export default function OrderTrackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "";
  const accessToken = searchParams.get("token") || "";
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError("شناسه سفارش یافت نشد.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ id: orderId });
      if (accessToken) query.set("token", accessToken);
      const response = await fetch(`/api/orders?${query.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 403 ? "دسترسی به این سفارش تأیید نشد." : "سفارش یافت نشد.");
      setOrder(await response.json());
    } catch (requestError: any) {
      setOrder(null);
      setError(requestError?.message || "دریافت سفارش انجام نشد.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const retryPayment = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const response = await fetch("/api/pay/zarinpal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderNumber, accessToken: accessToken || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.gatewayUrl) throw new Error(data.message || "اتصال به درگاه انجام نشد.");
      window.location.assign(data.gatewayUrl);
    } catch (paymentError: any) {
      toast.error(paymentError?.message || "شروع پرداخت انجام نشد.");
      setPaying(false);
    }
  };

  if (loading) return <TechboxLoader fullPage label="در حال بارگذاری اطلاعات سفارش" />;

  if (error || !order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <div className="space-y-4 rounded-xl border border-border bg-card p-10">
          <Package className="mx-auto size-16 text-muted-foreground/30" />
          <h1 className="text-[20px] font-bold">سفارش در دسترس نیست</h1>
          <p className="text-[13px] text-muted-foreground">{error || "لطفاً شناسه سفارش را بررسی کنید."}</p>
          <Link href="/shop/storage"><Button className="mt-2">بازگشت به فروشگاه</Button></Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === order.status);
  const terminalProblem = order.status === "cancelled" || order.status === "refunded";

  return (
    <main className="mx-auto max-w-3xl px-3 py-6 sm:px-4" dir="rtl">
      <nav className="mb-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">خانه</Link><span>/</span><span className="text-foreground">پیگیری سفارش</span>
      </nav>

      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-black">پیگیری سفارش</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">
              شناسه: <span className="font-mono font-bold text-foreground" dir="ltr">{order.orderNumber}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadOrder} className="gap-1 text-[12px]">
            <RefreshCw className="size-3.5" />به‌روزرسانی
          </Button>
        </div>

        {terminalProblem && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
            <div>
              <p className="font-bold">{order.status === "refunded" ? "مبلغ سفارش بازپرداخت شده است." : "سفارش لغو شده است."}</p>
              <p className="mt-1 text-xs text-muted-foreground">برای اطلاعات بیشتر با پشتیبانی تکباکس تماس بگیرید.</p>
            </div>
          </div>
        )}

        {!terminalProblem && (
          <div className="space-y-0">
            {STATUS_STEPS.map((step, index) => {
              const active = index === currentStepIndex;
              const completed = index < currentStepIndex;
              const pending = index > currentStepIndex;
              const Icon = step.Icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      completed && "border-emerald-500 bg-emerald-500 text-white",
                      active && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                      pending && "border-border bg-muted text-muted-foreground"
                    )}>
                      <Icon className="size-5" />
                    </div>
                    {index < STATUS_STEPS.length - 1 && <div className={cn("my-1 h-12 w-0.5", completed ? "bg-emerald-500" : "bg-border")} />}
                  </div>
                  <div className={cn("pb-6", active && "pb-8")}>
                    <h3 className={cn("text-[14px] font-bold", completed && "text-emerald-600", active && "text-primary", pending && "text-muted-foreground")}>
                      {step.label}
                      {active && <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">مرحله فعلی</span>}
                    </h3>
                    <p className={cn("mt-1 text-[12px] leading-5", pending ? "text-muted-foreground/60" : "text-muted-foreground")}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-[14px] font-bold">جزئیات سفارش</h3>
          {order.items.map((item) => (
            <div key={item.slug} className="flex items-center justify-between gap-3 py-1 text-[12px]">
              <span>{item.title} × {item.quantity.toLocaleString("fa-IR")}</span>
              <span>{(item.price * item.quantity).toLocaleString("fa-IR")} تومان</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 text-[13px] font-bold">
            <span>مبلغ کل</span><span>{order.total.toLocaleString("fa-IR")} تومان</span>
          </div>
          {order.paymentReference && <p className="text-[11px] text-muted-foreground">کد پیگیری پرداخت: {order.paymentReference}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {order.status === "pending" && (
            <Button onClick={retryPayment} loading={paying} disabled={paying} className="gap-2">
              <CreditCard className="size-4" />تکمیل پرداخت
            </Button>
          )}
          <Link href="/shop/storage"><Button variant="outline" size="sm">بازگشت به فروشگاه</Button></Link>
        </div>
      </div>
    </main>
  );
}
