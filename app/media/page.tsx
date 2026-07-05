import { getModuleItems } from "@/lib/content";
import MediaGalleryAsync from "@/features/media/components/MediaGalleryAsync";
export const metadata = { title: "رسانه | تکباکس" };
export default async function MediaPage(){ 
  const items = await getModuleItems("media");
  return <MediaGalleryAsync items={items} />;
}