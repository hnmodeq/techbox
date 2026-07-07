import { getBySlug, getModuleItems } from "@/lib/content";
import DbContentDetail from "@/features/content/components/DbContentDetail";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 const mod = "shop" as any;
 return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "shop" as any;
 const item = getBySlug(mod, slug);
 return <DbContentDetail module="shop" slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "shop" as any;
 const item = getBySlug(mod, slug);
 return { title: item ? `${item.title} | تکباکس`: "یافت نشد" };
}
