import { getBySlug, getModuleItems } from "@/lib/content";
import { getDbPost } from "@/lib/server-post";
import DbContentDetail from "@/features/content/components/DbContentDetail";

export const dynamicParams = true;

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 return [];
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "media" as any;
 const item = getBySlug(mod, slug);
 return <DbContentDetail module="media" slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const item = await getDbPost("media", slug);
 return { title: item ? `${item.title} | رسانه تکباکس` : "رسانه تکباکس" };
}
