import { getModuleItems } from "@/lib/content";
import ShopGridAsync from "@/features/shop/components/ShopGridAsync";
export const metadata = { title: "فروشگاه | تکباکس" };
export default async function ShopPage(){ 
  const items = await getModuleItems("shop");
  return <ShopGridAsync items={items} />;
}