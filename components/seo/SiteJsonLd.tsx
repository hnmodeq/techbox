import { siteUrl } from "@/lib/seo";

/**
 * WebSite schema with SearchAction — enables Google sitelinks search box.
 * Should be rendered once in the root layout.
 */
export function WebSiteJsonLd() {
  const base = siteUrl();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "تکباکس",
          alternateName: "TechBox",
          url: base,
          description: "رسانه و پلتفرم تخصصی زیرساخت، شبکه، سرور، ذخیره‌سازی، امنیت فناوری اطلاعات",
          inLanguage: "fa",
          publisher: {
            "@type": "Organization",
            name: "تکباکس",
            url: base,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${base}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Organization schema — brand knowledge panel in Google.
 * Should be rendered once in the root layout.
 */
export function OrganizationJsonLd() {
  const base = siteUrl();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "تکباکس",
          alternateName: "TechBox",
          url: base,
          logo: `${base}/logo.png`,
          image: `${base}/logo.png`,
          description: "رسانه و پلتفرم تخصصی زیرساخت، شبکه، سرور، ذخیره‌سازی، امنیت فناوری اطلاعات",
          sameAs: [],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["Persian", "English"],
          },
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
