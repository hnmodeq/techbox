import { ModuleListingPage, moduleListingMetadata } from "@/components/seo/ModuleListingPage";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return moduleListingMetadata({ module: "blog", type: "tag", value: decodeURIComponent(tag) });
}

export default async function BlogTagPage({ params }: Props) {
  const { tag } = await params;
  return <ModuleListingPage module="blog" type="tag" value={decodeURIComponent(tag)} />;
}
