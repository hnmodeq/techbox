export const PUBLIC_CONTENT_CACHE = 'public, s-maxage=60, stale-while-revalidate=300';
export const PUBLIC_DETAIL_CACHE = 'public, s-maxage=120, stale-while-revalidate=600';
export const PRIVATE_NO_STORE = 'private, no-store, max-age=0';

export function cacheHeaders(value: string) {
  return { 'Cache-Control': value };
}
