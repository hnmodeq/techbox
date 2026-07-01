import { getBySlug, getModuleItems } from "@/lib/content";
import DownloadDetail from "@/features/download/components/DownloadDetail";
import { notFound } from "next/navigation";

type P = Promise<{slug:string}>;
export async function generateStaticParams(){ return getModuleItems("download").map(p=>({slug:p.slug})) }
export default async function Page({params}:{params:P}){ const {slug}=await params; const item=getBySlug("download",slug); if(!item) return notFound(); return <DownloadDetail item={item} /> }
export async function generateMetadata({params}:{params:P}){ const {slug}=await params; const i=getBySlug("download",slug); return { title: i ? `${i.title} | دانلود تکباکس`: "یافت نشد" } }
