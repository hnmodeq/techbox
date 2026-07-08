import type { Metadata } from "next";
import type { ModuleSlug } from "@/lib/content";
import { moduleMeta } from "@/lib/content";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://hnmodeq-techbox.vercel.app").replace(/\/$/, "");
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
  description: "تکباکس، رسانه و پلتفرم تخصصی زیرساخت، شبکه، سرور، ذخیره‌سازی، امنیت، ویدیو، نقد و بررسی، دانلود و انجمن فناوری اطلاعات.",
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
  const url = `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const desc = truncate(description || defaultSeo.description);
  const img = absoluteUrl(image || defaultSeo.image);

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      locale: "fa_IR",
      siteName: "TechBox",
      title,
      description: desc,
      url,
      images: img ? [{ url: img, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: img ? [img] : undefined,
    },
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
  return pageMetadata({
    title,
    description,
    path: `/${module}/${item.slug}`,
    image: item.image,
    type: ["blog", "news", "review", "media", "forum"].includes(module) ? "article" : "website",
  });
}
