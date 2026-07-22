"use client";

import { useState } from "react";
import { useCart } from "@/providers/cart.provider";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShoppingCart, Truck, CreditCard, ArrowLeft, Trash2 } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, count, remove, clear, setQty } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    note: "",
  });

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d]/g, "")) || 0;
    return sum + price * item.qty;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("سبد خرید خالی است");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.postalCode.trim()) {
      toast.error("لطفاً فیلدهای الزامی را پر کنید");
      return;
    }

    setBusy(true);
    try {
      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.slug,
            module: "shop",
            title: item.title,
            image: item.image,
            price: parseFloat(item.price.replace(/[^\d]/g, "")) || 0,
            quantity: item.qty,
          })),
          customer: {
            name: form.name.trim(),
            email: form.email.trim() || undefined,
            phone: form.phone.trim(),
            address: form.address.trim(),
            postalCode: form.postalCode.trim(),
            city: form.city.trim() || undefined,
          },
          note: form.note.trim() || undefined,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "خطا در ثبت سفارش");
      }

      // Try to initiate payment
      try {
        const payRes = await fetch("/api/pay/zarinpal/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.orderId }),
        });

        const payData = await payRes.json();
        if (payRes.ok && payData.gatewayUrl) {
          // Redirect to Zarinpal gateway
          clear();
          window.location.href = payData.gatewayUrl;
          return;
        }
      } catch {
        // Payment not available — order still created
      }

      // If payment not available, go to success page
      clear();
      router.push(`/order/success?id=${orderData.orderNumber}`);
    } catch (err: any) {
      toast.error(err.message || "خطا در ثبت سفارش");
    } finally {
      setBusy(false);
    }
  };

  if (count === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <Card className="p-10 space-y-4">
          <ShoppingCart className="size-16 mx-auto text-muted-foreground/30" />
          <h1 className="text-xl font-bold">سبد خرید خالی است</h1>
          <p className="text-sm text-muted-foreground">محصولاتی که می‌خواهید بخرید را از فروشگاه اضافه کنید.</p>
          <ButtonLink href="/shop" className="mt-4">بازگشت به فروشگاه</ButtonLink>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="size-5" />
          تکمیل خرید
        </h1>
        <Badge variant="secondary">{count.toLocaleString("fa-IR")} محصول</Badge>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Customer Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="size-4" />
                  اطلاعات ارسال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">نام و نام خانوادگی *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="علی محمدی" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">شماره تماس *</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09123456789" dir="ltr" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ایمیل (اختیاری)</Label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">کد پستی *</Label>
                    <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="1234567890" dir="ltr" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">شهر</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="تهران" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">آدرس کامل *</Label>
                  <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="آدرس کامل پستی..." className="min-h-[80px]" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">توضیحات سفارش (اختیاری)</Label>
                  <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="توضیحات اضافی..." className="min-h-[60px]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">خلاصه سفارش</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.slug} className="flex items-center gap-3">
                    {item.image && (
                      <div className="relative size-12 shrink-0 rounded bg-muted overflow-hidden">
                        <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      <div className="text-[10px] text-muted-foreground">{item.price} × {item.qty}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => setQty(item.slug, item.qty - 1)} disabled={item.qty <= 1}>-</Button>
                      <span className="text-xs w-6 text-center">{item.qty}</span>
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => setQty(item.slug, item.qty + 1)}>+</Button>
                      <Button type="button" variant="ghost" size="icon-xs" className="text-destructive ms-1" onClick={() => remove(item.slug)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">جمع</span>
                  <span className="font-bold">{subtotal.toLocaleString("fa-IR")} تومان</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ارسال</span>
                  <span className="text-green-600 font-medium">رایگان</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-bold">قابل پرداخت</span>
                  <span className="font-black text-primary">{subtotal.toLocaleString("fa-IR")} تومان</span>
                </div>

                <Button type="submit" className="w-full gap-2" loading={busy} disabled={busy}>
                  <CreditCard className="size-4" />
                  {busy ? "در حال ثبت..." : "ثبت سفارش و پرداخت"}
                </Button>

                <ButtonLink href="/shop" variant="ghost" className="w-full gap-2" size="sm">
                  <ArrowLeft className="size-3" />
                  بازگشت به فروشگاه
                </ButtonLink>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </main>
  );
}
