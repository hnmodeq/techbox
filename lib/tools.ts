import { toolRoutes } from "@/config/modules.config";
import toolsJson from "@/data/tools.json";

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
  // merge config + json – json wins for editorial fields
  const jsonMap = new Map((toolsJson as any[]).map(t => [t.slug, t]));
  return toolRoutes.map(r => ({ ...r, ...(jsonMap.get(r.slug) || {}) })) as ToolMeta[];
}

export function getTool(slug: string) {
  return getTools().find(t => t.slug === slug) || null;
}
