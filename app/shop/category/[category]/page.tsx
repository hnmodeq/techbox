import { ModuleListingPage, moduleListingMetadata } from "@/components/seo/ModuleListingPage";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  return moduleListingMetadata({ module: "shop", type: "category", value: decodeURIComponent(category) });
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  return <ModuleListingPage module="shop" type="category" value={decodeURIComponent(category)} />;
}
