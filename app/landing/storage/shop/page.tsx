import type { Metadata } from "next";
import { getDbModulePosts } from "@/lib/server-posts";
import ShopGrid from "@/features/shop/components/ShopGrid";

export const metadata: Metadata = {
  title: "فروشگاه ذخیره‌ساز سازمانی | تکباکس",
  description: "۱۴۴ مدل QNAP واقعی با قیمت دلاری و تبدیل لحظه‌ای به تومان – فیلتر Bay، CPU، RAM، 10GbE",
};

export default async function StorageShopPage() {
  const all = await getDbModulePosts("shop", 200);
  // Filter NAS related for landing shop
  const nas = all.filter((p) => {
    const brand = (p.brand || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const specs = (p.specs as any) || {};
    const hasBay = !!(specs["Drive Bay"] || specs["Bay"]);
    return brand.includes("qnap") || brand.includes("synology") || cat.includes("nas") || hasBay;
  });

  return (
    <main className="mx-auto max-w-[1920px] px-0 lg:px-4 py-4" dir="rtl">
      <ShopGrid serverItems={nas.length > 0 ? nas : undefined} />
    </main>
  );
}
