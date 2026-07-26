"use client";

/**
 * Product picker for review posts.
 *
 * Decision D2 makes "a review must target a real shop product" a system
 * invariant, enforced server-side with a 422. This is the UI half of that
 * rule: without it an author literally cannot save a review, because the
 * API rejects any payload with no `reviewedProductId`.
 *
 * Searches live shop posts through the existing /api/posts endpoint —
 * no new route, and the results are exactly the products the API will
 * accept, so the picker can never offer something that fails validation.
 *
 * Docs: docs/homepage-upgrade/03-DATA-CONTRACTS.md §5
 */
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PickedProduct = {
  id: string;
  slug: string;
  title: string;
  image?: string | null;
  brand?: string | null;
  model?: string | null;
  availability?: string | null;
};

type ApiPost = PickedProduct & { published?: boolean };

export function ProductPicker({
  value,
  product,
  onChange,
  disabled,
}: {
  /** Currently linked product id, or null. */
  value: string | null;
  /** Summary of the linked product, so the field can render without refetching. */
  product?: PickedProduct | null;
  onChange: (id: string | null, product: PickedProduct | null) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ApiPost[]>([]);
  const [all, setAll] = React.useState<ApiPost[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  // Load the shop catalogue once, then filter in memory. The catalogue is
  // ~100 rows, so a request per keystroke would be wasteful and laggy.
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/posts?module=shop&take=200", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("shop_unavailable"))))
      .then((data: ApiPost[]) => {
        if (!mounted) return;
        setAll(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => mounted && setError("بارگذاری محصولات ناموفق بود"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults(all.slice(0, 12));
      return;
    }
    setResults(
      all
        .filter((p) =>
          [p.title, p.brand, p.model, p.slug]
            .filter(Boolean)
            .some((f) => String(f).toLowerCase().includes(q)),
        )
        .slice(0, 12),
    );
  }, [query, all]);

  const pick = (p: ApiPost) => {
    onChange(p.id, {
      id: p.id,
      slug: p.slug,
      title: p.title,
      image: p.image,
      brand: p.brand,
      model: p.model,
      availability: p.availability,
    });
    setOpen(false);
    setQuery("");
  };

  // ── Linked state ────────────────────────────────────────────────────
  if (value && product) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-3">
        <div className="flex items-center gap-3">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded bg-muted" aria-hidden="true" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground" dir="ltr">
              {product.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {product.brand} {product.model}
              {product.availability ? (
                <Badge variant="secondary" className="ms-2 align-middle text-[10px]">
                  {product.availability}
                </Badge>
              ) : null}
            </p>
          </div>

          {!disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null, null)}>
              تغییر
            </Button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          این نقد به محصول بالا متصل است و در بخش «انتخاب‌های برتر ما» صفحه اصلی نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  // ── Empty / searching state ─────────────────────────────────────────
  return (
    <div className="rounded-md border border-dashed border-border p-3">
      <Input
        value={query}
        disabled={disabled || loading}
        placeholder={loading ? "در حال بارگذاری محصولات…" : "جست‌وجوی محصول (نام، برند یا مدل)"}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {!error && !loading && all.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          هیچ محصول منتشرشده‌ای در فروشگاه نیست. ابتدا یک محصول اضافه کنید.
        </p>
      )}

      {open && results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto rounded-md border border-border">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p)}
                className="flex w-full items-center gap-3 border-b border-border/60 p-2 text-start transition-colors last:border-0 hover:bg-muted"
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-9 w-9 shrink-0 rounded bg-muted" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground" dir="ltr">
                    {p.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.brand} · {p.availability ?? "—"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && !loading && (
        <p className="mt-2 text-xs text-muted-foreground">محصولی با این مشخصات پیدا نشد.</p>
      )}

      <p className="mt-2 text-[11px] text-muted-foreground">
        انتخاب محصول برای انتشار نقد الزامی است.
      </p>
    </div>
  );
}

export default ProductPicker;
