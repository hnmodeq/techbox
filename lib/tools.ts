import { toolRoutes } from "@/config/modules.config";

export type ToolMeta = {
  slug: string;
  title: string;
  titleFa: string;
  href: string;
  icon: string;
  color: string;
  descriptionFa?: string;
  new?: boolean;
  version?: string;
};

export function getTools(): ToolMeta[] {
  return [...toolRoutes] as ToolMeta[];
}

export function getTool(slug: string) {
  return getTools().find(t => t.slug === slug) || null;
}
