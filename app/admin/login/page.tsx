import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ redirect?: string }> };

/** Legacy admin URL; every role now authenticates through one shared page. */
export default async function AdminLoginRedirect({ searchParams }: Props) {
  const { redirect: destination } = await searchParams;
  const query = new URLSearchParams();
  if (destination?.startsWith("/") && !destination.startsWith("//")) query.set("redirect", destination);
  redirect(`/login${query.size ? `?${query.toString()}` : ""}`);
}
