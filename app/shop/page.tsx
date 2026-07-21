import { modulePageMetadata } from "@/lib/seo";
import ShopGrid from "@/features/shop/components/ShopGrid";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata("shop", "فروشگاه تجهیزات زیرساخت IT — سرور، شبکه، ذخیره‌سازی، امنیت.");

export default async function ShopPage() {
  const dbItems = await getDbModulePosts("shop", 200);
  return <ShopGrid serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
