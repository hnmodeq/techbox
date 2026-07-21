import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function parseUsd(priceLabel: string | null, specs: any): number {
  if (specs && specs["QNAP Store Price USD"]) {
    const m = String(specs["QNAP Store Price USD"]).match(/\$?([\d\.]+)/);
    if (m) return parseFloat(m[1]);
  }
  if (!priceLabel) return 0;
  const cleaned = priceLabel.replace(/,/g, "");
  const m = cleaned.match(/\$?([\d\.]+)/);
  if (!m) return 0;
  return parseFloat(m[1]);
}

async function main() {
  const products = await prisma.post.findMany({
    where: { module: "shop", brand: "QNAP" },
    select: { id: true, title: true, priceLabel: true, specs: true, sourcePriceAmount: true },
  });

  console.log(`Found ${products.length} QNAP products`);

  let updated = 0;
  for (const p of products) {
    const usd = parseUsd(p.priceLabel, p.specs as any);
    if (usd <= 0) continue;

    // If already has sourcePriceAmount, skip? But we want to ensure it's set
    await prisma.post.update({
      where: { id: p.id },
      data: {
        sourcePriceAmount: usd,
        sourceCurrency: "USD",
        priceAdjustmentPercent: 0,
        // priceAmount will be recalculated via currency system, but for now keep existing or set to usd*189000
        priceAmount: Math.round(usd * 189000),
      },
    });
    updated++;
    if (updated % 20 === 0) console.log(`Updated ${updated}`);
  }

  console.log(`Done updated ${updated}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
