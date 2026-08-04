import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "فروشگاه تجهیزات زیرساخت | تکباکس",
  description: "خرید آنلاین ذخیره‌ساز، NAS و تجهیزات تخصصی زیرساخت با پرداخت امن.",
  path: "/shop",
});

export default function ShopPage() {
  redirect("/shop/storage");
}
