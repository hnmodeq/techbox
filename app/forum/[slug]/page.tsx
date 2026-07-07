import { getBySlug, getModuleItems } from "@/lib/content";
import ForumDetail from "@/features/forum/components/ForumDetail";

type P = Promise<{ slug: string }>;

export const dynamicParams = true;

export async function generateStaticParams() {
  return getModuleItems("forum").map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const initialItem = getBySlug("forum", slug);
  return <ForumDetail slug={slug} initialItem={initialItem} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = getBySlug("forum", slug);
  return { title: item ? `${item.title} | انجمن تکباکس` : "موضوع انجمن | تکباکس" };
}
