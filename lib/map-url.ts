/**
 * Convert any OpenStreetMap URL to an iframe-compatible embed URL.
 *
 * Supported input formats:
 *   - Viewer: https://www.openstreetmap.org/?mlat=35.84&mlon=50.97#map=19/35.84/50.97
 *   - Embed:  https://www.openstreetmap.org/export/embed.html?bbox=...&marker=...
 *   - Short:  https://osm.org/...
 *
 * Returns null if the URL is not a valid OpenStreetMap URL.
 */
export function toOsmEmbedUrl(url: string): string | null {
  if (!url || !url.includes("openstreetmap.org")) return null;

  // Already an embed URL — return as-is
  if (url.includes("/export/embed.html")) return url;

  try {
    const parsed = new URL(url.replace("osm.org", "www.openstreetmap.org"));

    // Extract marker from ?mlat=...&mlon=...
    const mlat = parsed.searchParams.get("mlat");
    const mlon = parsed.searchParams.get("mlon");

    // Extract zoom/lat/lon from hash: #map=zoom/lat/lon
    const hash = parsed.hash; // e.g. "#map=19/35.843607/50.971791"
    const hashMatch = hash.match(/map=(\d+)\/([\d.]+)\/([\d.]+)/);

    const lat = mlat ? parseFloat(mlat) : hashMatch ? parseFloat(hashMatch[2]) : null;
    const lon = mlon ? parseFloat(mlon) : hashMatch ? parseFloat(hashMatch[3]) : null;
    const zoom = hashMatch ? parseInt(hashMatch[1], 10) : 17;

    if (lat === null || lon === null) return null;

    // Calculate bbox from center + zoom
    // At zoom z, one tile (256px) covers 360/2^z degrees of longitude
    // We want roughly a 600px wide viewport → ~2.3 tiles
    const degreesPerTile = 360 / Math.pow(2, zoom);
    const halfWidth = degreesPerTile * 1.2; // ~2.4 tiles total
    const halfHeight = halfWidth * 0.6; // aspect ratio ~5:3

    const bboxLeft = lon - halfWidth;
    const bboxBottom = lat - halfHeight;
    const bboxRight = lon + halfWidth;
    const bboxTop = lat + halfHeight;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bboxLeft.toFixed(6)}%2C${bboxBottom.toFixed(6)}%2C${bboxRight.toFixed(6)}%2C${bboxTop.toFixed(6)}&layer=mapnik&marker=${lat}%2C${lon}`;
  } catch {
    return null;
  }
}
