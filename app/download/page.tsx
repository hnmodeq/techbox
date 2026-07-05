import { getModuleItems } from "@/lib/content";
import DownloadTableAsync from "@/features/download/components/DownloadTableAsync";
export const metadata = { title: "دانلود | تکباکس" };
export default async function DownloadPage(){ 
  const items = await getModuleItems("download");
  return <DownloadTableAsync items={items} />;
}