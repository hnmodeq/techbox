import { modulePageMetadata } from "@/lib/seo";
import ShopGrid from "@/features/shop/components/ShopGrid";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata("shop", "فروشگاه و مشاوره خرید تجهیزات زیرساخت، شبکه، سرور، ذخیره‌سازی و امنیت.");

export const revalidate = 60;

export default async function ShopPage() {
  const dbItems = await getDbModulePosts("shop", 60);
  return <ShopGrid serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
