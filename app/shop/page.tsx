import { modulePageMetadata } from "@/lib/seo";
import ShopGrid from "@/features/shop/components/ShopGrid";
export const metadata = modulePageMetadata("shop", "فروشگاه و مشاوره خرید تجهیزات زیرساخت، شبکه، سرور، ذخیره‌سازی و امنیت.");
export default function ShopPage(){ return <ShopGrid />; }
