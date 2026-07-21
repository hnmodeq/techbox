import { PrismaClient } from '@prisma/client';

// Extract only the highest speed from a network card string
// "2× 25GbE SFP28" → "25GbE SFP28"
// "12× 1G + 4× 10G SFP+" → "10G SFP+"  (highest)
// "40× 10G + 2× 40G" → "40G"
// "22× 1GbE" → "1GbE"
// "2× 10GbE + 2× 25GbE" → "25GbE"
// "4× 16Gb FC / 4× 10GbE iSCSI" → "16Gb FC"
function extractBestNetwork(raw: string): string {
  if (!raw || raw === 'N/A') return raw;

  // Parse all speeds (in Gbps) from the string
  const parts = raw.split(/[+/,]+/).map(s => s.trim());
  
  let bestGbps = 0;
  let bestLabel = raw;

  for (const part of parts) {
    // Match patterns like "25GbE", "100Gb", "40G", "10GbE SFP+"
    const m = part.match(/(\d+(?:\.\d+)?)\s*[GT]b/i);
    if (m) {
      const gbps = parseFloat(m[1]);
      if (gbps > bestGbps) {
        bestGbps = gbps;
        // Strip the count prefix (e.g. "2× " or "40× ")
        bestLabel = part.replace(/^\d+[×x]\s*/, '').trim();
      }
    }
  }

  return bestLabel || raw;
}

async function main() {
  const p = new PrismaClient();
  const products = await p.post.findMany({
    where: { module: 'shop', deletedAt: null },
    select: { id: true, slug: true, specs: true }
  });

  for (const prod of products) {
    if (!prod.specs || typeof prod.specs !== 'object' || Array.isArray(prod.specs)) continue;
    const specs = prod.specs as Record<string, string>;
    const nc = specs['Network Card'];
    if (!nc) continue;
    const fixed = extractBestNetwork(nc);
    if (fixed !== nc) {
      const newSpecs = { ...specs, 'Network Card': fixed };
      await p.post.update({ where: { id: prod.id }, data: { specs: newSpecs } });
      console.log(`✓ ${prod.slug}: "${nc}" → "${fixed}"`);
    } else {
      console.log(`  ${prod.slug}: "${nc}" (unchanged)`);
    }
  }
  await p.$disconnect();
}
main().catch(console.error);
