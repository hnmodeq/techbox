import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "فروشگاه ذخیره‌ساز سازمانی | تکباکس",
  description: "این نشانی به فروشگاه ذخیره‌ساز تکباکس منتقل شده است.",
  path: "/landing/storage/shop",
  noIndex: true,
});

/** Preserve every legacy bookmark while making /shop/storage canonical. */
export default function LegacyStorageShopPage() {
  redirect("/shop/storage");
}
