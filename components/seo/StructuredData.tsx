import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";

type AnyRecord = Record<string, any>;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://hnmodeq-techbox.vercel.app").replace(/\/$/, "");
}

function absoluteUrl(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

function cleanObject<T extends AnyRecord>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0))
  ) as T;
}

function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function isoDuration(duration?: string | null) {
  if (!duration) return undefined;
  const parts = duration.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return undefined;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  if (parts.length === 3) [hours, minutes, seconds] = parts;
  else if (parts.length === 2) [minutes, seconds] = parts;
  else return undefined;
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${seconds ? `${seconds}S` : ""}` || "PT0S";
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.url),
        })),
      }}
    />
  );
}

export function ContentJsonLd({ item }: { item: ContentItem }) {
  const base = siteUrl();
  const url = `${base}/${item.module}/${item.slug}`;
  const image = absoluteUrl(item.image);
  const author = cleanObject({
    "@type": "Person",
    name: item.author?.name || "تکباکس",
    image: absoluteUrl(item.author?.avatar),
  });

  const breadcrumb = (
    <BreadcrumbJsonLd
      items={[
        { name: "خانه", url: "/" },
        { name: moduleMeta[item.module]?.titleFa || item.module, url: `/${item.module}` },
        { name: item.title, url: `/${item.module}/${item.slug}` },
      ]}
    />
  );

  if (item.module === "media") {
    const videoUrl = (item as any).videoUrl || (item as any).video || (item as any).videoSrc;
    return (
      <>
        <JsonLd
          data={cleanObject({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: item.title,
            description: item.excerpt || item.content,
            thumbnailUrl: image ? [image] : undefined,
            uploadDate: item.date,
            duration: isoDuration((item as any).videoDuration),
            contentUrl: absoluteUrl(videoUrl),
            embedUrl: absoluteUrl(videoUrl),
            url,
            publisher: { "@type": "Organization", name: "TechBox", url: base },
          })}
        />
        {breadcrumb}
      </>
    );
  }

  const type = item.module === "news" ? "NewsArticle" : "Article";
  return (
    <>
      <JsonLd
        data={cleanObject({
          "@context": "https://schema.org",
          "@type": type,
          headline: item.title,
          description: item.excerpt,
          image: image ? [image] : undefined,
          datePublished: item.date,
          dateModified: item.date,
          author,
          publisher: { "@type": "Organization", name: "TechBox", url: base, logo: { "@type": "ImageObject", url: `${base}/logo.png` } },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          url,
        })}
      />
      {breadcrumb}
    </>
  );
}

export function ReviewJsonLd({ item }: { item: any }) {
  const base = siteUrl();
  const url = `${base}/review/${item.slug}`;
  const ratingValue = typeof item.rating === "number" ? item.rating : undefined;
  return (
    <>
      <JsonLd
        data={cleanObject({
          "@context": "https://schema.org",
          "@type": "Review",
          name: item.title,
          headline: item.title,
          description: item.excerpt,
          image: absoluteUrl(item.image),
          datePublished: item.date,
          author: { "@type": "Person", name: item.author?.name || "تکباکس" },
          itemReviewed: cleanObject({
            "@type": "Product",
            name: item.title.replace(/^بررسی\s*/i, ""),
            image: absoluteUrl(item.image),
            category: item.category,
          }),
          reviewRating: ratingValue ? { "@type": "Rating", ratingValue, bestRating: 5, worstRating: 1 } : undefined,
          publisher: { "@type": "Organization", name: "TechBox", url: base },
          url,
        })}
      />
      <BreadcrumbJsonLd items={[{ name: "خانه", url: "/" }, { name: "نقد و بررسی", url: "/review" }, { name: item.title, url: `/review/${item.slug}` }]} />
    </>
  );
}

export function ProductJsonLd({ item }: { item: any }) {
  const base = siteUrl();
  const url = `${base}/shop/${item.slug}`;
  const gallery = Array.isArray(item.gallery) ? item.gallery.map(absoluteUrl).filter(Boolean) : [];
  return (
    <>
      <JsonLd
        data={cleanObject({
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.title,
          description: item.excerpt,
          image: gallery.length ? gallery : absoluteUrl(item.image) ? [absoluteUrl(item.image)] : undefined,
          brand: item.brand ? { "@type": "Brand", name: item.brand } : undefined,
          model: item.model,
          sku: item.sku,
          category: item.category,
          aggregateRating: typeof item.rating === "number" && item.ratingCount > 0 ? { "@type": "AggregateRating", ratingValue: item.rating, reviewCount: item.ratingCount } : undefined,
          offers: cleanObject({
            "@type": "Offer",
            url,
            availability: item.availability?.includes("موجود") ? "https://schema.org/InStock" : undefined,
            priceCurrency: "IRR",
            price: undefined,
            description: item.priceLabel || "مشاوره خرید",
          }),
        })}
      />
      <BreadcrumbJsonLd items={[{ name: "خانه", url: "/" }, { name: "فروشگاه", url: "/shop" }, { name: item.title, url: `/shop/${item.slug}` }]} />
    </>
  );
}

export function ForumJsonLd({ item }: { item: any }) {
  return (
    <>
      <JsonLd
        data={cleanObject({
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          headline: item.title,
          text: item.content || item.excerpt,
          datePublished: item.date,
          image: absoluteUrl(item.image),
          author: { "@type": "Person", name: item.author?.name || "کاربر انجمن" },
          url: `${siteUrl()}/forum/${item.slug}`,
        })}
      />
      <BreadcrumbJsonLd items={[{ name: "خانه", url: "/" }, { name: "انجمن", url: "/forum" }, { name: item.title, url: `/forum/${item.slug}` }]} />
    </>
  );
}
