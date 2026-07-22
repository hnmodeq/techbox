"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FormField, FormControl, FormItem, FormLabel, FormDescription } from "@/components/ui/form";

type CurrencyRates = {
  USD: number;
  EUR: number;
  AED: number;
  global: number;
};

export function ShopPricingFields({
  control,
  sourcePriceAmount,
  sourceCurrency,
  priceAdjustmentPercent,
  sellerBenefitPercent,
  currencyRates,
}: {
  control: any;
  sourcePriceAmount: string;
  sourceCurrency: string;
  priceAdjustmentPercent: string;
  sellerBenefitPercent: string;
  currencyRates: CurrencyRates;
}) {
  const src = parseFloat(sourcePriceAmount || "0");
  const curr = sourceCurrency || "USD";
  const prodAdj = parseFloat(priceAdjustmentPercent || "0");
  const sellerBenefit = parseFloat(sellerBenefitPercent || "35");
  const rate = curr === "EUR" ? currencyRates.EUR : curr === "AED" ? currencyRates.AED : currencyRates.USD;
  const base = src * rate;
  const afterGlobal = base * (1 + currencyRates.global / 100);
  const afterProduct = afterGlobal * (1 + prodAdj / 100);
  const final = afterProduct * (1 + sellerBenefit / 100);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold mb-1">قیمت‌گذاری دو مرحله‌ای (ارز مبدا → تومان)</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          قیمت مبدا (USD/EUR/AED) فقط در ادمین قابل مشاهده است. قیمت نهایی تومان = قیمت مبدا × نرخ روز ارز × (1+تعدیل جهانی%) × (1+تعدیل محصول%). نرخ ارز و تعدیل جهانی در صفحه تنظیمات سایت مدیریت می‌شود.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <FormField control={control} name="sourcePriceAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت مبدا (پنهان – فقط ادمین)</FormLabel>
              <FormControl><Input type="number" dir="ltr" placeholder="1000" {...field} /></FormControl>
              <FormDescription className="text-[11px]">مثلاً 1000 دلار – از QNAP پر شده</FormDescription>
            </FormItem>
          )} />
          <FormField control={control} name="sourceCurrency" render={({ field }) => (
            <FormItem>
              <FormLabel>واحد ارز مبدا</FormLabel>
              <Select value={field.value || "USD"} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD – دلار آمریکا (پیش‌فرض)</SelectItem>
                  <SelectItem value="EUR">EUR – یورو</SelectItem>
                  <SelectItem value="AED">AED – درهم امارات</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-[11px]">پیش‌فرض USD، در صورت یورو/درهم تغییر دهید</FormDescription>
            </FormItem>
          )} />
          <FormField control={control} name="priceAdjustmentPercent" render={({ field }) => (
            <FormItem>
              <FormLabel>تعدیل این محصول (%) – {field.value || "0"}%</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]">-۵۰٪</span>
                  <input type="range" min={-50} max={100} step={1} value={parseFloat(field.value || "0")} onChange={(e) => field.onChange(e.target.value)} className="flex-1" />
                  <span className="text-[10px]">+۱۰۰٪</span>
                </div>
              </FormControl>
              <FormDescription className="text-[11px]">افزایش/کاهش قیمت فقط این محصول نسبت به نرخ محاسبه شده</FormDescription>
            </FormItem>
          )} />
          <FormField control={control} name="sellerBenefitPercent" render={({ field }) => (
            <FormItem>
              <FormLabel>سود فروشنده (سود شرکت) (%) – {field.value || "35"}%</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]">۰٪</span>
                  <input type="range" min={0} max={100} step={1} value={parseFloat(field.value || "35")} onChange={(e) => field.onChange(e.target.value)} className="flex-1" />
                  <span className="text-[10px]">۱۰۰٪</span>
                </div>
              </FormControl>
              <FormDescription className="text-[11px]">سود فروشنده بر اساس قیمت نهایی محاسبه شده (پیش‌فرض ۳۵٪)</FormDescription>
            </FormItem>
          )} />
        </div>
        <div className="mt-3 rounded-md bg-muted/40 p-3 text-[11px] leading-5 space-y-2">
          <p className="font-bold">محاسبه زنده نهایی تومان (قابل مشاهده در فرانت):</p>
          <p dir="ltr" className="font-mono text-[11px]">Final = Source × Rate × (1+Global%) × (1+Product%) × (1+SellerBenefit%)</p>
          {src ? (
            <div className="space-y-1">
              <p>نرخ {curr}: {rate.toLocaleString("fa-IR")} تومان (از تنظیمات → قیمت و ارز)</p>
              <p>پایه: {src.toLocaleString("fa-IR")} {curr} × {rate.toLocaleString("fa-IR")} = {base.toLocaleString("fa-IR")} تومان</p>
              <p>پس از تعدیل جهانی {currencyRates.global}%: {afterGlobal.toLocaleString("fa-IR")} تومان</p>
              <p>پس از تعدیل محصول {prodAdj}%: {afterProduct.toLocaleString("fa-IR")} تومان</p>
              <p>پس از سود فروشنده {sellerBenefit}%: {final.toLocaleString("fa-IR")} تومان</p>
              <p className="font-bold text-[12px] text-primary">قیمت نهایی نمایش به کاربر: {final.toLocaleString("fa-IR")} تومان</p>
            </div>
          ) : (
            <p className="text-muted-foreground">قیمت مبدا را وارد کنید تا قیمت نهایی محاسبه شود</p>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold mb-3">قیمت نهایی و تخفیف (قابل override دستی)</p>
        <div className="grid gap-3 md:grid-cols-3">
          <FormField control={control} name="priceAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت نهایی دستی (تومان) – اختیاری</FormLabel>
              <FormControl><Input type="number" dir="ltr" placeholder="مثلاً 189000000 (خالی = محاسبه خودکار)" {...field} /></FormControl>
              <FormDescription className="text-[11px]">اگر خالی باشد، از فرمول بالا محاسبه می‌شود. اگر پر کنید، override می‌شود.</FormDescription>
            </FormItem>
          )} />
          <FormField control={control} name="discountPercent" render={({ field }) => (
            <FormItem>
              <FormLabel>درصد تخفیف (۰-۹۹)</FormLabel>
              <FormControl><Input type="number" min="0" max="99" dir="ltr" placeholder="15" {...field} /></FormControl>
            </FormItem>
          )} />
          <FormField control={control} name="discountEndsAt" render={({ field }) => (
            <FormItem>
              <FormLabel>پایان تخفیف</FormLabel>
              <FormControl><Input type="datetime-local" dir="ltr" {...field} /></FormControl>
            </FormItem>
          )} />
        </div>
      </div>
    </div>
  );
}
