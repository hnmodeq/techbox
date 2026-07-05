import { getModuleItems } from "@/lib/content";
import ReviewGridAsync from "@/features/review/components/ReviewGridAsync";
export const metadata = { title: "نقد و بررسی | تکباکس" };
export default async function ReviewPage(){ 
  const items = await getModuleItems("review");
  return <ReviewGridAsync items={items} />;
}