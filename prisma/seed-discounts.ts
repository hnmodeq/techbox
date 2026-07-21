import { PrismaClient } from '@prisma/client';
async function main() {
  const p = new PrismaClient();
  const end3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const end1 = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  const end5 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  const discounts: Record<string, { pct: number; end: Date }> = {
    'product-01': { pct: 15, end: end3 },
    'product-02': { pct: 8,  end: end5 },
    'product-03': { pct: 12, end: end1 },
    'product-04': { pct: 10, end: end3 },
    'product-05': { pct: 5,  end: end5 },
    'product-06': { pct: 20, end: end3 },
    'product-08': { pct: 18, end: end1 },
    'product-10': { pct: 7,  end: end5 },
    'product-13': { pct: 6,  end: end3 },
    'product-17': { pct: 25, end: end3 },
    'product-20': { pct: 22, end: end1 },
  };

  for (const [slug, { pct, end }] of Object.entries(discounts)) {
    const res = await p.post.updateMany({
      where: { slug, module: 'shop' },
      data: { discountPercent: pct, discountEndsAt: end }
    });
    console.log(`✓ ${slug}: ${pct}% — updated ${res.count} row(s)`);
  }

  // Clear discounts from others
  const clear = ['product-07','product-09','product-11','product-12','product-14','product-15','product-16','product-18','product-19'];
  for (const slug of clear) {
    await p.post.updateMany({ where: { slug, module: 'shop' }, data: { discountPercent: null, discountEndsAt: null }});
  }
  console.log('Cleared discounts from', clear.length, 'products');
  await p.$disconnect();
}
main().catch(console.error);
