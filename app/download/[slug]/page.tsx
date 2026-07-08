import { getBySlug, getModuleItems } from "@/lib/content";
import { getDbPost } from "@/lib/server-post";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbDownloadDetail from "@/features/download/components/DbDownloadDetail";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

type P = Promise<{slug:string}>;
export async function generateStaticParams(){ return getModuleItems("download").map(p=>({slug:p.slug})) }
export default async function Page({params}:{params:P}){ const {slug}=await params; const item=getBySlug("download",slug); return <DbDownloadDetail slug={slug} fallback={item} /> }
export async function generateMetadata({params}:{params:P}){ const {slug}=await params; const i=await getDbPost("download",slug); return { title: i ? `${i.title} | دانلود تکباکس`: "دانلود تکباکس" } }

