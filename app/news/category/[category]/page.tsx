import { ModuleListingPage, moduleListingMetadata } from "@/components/seo/ModuleListingPage";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  return moduleListingMetadata({ module: "news", type: "category", value: decodeURIComponent(category) });
}

export default async function NewsCategoryPage({ params }: Props) {
  const { category } = await params;
  return <ModuleListingPage module="news" type="category" value={decodeURIComponent(category)} />;
}
