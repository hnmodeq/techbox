/**
 * Module colour system
 *
 * The site deliberately falls back to shadcn's `--primary` while the system
 * is disabled. When an administrator enables it, ModuleColorApplier writes a
 * module's selected value to the corresponding `--module-*-color` variable.
 * Keeping the fallback in every class means disabled mode never leaves an
 * undefined CSS variable or a coloured remnant behind.
 */

export const COLORABLE_MODULE_SLUGS = [
  "blog",
  "news",
  "media",
  "shop",
  "forum",
  "review",
  "download",
  "tools",
  "timeline",
] as const;

export type ColorableModuleSlug = (typeof COLORABLE_MODULE_SLUGS)[number];

/** Accessible defaults used only after the admin explicitly enables colours. */
export const MODULE_COLOR_DEFAULTS: Record<ColorableModuleSlug, string> = {
  blog: "#1d4ed8",
  news: "#b91c1c",
  media: "#6d28d9",
  shop: "#047857",
  forum: "#b45309",
  review: "#0e7490",
  download: "#be185d",
  tools: "#0f766e",
  timeline: "#4338ca",
};

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Values selected by the visual admin colour picker are safe CSS colours. */
export function isModuleColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

export function resolveModuleColor(slug: string, value?: unknown): string {
  if (isModuleColor(value)) return value.trim();
  return MODULE_COLOR_DEFAULTS[slug as ColorableModuleSlug] || "var(--primary)";
}

/**
 * Static Tailwind classes for the pre-existing module-card/sidebar API.
 *
 * Do not construct these class names dynamically: Tailwind scans this file at
 * build time. The custom-property fallback is the standard shadcn primary,
 * so every consumer automatically returns to the site palette when module
 * colours are off.
 */
export const moduleColors = {
  home: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  blog: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-blog-color,var(--primary))]",
    active: "text-[color:var(--module-blog-color,var(--primary))]",
  },
  news: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-news-color,var(--primary))]",
    active: "text-[color:var(--module-news-color,var(--primary))]",
  },
  media: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-media-color,var(--primary))]",
    active: "text-[color:var(--module-media-color,var(--primary))]",
  },
  shop: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-shop-color,var(--primary))]",
    active: "text-[color:var(--module-shop-color,var(--primary))]",
  },
  tools: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-tools-color,var(--primary))]",
    active: "text-[color:var(--module-tools-color,var(--primary))]",
  },
  raid: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-tools-color,var(--primary))]",
    active: "text-[color:var(--module-tools-color,var(--primary))]",
  },
  subnet: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-tools-color,var(--primary))]",
    active: "text-[color:var(--module-tools-color,var(--primary))]",
  },
  nas: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-tools-color,var(--primary))]",
    active: "text-[color:var(--module-tools-color,var(--primary))]",
  },
  ups: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-tools-color,var(--primary))]",
    active: "text-[color:var(--module-tools-color,var(--primary))]",
  },
  nvr: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-tools-color,var(--primary))]",
    active: "text-[color:var(--module-tools-color,var(--primary))]",
  },
  timeline: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-timeline-color,var(--primary))]",
    active: "text-[color:var(--module-timeline-color,var(--primary))]",
  },
  vip: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  forum: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-forum-color,var(--primary))]",
    active: "text-[color:var(--module-forum-color,var(--primary))]",
  },
  review: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-review-color,var(--primary))]",
    active: "text-[color:var(--module-review-color,var(--primary))]",
  },
  download: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-[color:var(--module-download-color,var(--primary))]",
    active: "text-[color:var(--module-download-color,var(--primary))]",
  },
  account: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  admin: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  about: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  contact: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  workwithus: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
  consultation: {
    base: "text-[var(--primary-text)]",
    hover: "group-hover:text-primary",
    active: "text-primary",
  },
} as const;
