import { redirect } from "next/navigation";

export default function LegacyBlobPage() {
  redirect("/admin/storage");
}
