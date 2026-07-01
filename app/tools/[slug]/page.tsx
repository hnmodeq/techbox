import { notFound, redirect } from "next/navigation";
import { toolRoutes } from "@/config/modules.config";

type Props = { params: Promise<{ slug: string }> };

const KNOWN_REDIRECTS: Record<string, string> = {
  "nas-selector": "/tools/nas-selector",
  "nvr-selector": "/tools/nvr-selector",
  "raid-calculator": "/tools/raid-calculator",
  "subnet-calculator": "/tools/subnet-calculator",
  "raid": "/tools/raid-calculator",
  "nas": "/tools/nas-selector",
  "nvr": "/tools/nvr-selector",
  "subnet": "/tools/subnet-calculator",
};

export default async function ToolSlugPage({ params }: Props) {
  const { slug } = await params;
  const target = KNOWN_REDIRECTS[slug];
  if (target) redirect(target);

  const tool = toolRoutes.find(t => t.slug === slug);
  if (tool?.href) redirect(tool.href);
  notFound();
}

export async function generateStaticParams() {
  return toolRoutes.map(t => ({ slug: t.slug }));
}

export const dynamicParams = false;
