import { describe, it, expect } from "vitest";

/**
 * The review→product invariant (decision D2).
 *
 * validateReviewedProduct lives inside app/api/posts/route.ts, which pulls
 * in the whole Next request stack and cannot be imported in a unit test.
 * The rules it enforces are reproduced here against a fake lookup so the
 * DECISION TABLE is locked down: if someone later relaxes a branch in the
 * route, this test still describes what the behaviour is supposed to be.
 *
 * Docs: docs/homepage-upgrade/03-DATA-CONTRACTS.md §5
 */

type Product = {
  id: string;
  module: string;
  published: boolean;
  deletedAt: Date | null;
};

const CATALOGUE: Record<string, Product> = {
  "shop-live": { id: "shop-live", module: "shop", published: true, deletedAt: null },
  "shop-draft": { id: "shop-draft", module: "shop", published: false, deletedAt: null },
  "shop-deleted": { id: "shop-deleted", module: "shop", published: true, deletedAt: new Date() },
  "blog-post": { id: "blog-post", module: "blog", published: true, deletedAt: null },
};

async function validateReviewedProduct(
  moduleKey: string,
  reviewedProductId: string | null | undefined,
): Promise<string | null> {
  if (moduleKey !== "review") return null;
  if (!reviewedProductId) return "برای نقد و بررسی باید یک محصول از فروشگاه انتخاب شود.";

  const product = CATALOGUE[reviewedProductId];
  if (!product || product.deletedAt) return "محصول انتخاب‌شده یافت نشد.";
  if (product.module !== "shop") return "فقط محصولات فروشگاه قابل نقد و بررسی هستند.";
  if (!product.published) return "محصول انتخاب‌شده منتشر نشده است.";
  return null;
}

describe("review → product invariant", () => {
  it("accepts a review linked to a live shop product", async () => {
    expect(await validateReviewedProduct("review", "shop-live")).toBeNull();
  });

  it("rejects a review with no product at all", async () => {
    const err = await validateReviewedProduct("review", null);
    expect(err).not.toBeNull();
    expect(err).toContain("محصول");
  });

  it("rejects an empty-string product id", async () => {
    expect(await validateReviewedProduct("review", "")).not.toBeNull();
  });

  it("rejects a product that does not exist", async () => {
    expect(await validateReviewedProduct("review", "nope")).toContain("یافت نشد");
  });

  it("rejects a soft-deleted product", async () => {
    expect(await validateReviewedProduct("review", "shop-deleted")).toContain("یافت نشد");
  });

  it("rejects an unpublished product — a review must not advertise a draft", async () => {
    expect(await validateReviewedProduct("review", "shop-draft")).toContain("منتشر نشده");
  });

  it("rejects a non-shop post, so you cannot 'review' an article", async () => {
    expect(await validateReviewedProduct("review", "blog-post")).toContain("فروشگاه");
  });

  it("leaves every other module untouched", async () => {
    for (const m of ["blog", "news", "media", "shop", "forum", "download"]) {
      expect(await validateReviewedProduct(m, null)).toBeNull();
      expect(await validateReviewedProduct(m, undefined)).toBeNull();
    }
  });

  it("does not require a product on a blog post that happens to send one", async () => {
    // A stray field on a non-review module must not become a hard error.
    expect(await validateReviewedProduct("blog", "shop-live")).toBeNull();
  });
});
