import type { Metadata } from "next";
import type { ModuleSlug } from "@/lib/content";
import { moduleMeta } from "@/lib/content";

let validatedSiteUrl: string | null = null;

/** Canonical public origin. Production refuses missing/localhost values so a
 * deployment can never silently publish staging or local canonical URLs. */
export function siteUrl() {
  if (validatedSiteUrl) return validatedSiteUrl;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production and must be the canonical public origin.");
  }
  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute http(s) URL without Markdown formatting.");
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  if (process.env.NODE_ENV === "production" && (parsed.protocol !== "https:" || isLocal)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a non-local HTTPS origin in production.");
  }
  validatedSiteUrl = parsed.origin;
  return validatedSiteUrl;
}

export function absoluteUrl(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

function truncate(input: string | null | undefined, max = 155) {
  const text = (input || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export const defaultSeo = {
  title: "تکباکس | رسانه تخصصی فناوری اطلاعات و زیرساخت",
  description: "تکباکس، رسانه و پلتفرم تخصصی زیرساخت، شبکه، سرور، ذخیره‌سازی، امنیت، ویدیو، نقد و بررسی و انجمن فناوری اطلاعات.",
  image: "/logo.png",
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const base = siteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;
  const desc = truncate(description || defaultSeo.description);
  const generatedImage = `/api/og?title=${encodeURIComponent(title)}`;
  const imageValue = image || generatedImage;
  const img = absoluteUrl(imageValue);
  const generated = imageValue.startsWith("/api/og");
  const openGraphImage = img
    ? { url: img, alt: title, ...(generated ? { width: 1200, height: 630 } : {}) }
    : undefined;

  return {
    metadataBase: new URL(base),
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: "fa_IR",
      siteName: "TechBox",
      title,
      description: desc,
      url,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: img ? [img] : undefined,
    },
  };
}

export function privatePageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export function modulePageMetadata(module: ModuleSlug, description: string): Metadata {
  const meta = moduleMeta[module];
  return pageMetadata({
    title: `${meta.titleFa} | تکباکس`,
    description,
    path: meta.href,
  });
}

export function detailMetadata(module: ModuleSlug, item: any | null, fallbackTitle: string): Metadata {
  const meta = moduleMeta[module];
  if (!item) {
    return pageMetadata({
      title: fallbackTitle,
      description: `${meta.titleFa} تکباکس`,
      path: meta.href,
      noIndex: true,
    });
  }

  const title = item.seoTitle || `${item.title} | ${meta.titleFa} تکباکس`;
  const description = item.seoDescription || item.excerpt || item.content || `${meta.titleFa} تکباکس`;
  const image = item.image || `/api/og?title=${encodeURIComponent(item.title)}&module=${module}${item.category ? `&category=${encodeURIComponent(item.category)}` : ""}`;

  return pageMetadata({
    title,
    description,
    path: `/${module}/${item.slug}`,
    image,
    type: ["blog", "news", "review", "media", "forum"].includes(module) ? "article" : "website",
  });
}
