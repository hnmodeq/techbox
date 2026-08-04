export type DriveCatalogItem = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageFile: string;
  tags: string[];
  category: "Enterprise HDD" | "Enterprise SSD";
  brand: string;
  model: string;
  sku: string;
  sourcePriceAmount: number;
  sourceCurrency: "USD";
  priceAdjustmentPercent: number;
  sellerBenefitPercent: number;
  availability: "موجود";
  warranty: string;
  specs: Record<string, string>;
};

const PRICE_CHECKED = "2026-08-04";

function hdd(input: {
  slug: string;
  brand: string;
  series: string;
  model: string;
  capacity: string;
  imageFile: string;
  price: number;
  speed: number;
  cache?: string;
  workload?: string;
  mtbf?: string;
  specSource: string;
  priceSource: string;
}) : DriveCatalogItem {
  const cache = input.cache || "512 MB";
  const workload = input.workload || "550 TB/year";
  const mtbf = input.mtbf || "2.5 million hours";
  return {
    slug: input.slug,
    title: `${input.brand} ${input.series} ${input.capacity} Enterprise HDD - ${input.model}`,
    excerpt: `هارددیسک سازمانی ${input.capacity} با ضبط CMR، سرعت ۷۲۰۰ دور و طراحی ۲۴×۷ برای NAS، RAID و ذخیره‌سازهای چند‌درایوی.`,
    content: `این مدل از خانواده ${input.brand} ${input.series} برای بارهای کاری دائمی، آرایه‌های RAID، بکاپ سازمانی و ذخیره‌سازهای چند‌درایوی طراحی شده است. پیش از خرید، سازگاری مدل دقیق ${input.model} را با فهرست Compatibility سازنده ذخیره‌ساز بررسی کنید.`,
    imageFile: input.imageFile,
    tags: ["drive", "HDD", "enterprise", "CMR", "RAID", "NAS", input.brand, input.capacity],
    category: "Enterprise HDD",
    brand: input.brand,
    model: input.model,
    sku: input.model,
    sourcePriceAmount: input.price,
    sourceCurrency: "USD",
    priceAdjustmentPercent: 0,
    sellerBenefitPercent: 35,
    availability: "موجود",
    warranty: "گارانتی ۵ ساله سازنده",
    specs: {
      "Product Type": "Drive",
      "نوع محصول": "درایو",
      "Drive Type": "HDD",
      "نوع درایو": "HDD",
      Capacity: input.capacity,
      "ظرفیت": input.capacity,
      Interface: "SATA 6Gb/s",
      "رابط": "SATA 6Gb/s",
      "Form Factor": "3.5-inch",
      "فرم فاکتور": "3.5-inch",
      "Rotational Speed": "7200 RPM",
      "سرعت چرخش": "7200 RPM",
      "Sequential Read": `${input.speed} MB/s`,
      "سرعت خواندن ترتیبی": `${input.speed} MB/s`,
      Cache: cache,
      "Recording Technology": "CMR",
      "Workload Rate": workload,
      "نرخ بار کاری": workload,
      MTBF: mtbf,
      "Sector Format": "512e",
      "Hot Swap": "Supported by compatible enclosure",
      Warranty: "5 years limited manufacturer warranty",
      "Specification Source": input.specSource,
      "Price Reference": input.priceSource,
      "Price Checked": PRICE_CHECKED,
    },
  };
}

function ssd(input: {
  slug: string;
  brand: string;
  series: string;
  model: string;
  capacity: string;
  imageFile: string;
  price: number;
  interfaceName: string;
  formFactor: string;
  read: number;
  write: number;
  randomRead: string;
  randomWrite: string;
  dwpd: string;
  nand: string;
  specSource: string;
  priceSource: string;
}) : DriveCatalogItem {
  return {
    slug: input.slug,
    title: `${input.brand} ${input.series} ${input.capacity} Enterprise SSD - ${input.model}`,
    excerpt: `SSD سازمانی ${input.capacity} با رابط ${input.interfaceName}، محافظت قطع برق و دوام دیتاسنتری برای ذخیره‌ساز و سرور.`,
    content: `این مدل از خانواده ${input.brand} ${input.series} برای کارکرد ۲۴×۷، کش خواندن، مجازی‌سازی و ذخیره‌سازهای سازمانی طراحی شده است. پیش از خرید، رابط، فرم فاکتور و مدل دقیق ${input.model} را با Compatibility List دستگاه مقصد تطبیق دهید.`,
    imageFile: input.imageFile,
    tags: ["drive", "SSD", "enterprise", "data-center", "RAID", input.brand, input.capacity, input.interfaceName],
    category: "Enterprise SSD",
    brand: input.brand,
    model: input.model,
    sku: input.model,
    sourcePriceAmount: input.price,
    sourceCurrency: "USD",
    priceAdjustmentPercent: 0,
    sellerBenefitPercent: 35,
    availability: "موجود",
    warranty: "گارانتی ۵ ساله سازنده",
    specs: {
      "Product Type": "Drive",
      "نوع محصول": "درایو",
      "Drive Type": "SSD",
      "نوع درایو": "SSD",
      Capacity: input.capacity,
      "ظرفیت": input.capacity,
      Interface: input.interfaceName,
      "رابط": input.interfaceName,
      "Form Factor": input.formFactor,
      "فرم فاکتور": input.formFactor,
      "Sequential Read": `${input.read.toLocaleString("en-US")} MB/s`,
      "سرعت خواندن ترتیبی": `${input.read.toLocaleString("en-US")} MB/s`,
      "Sequential Write": `${input.write.toLocaleString("en-US")} MB/s`,
      "سرعت نوشتن ترتیبی": `${input.write.toLocaleString("en-US")} MB/s`,
      "Random Read": input.randomRead,
      "Random Write": input.randomWrite,
      DWPD: input.dwpd,
      NAND: input.nand,
      "Power Loss Protection": "Yes",
      "End-to-End Data Protection": "Yes",
      "Hot Swap": "Supported by compatible enclosure",
      Warranty: "5 years limited manufacturer warranty",
      "Specification Source": input.specSource,
      "Price Reference": input.priceSource,
      "Price Checked": PRICE_CHECKED,
    },
  };
}

const SEAGATE_EXOS_SPEC = "https://www.seagate.com/content/dam/seagate/en/content-fragments/products/datasheets/exos-x24/exos-x24-DS2080-2307US-en_US.pdf";
const WD_SPEC = "https://www.westerndigital.com/products/internal-drives/data-center-drives/ultrastar-dc-hc580-hdd";
const TOSHIBA_SPEC = "https://storage.toshiba.com/enterprise-hdd/cloud-scale-capacity/mg10-series";
const IRONWOLF_SPEC = "https://www.seagate.com/content/dam/seagate/assets/products/nas-drives/ironwolf-pro-hard-drive/files/Seagate_IronWolf_Pro_SATA_Product_Manual_24-20-16-12TB_206815300B.pdf";

const hdds: DriveCatalogItem[] = [
  hdd({ slug: "drive-seagate-exos-x24-24tb", brand: "Seagate", series: "Exos X24", model: "ST24000NM002H", capacity: "24 TB", imageFile: "seagate-exos-x24.webp", price: 658, speed: 285, specSource: SEAGATE_EXOS_SPEC, priceSource: "https://www.shi.com/product/47212367/Seagate-Exos-X24-ST24000NM002H" }),
  hdd({ slug: "drive-seagate-exos-x22-22tb", brand: "Seagate", series: "Exos X22", model: "ST22000NM001E", capacity: "22 TB", imageFile: "seagate-exos-x24.webp", price: 602, speed: 285, specSource: SEAGATE_EXOS_SPEC, priceSource: "https://www.newegg.com/p/pl?d=ST22000NM001E" }),
  hdd({ slug: "drive-seagate-exos-x20-20tb", brand: "Seagate", series: "Exos X20", model: "ST20000NM007D", capacity: "20 TB", imageFile: "seagate-exos-x24.webp", price: 519, speed: 285, cache: "256 MB", specSource: SEAGATE_EXOS_SPEC, priceSource: "https://www.ebay.com/p/22056421559" }),
  hdd({ slug: "drive-seagate-exos-x18-18tb", brand: "Seagate", series: "Exos X18", model: "ST18000NM000J", capacity: "18 TB", imageFile: "seagate-exos-x24.webp", price: 449, speed: 270, cache: "256 MB", specSource: SEAGATE_EXOS_SPEC, priceSource: "https://www.newegg.com/p/pl?d=ST18000NM000J" }),
  hdd({ slug: "drive-seagate-exos-x18-16tb", brand: "Seagate", series: "Exos X18", model: "ST16000NM000J", capacity: "16 TB", imageFile: "seagate-exos-x24.webp", price: 399, speed: 270, cache: "256 MB", specSource: SEAGATE_EXOS_SPEC, priceSource: "https://www.newegg.com/p/pl?d=ST16000NM000J" }),

  hdd({ slug: "drive-wd-ultrastar-hc580-24tb", brand: "Western Digital", series: "Ultrastar DC HC580", model: "WUH722424ALE6L4", capacity: "24 TB", imageFile: "wd-ultrastar-dc.webp", price: 899, speed: 298, specSource: WD_SPEC, priceSource: "https://www.bhphotovideo.com/c/product/1811317-REG/wd_0f62796_ultrastar_dc_hc580_24tb.html" }),
  hdd({ slug: "drive-wd-ultrastar-hc570-22tb", brand: "Western Digital", series: "Ultrastar DC HC570", model: "WUH722222ALE6L4", capacity: "22 TB", imageFile: "wd-ultrastar-dc.webp", price: 602, speed: 291, specSource: WD_SPEC, priceSource: "https://www.westerndigital.com/products/internal-drives/data-center-drives/ultrastar-dc-hc570-hdd" }),
  hdd({ slug: "drive-wd-ultrastar-hc560-20tb", brand: "Western Digital", series: "Ultrastar DC HC560", model: "WUH722020ALE6L4", capacity: "20 TB", imageFile: "wd-ultrastar-dc.webp", price: 541, speed: 291, specSource: WD_SPEC, priceSource: "https://www.westerndigital.com/products/internal-drives/data-center-drives/ultrastar-dc-hc560-hdd" }),
  hdd({ slug: "drive-wd-ultrastar-hc550-18tb", brand: "Western Digital", series: "Ultrastar DC HC550", model: "WUH721818ALE6L4", capacity: "18 TB", imageFile: "wd-ultrastar-dc.webp", price: 499, speed: 269, specSource: WD_SPEC, priceSource: "https://www.amazon.com/dp/B08DHH8V9G" }),
  hdd({ slug: "drive-wd-ultrastar-hc550-16tb", brand: "Western Digital", series: "Ultrastar DC HC550", model: "WUH721816ALE6L4", capacity: "16 TB", imageFile: "wd-ultrastar-dc.webp", price: 449, speed: 269, specSource: WD_SPEC, priceSource: "https://www.amazon.com/dp/B08DHH8V9G" }),

  hdd({ slug: "drive-toshiba-mg10-20tb", brand: "Toshiba", series: "MG10", model: "MG10ACA20TE", capacity: "20 TB", imageFile: "toshiba-mg-series.webp", price: 500, speed: 268, specSource: TOSHIBA_SPEC, priceSource: "https://serverpartdeals.com/products/toshiba-mg10-mg10aca20te-20tb-7-2k-rpm-sata-6gb-s-512e-3-5-hard-drive" }),
  hdd({ slug: "drive-toshiba-mg09-18tb", brand: "Toshiba", series: "MG09", model: "MG09ACA18TE", capacity: "18 TB", imageFile: "toshiba-mg-series.webp", price: 450, speed: 268, specSource: TOSHIBA_SPEC, priceSource: "https://www.ebay.com/p/15049578016" }),
  hdd({ slug: "drive-toshiba-mg09-16tb", brand: "Toshiba", series: "MG09", model: "MG09ACA16TE", capacity: "16 TB", imageFile: "toshiba-mg-series.webp", price: 410, speed: 268, specSource: TOSHIBA_SPEC, priceSource: "https://storage.toshiba.com/enterprise-hdd/cloud-scale-capacity/mg09-series" }),
  hdd({ slug: "drive-toshiba-mg08-14tb", brand: "Toshiba", series: "MG08", model: "MG08ACA14TE", capacity: "14 TB", imageFile: "toshiba-mg-series.webp", price: 360, speed: 248, specSource: TOSHIBA_SPEC, priceSource: "https://storage.toshiba.com/enterprise-hdd/cloud-scale-capacity/mg08-series" }),
  hdd({ slug: "drive-toshiba-mg08-12tb", brand: "Toshiba", series: "MG08", model: "MG08ACA12TE", capacity: "12 TB", imageFile: "toshiba-mg-series.webp", price: 320, speed: 242, specSource: TOSHIBA_SPEC, priceSource: "https://storage.toshiba.com/enterprise-hdd/cloud-scale-capacity/mg08-series" }),

  hdd({ slug: "drive-seagate-ironwolf-pro-24tb", brand: "Seagate", series: "IronWolf Pro", model: "ST24000NT002", capacity: "24 TB", imageFile: "seagate-ironwolf-pro.webp", price: 860, speed: 285, specSource: IRONWOLF_SPEC, priceSource: "https://www.bestbuy.com/product/seagate-ironwolf-pro-24tb/J37C5H5HQ2" }),
  hdd({ slug: "drive-seagate-ironwolf-pro-22tb", brand: "Seagate", series: "IronWolf Pro", model: "ST22000NT001", capacity: "22 TB", imageFile: "seagate-ironwolf-pro.webp", price: 699, speed: 285, specSource: IRONWOLF_SPEC, priceSource: "https://www.newegg.com/p/pl?d=ST22000NT001" }),
  hdd({ slug: "drive-seagate-ironwolf-pro-20tb", brand: "Seagate", series: "IronWolf Pro", model: "ST20000NT001", capacity: "20 TB", imageFile: "seagate-ironwolf-pro.webp", price: 430, speed: 285, specSource: IRONWOLF_SPEC, priceSource: "https://pangoly.com/en/price-history/seagate-ironwolf-pro-20tb" }),
  hdd({ slug: "drive-seagate-ironwolf-pro-18tb", brand: "Seagate", series: "IronWolf Pro", model: "ST18000NT001", capacity: "18 TB", imageFile: "seagate-ironwolf-pro.webp", price: 410, speed: 270, specSource: IRONWOLF_SPEC, priceSource: "https://www.newegg.com/p/pl?d=ST18000NT001" }),
  hdd({ slug: "drive-seagate-ironwolf-pro-16tb", brand: "Seagate", series: "IronWolf Pro", model: "ST16000NT001", capacity: "16 TB", imageFile: "seagate-ironwolf-pro.webp", price: 380, speed: 255, specSource: IRONWOLF_SPEC, priceSource: "https://www.newegg.com/p/pl?d=ST16000NT001" }),
];

const SAMSUNG_PM893_SPEC = "https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_SSD_PM893_Data_Sheet_Rev1.0.pdf";
const MICRON_5400_SPEC = "https://www.micron.com/content/dam/micron/global/public/products/product-flyer/5400-product-brief.pdf";
const SOLIDIGM_SPEC = "https://www.solidigm.com/products/data-center/d3/s4520.html";
const KIOXIA_SPEC = "https://americas.kioxia.com/content/dam/kioxia/shared/business/ssd/data-center-ssd/asset/productbrief/dSSD-CD8-R-U2-product-brief.pdf";
const SAMSUNG_PM9A3_SPEC = "https://image.semiconductor.samsung.com/resources/data-sheet/samsung_ssd_pm9a3_data_sheet_rev1_0.pdf";

const ssds: DriveCatalogItem[] = [
  ...[
    ["480 GB", "MZ7L3480HCHQ", 140, 520, "29K IOPS"],
    ["960 GB", "MZ7L3960HCJR", 192, 520, "30K IOPS"],
    ["1.92 TB", "MZ7L31T9HBLT", 390, 520, "30K IOPS"],
    ["3.84 TB", "MZ7L33T8HBLT", 820, 520, "30K IOPS"],
    ["7.68 TB", "MZ7L37T6HBLT", 1900, 520, "30K IOPS"],
  ].map(([capacity, model, price, write, randomWrite]) => ssd({
    slug: `drive-samsung-pm893-${String(capacity).toLowerCase().replace(/\s|\./g, "")}`,
    brand: "Samsung", series: "PM893", model: String(model), capacity: String(capacity), imageFile: "samsung-pm893.webp",
    price: Number(price), interfaceName: "SATA 6Gb/s", formFactor: "2.5-inch 7mm", read: 550, write: Number(write),
    randomRead: "98K IOPS", randomWrite: String(randomWrite), dwpd: "1 DWPD", nand: "Samsung V-NAND TLC",
    specSource: SAMSUNG_PM893_SPEC, priceSource: "https://www.newegg.com/p/N82E16820147856",
  })),

  ...[
    ["960 GB", "MTFDDAK960TGA", 185], ["1.92 TB", "MTFDDAK1T9TGA", 360],
    ["3.84 TB", "MTFDDAK3T8TGA", 710], ["7.68 TB", "MTFDDAK7T6TGA", 1420],
  ].map(([capacity, model, price]) => ssd({
    slug: `drive-micron-5400-pro-${String(capacity).toLowerCase().replace(/\s|\./g, "")}`,
    brand: "Micron", series: "5400 PRO", model: String(model), capacity: String(capacity), imageFile: "micron-5400-pro.webp",
    price: Number(price), interfaceName: "SATA 6Gb/s", formFactor: "2.5-inch 7mm", read: 540, write: 520,
    randomRead: "95K IOPS", randomWrite: "37K IOPS", dwpd: "Up to 1.5 DWPD", nand: "176-layer 3D TLC",
    specSource: MICRON_5400_SPEC, priceSource: "https://www.micron.com/products/storage/ssd/data-center-ssd/5400-sata-ssd",
  })),

  ...[
    ["960 GB", "SSDSC2KB960GZ1", 175], ["1.92 TB", "SSDSC2KB019TZ1", 340],
    ["3.84 TB", "SSDSC2KB038TZ1", 670], ["7.68 TB", "SSDSC2KB076TZ1", 1320],
  ].map(([capacity, model, price]) => ssd({
    slug: `drive-solidigm-d3-s4520-${String(capacity).toLowerCase().replace(/\s|\./g, "")}`,
    brand: "Solidigm", series: "D3-S4520", model: String(model), capacity: String(capacity), imageFile: "solidigm-d3-s4520.webp",
    price: Number(price), interfaceName: "SATA 6Gb/s", formFactor: "2.5-inch 7mm", read: 550, write: 510,
    randomRead: "86K IOPS", randomWrite: "30K IOPS", dwpd: "1 DWPD", nand: "144-layer 3D TLC",
    specSource: SOLIDIGM_SPEC, priceSource: "https://www.solidigm.com/products/data-center/d3/s4520.html",
  })),

  ...[
    ["1.92 TB", "KCD81RUG1T92", 390, 1550, "1,000K IOPS"],
    ["3.84 TB", "KCD81RUG3T84", 690, 3100, "1,100K IOPS"],
    ["7.68 TB", "KCD81RUG7T68", 1250, 6000, "1,250K IOPS"],
    ["15.36 TB", "KCD81RUG15T3", 2450, 6000, "1,250K IOPS"],
  ].map(([capacity, model, price, write, randomRead]) => ssd({
    slug: `drive-kioxia-cd8-r-${String(capacity).toLowerCase().replace(/\s|\./g, "")}`,
    brand: "KIOXIA", series: "CD8-R", model: String(model), capacity: String(capacity), imageFile: "kioxia-cd8-r.webp",
    price: Number(price), interfaceName: "PCIe 4.0 x4 NVMe", formFactor: "2.5-inch U.3 15mm", read: 7200, write: Number(write),
    randomRead: String(randomRead), randomWrite: "200K IOPS", dwpd: "1 DWPD", nand: "112-layer BiCS FLASH 3D TLC",
    specSource: KIOXIA_SPEC, priceSource: "https://americas.kioxia.com/en-us/business/ssd/data-center-ssd/cd8-r.html",
  })),

  ...[
    ["1.92 TB", "MZQL21T9HCJR", 420, 6800, 2700, "850K IOPS", "130K IOPS"],
    ["3.84 TB", "MZQL23T8HCLS", 760, 6900, 4100, "1,000K IOPS", "180K IOPS"],
    ["7.68 TB", "MZQL27T6HBLA", 1380, 6700, 4000, "1,100K IOPS", "200K IOPS"],
  ].map(([capacity, model, price, read, write, randomRead, randomWrite]) => ssd({
    slug: `drive-samsung-pm9a3-${String(capacity).toLowerCase().replace(/\s|\./g, "")}`,
    brand: "Samsung", series: "PM9A3", model: String(model), capacity: String(capacity), imageFile: "samsung-pm9a3.webp",
    price: Number(price), interfaceName: "PCIe 4.0 x4 NVMe", formFactor: "2.5-inch U.2 15mm", read: Number(read), write: Number(write),
    randomRead: String(randomRead), randomWrite: String(randomWrite), dwpd: "1 DWPD", nand: "Samsung V-NAND TLC",
    specSource: SAMSUNG_PM9A3_SPEC, priceSource: "https://semiconductor.samsung.com/ssd/datacenter-ssd/pm9a3/",
  })),
];

export const DRIVE_CATALOG: DriveCatalogItem[] = [...hdds, ...ssds];

if (DRIVE_CATALOG.filter((item) => item.category === "Enterprise HDD").length < 20) throw new Error("drive_catalog_requires_20_hdds");
if (DRIVE_CATALOG.filter((item) => item.category === "Enterprise SSD").length < 20) throw new Error("drive_catalog_requires_20_ssds");
if (new Set(DRIVE_CATALOG.map((item) => item.slug)).size !== DRIVE_CATALOG.length) throw new Error("drive_catalog_slugs_must_be_unique");
