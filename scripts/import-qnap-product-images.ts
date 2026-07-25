import sharp from "sharp";
import { prisma } from "@/lib/db";
import {
  getSupabasePublicUrl,
  getSupabaseStorageConfig,
  uploadSupabaseObject,
} from "@/lib/supabase-storage";

const QNAP_ORIGIN = "https://www.qnap.com";
const REGION = "en-me";
const OFFICIAL_OVERRIDES: Record<string, { pageUrl: string; imageUrl: string }> = {
  "ej1600-v2": {
    pageUrl: "https://store.qnap.com/ej1600-v2-us.html",
    imageUrl: "https://dgi6y9510e51q.cloudfront.net/catalog/product/cache/768315cfcb45daeb341323f409d450a7/2/6/264_1479368296_EJ160020v2_Front_1.webp",
  },
  "es1640dc-v2": {
    pageUrl: "https://www.qnap.com/en-me/product/es1640dc%20v2",
    imageUrl: "https://www.qnap.com/i/_attach_file/product/photo/1000_625/263_1479365883_ES1640dc20v2_Front.png",
  },
  "es2486afdc": {
    pageUrl: "https://www.qnap.com/en-us/product/es2486afdc",
    imageUrl: "https://www.qnap.com/i/_attach_file/product/photo/1000_625/841_1779082841_ES2486AFdc_Right20angle20of20elevation.png",
  },
  "ts-262a": {
    pageUrl: "https://www.qnap.com/en-us/product/ts-262a",
    imageUrl: "https://www.qnap.com/i/_attach_file/product/photo/1000_625/810_1751880248_E794A2E59381E59C96_TS-262A_right.png",
  },
  "ts-462a": {
    pageUrl: "https://www.qnap.com/en-us/product/ts-462a",
    imageUrl: "https://www.qnap.com/i/_attach_file/product/photo/1000_625/809_1751880577_E794A2E59381E59C96_TS-462A_right.png",
  },
};
const APPLY = process.argv.includes("--apply");
const AUTHORIZED = process.env.QNAP_ASSET_IMPORT_AUTHORIZED === "true";
const PAGE_CACHE = new Map<string, { pageUrl: string; imageUrl: string } | null>();
let catalogCache: Promise<string[]> | null = null;

function normalize(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripStoreSuffix(value: string) {
  const tokens = normalize(value).split("-").filter(Boolean);
  const usIndex = tokens.indexOf("us");
  const qnapIndex = tokens.lastIndexOf("qnap");
  const cut = usIndex > 0 ? usIndex : qnapIndex > 0 ? qnapIndex : tokens.length;
  return tokens.slice(0, cut).join("-");
}

function prefixCandidates(value: string) {
  const tokens = stripStoreSuffix(value).split("-").filter(Boolean);
  const result: string[] = [];
  for (let length = tokens.length; length >= 2; length -= 1) {
    result.push(tokens.slice(0, length).join("-"));
  }
  return result;
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&quot;/g, '"');
}

async function fetchOfficialPage(productSlug: string) {
  if (PAGE_CACHE.has(productSlug)) return PAGE_CACHE.get(productSlug)!;
  const pageUrl = `${QNAP_ORIGIN}/${REGION}/product/${encodeURIComponent(productSlug)}`;
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = await fetch(pageUrl, {
      headers: { "User-Agent": "TechBox-authorized-QNAP-asset-import/1.0" },
      redirect: "follow",
      cache: "no-store",
    });
    if (!response.ok) {
      PAGE_CACHE.set(productSlug, null);
      return null;
    }
    const html = await response.text();
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1]
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i)?.[1];
    const image = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i)?.[1];
    const canonicalSlug = canonical ? normalize(new URL(decodeHtml(canonical)).pathname.split("/").pop()) : "";
    if (!image || canonicalSlug !== productSlug) {
      PAGE_CACHE.set(productSlug, null);
      return null;
    }
    const imageUrl = new URL(decodeHtml(image));
    if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "www.qnap.com" ||
        !imageUrl.pathname.startsWith("/i/_attach_file/product/photo/")) {
      PAGE_CACHE.set(productSlug, null);
      return null;
    }
    const result = { pageUrl, imageUrl: imageUrl.toString() };
    PAGE_CACHE.set(productSlug, result);
    return result;
  } catch {
    PAGE_CACHE.set(productSlug, null);
    return null;
  }
}

async function catalogSlugs() {
  if (!catalogCache) {
    catalogCache = (async () => {
      const response = await fetch(`${QNAP_ORIGIN}/${REGION}/product`, {
        headers: { "User-Agent": "TechBox-authorized-QNAP-asset-import/1.0" },
        cache: "no-store",
      });
      if (!response.ok) return [] as string[];
      const html = await response.text();
      return [...html.matchAll(new RegExp(`/${REGION}/product/([a-zA-Z0-9-]+)`, "g"))]
        .map((match) => normalize(match[1]))
        .filter((slug) => slug && !["compare", "series", "status"].includes(slug));
    })();
  }
  return catalogCache!;
}

async function resolveOfficialProduct(post: { slug: string; model: string | null; title: string }) {
  const catalog = await catalogSlugs();
  const sourceKeys = [post.model, post.slug, post.title].map(normalize).filter(Boolean);
  for (const [productSlug, override] of Object.entries(OFFICIAL_OVERRIDES)) {
    if (sourceKeys.some((key) => key === productSlug || key.startsWith(`${productSlug}-`))) {
      return { productSlug, ...override };
    }
  }
  const catalogMatches = catalog
    .filter((candidate) => sourceKeys.some((key) => key === candidate || key.startsWith(`${candidate}-`)))
    .sort((a, b) => b.length - a.length);
  const generated = [...new Set([
    ...catalogMatches,
    ...prefixCandidates(post.model || ""),
    ...prefixCandidates(post.slug),
  ])];
  for (const candidate of generated) {
    const page = await fetchOfficialPage(candidate);
    if (page) return { productSlug: candidate, ...page };
  }
  return null;
}

async function downloadAndConvert(imageUrl: string) {
  const source = new URL(imageUrl);
  const allowedHosts = new Set(["www.qnap.com", "dgi6y9510e51q.cloudfront.net"]);
  if (source.protocol !== "https:" || !allowedHosts.has(source.hostname)) {
    throw new Error(`unapproved QNAP image host: ${source.hostname}`);
  }
  const response = await fetch(imageUrl, {
    headers: { "User-Agent": "TechBox-authorized-QNAP-asset-import/1.0" },
    cache: "no-store",
  });
  const contentType = response.headers.get("content-type") || "";
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (!response.ok || !contentType.startsWith("image/") || contentLength > 15 * 1024 * 1024) {
    throw new Error(`invalid QNAP image response (${response.status}, ${contentType})`);
  }
  const input = Buffer.from(await response.arrayBuffer());
  if (input.length > 15 * 1024 * 1024) throw new Error("QNAP image exceeds 15 MB");
  return sharp(input)
    .rotate()
    .resize({ width: 1200, height: 900, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();
}

async function main() {
  if (!AUTHORIZED) {
    throw new Error(
      "Set QNAP_ASSET_IMPORT_AUTHORIZED=true only after confirming your reseller/asset-use authorization."
    );
  }
  const products = await prisma.post.findMany({
    where: {
      module: "shop",
      OR: [
        { brand: { contains: "qnap", mode: "insensitive" } },
        { slug: { endsWith: "-qnap" } },
        { image: { contains: "/qnap/" } },
      ],
    },
    select: { id: true, slug: true, title: true, model: true, image: true, gallery: true },
    orderBy: { slug: "asc" },
  });
  const config = getSupabaseStorageConfig();
  const uploaded = new Map<string, { url: string; source: string; page: string }>();
  let mapped = 0;
  let failed = 0;

  for (const product of products) {
    const official = await resolveOfficialProduct(product);
    if (!official) {
      console.warn(`UNRESOLVED ${product.slug} (${product.model || "no model"})`);
      failed += 1;
      continue;
    }
    mapped += 1;
    console.log(`MAP ${product.slug} -> ${official.productSlug}`);
    if (!APPLY) continue;

    const path = `qnap/${official.productSlug}.webp`;
    const expectedUrl = getSupabasePublicUrl(config.publicBucket, path);
    const existingGallery = Array.isArray(product.gallery)
      ? product.gallery.filter((value): value is string => typeof value === "string")
      : [];
    if (product.image === expectedUrl && existingGallery.includes(expectedUrl)) {
      console.log(`SKIP ${product.slug}: already imported`);
      continue;
    }

    let asset = uploaded.get(official.productSlug);
    if (!asset) {
      const output = await downloadAndConvert(official.imageUrl);
      const webp = output.buffer.slice(
        output.byteOffset,
        output.byteOffset + output.byteLength
      ) as ArrayBuffer;
      await uploadSupabaseObject({
        bucket: config.publicBucket,
        path,
        body: new Blob([webp], { type: "image/webp" }),
        contentType: "image/webp",
        upsert: true,
      });
      asset = {
        url: getSupabasePublicUrl(config.publicBucket, path),
        source: official.imageUrl,
        page: official.pageUrl,
      };
      uploaded.set(official.productSlug, asset);
    }

    const gallery = [
      asset.url,
      ...existingGallery.filter((url) => !url.includes("/qnap/") && !url.includes("blob.vercel-storage.com")),
    ];
    await prisma.post.update({
      where: { id: product.id },
      data: { image: asset.url, gallery },
    });
    await prisma.auditLog.create({
      data: {
        userName: "QNAP asset importer",
        action: "product.image.import",
        target: `shop/${product.slug}`,
        details: JSON.stringify({ officialProduct: official.productSlug, page: asset.page, source: asset.source }),
      },
    }).catch(() => {});
  }

  console.log(`\n${APPLY ? "Imported" : "Dry-run mapped"}: ${mapped}; unresolved: ${failed}; products: ${products.length}`);
  if (!APPLY) console.log("Re-run with --apply to upload and update products.");
  if (failed > 0) process.exitCode = 2;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
