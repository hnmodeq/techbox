import { getBySlug, getModuleItems } from "@/lib/content";
import DbDownloadDetail from "@/features/download/components/DbDownloadDetail";

type P = Promise<{slug:string}>;
export async function generateStaticParams(){ return getModuleItems("download").map(p=>({slug:p.slug})) }
export default async function Page({params}:{params:P}){ const {slug}=await params; const item=getBySlug("download",slug); return <DbDownloadDetail slug={slug} fallback={item} /> }
export async function generateMetadata({params}:{params:P}){ const {slug}=await params; const i=getBySlug("download",slug); return { title: i ? `${i.title} | دانلود تکباکس`: "یافت نشد" } }
