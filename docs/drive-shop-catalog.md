# Enterprise drive catalogue provenance

The drive shop is database-backed. `scripts/content/drive-catalog.ts` is the
idempotent source manifest used to create the initial 20 HDD + 20 SSD rows;
after import, ordinary Shop admin editing and the currency pipeline remain
authoritative.

## Product/specification sources

| Family | Primary specification source |
|---|---|
| Seagate Exos X24/X22/X20/X18 | Seagate Exos X24/X family data sheets and product manuals |
| Western Digital Ultrastar DC HC580/570/560/550 | Western Digital Ultrastar data-center product pages |
| Toshiba MG10/MG09/MG08 | Toshiba Storage enterprise HDD product pages |
| Seagate IronWolf Pro | Seagate IronWolf Pro product manual |
| Samsung PM893 | Samsung PM893 data sheet |
| Micron 5400 PRO | Micron 5400 product brief |
| Solidigm D3-S4520 | Solidigm D3-S4520 product/configuration pages |
| KIOXIA CD8-R | KIOXIA CD8-R product brief |
| Samsung PM9A3 | Samsung PM9A3 data sheet |

The exact source URL is also stored on every product as
`specs["Specification Source"]`. Capacity, interface, form factor, sequential
performance, workload/endurance, warranty, and reliability fields were taken
from those manufacturer sources. The catalogue deliberately tells buyers to
check the exact model against their storage vendor's compatibility list.

## Images

Nine product-family visuals are stored as real 1000×1000 WebP files at quality
94 under `public/assets/shop/drives/`. The production import uploads those
files to the public Supabase `techbox` bucket under `shop/drives/` and stores
the resulting public URL on each product.

Sources used for the product-family visuals:

- Seagate Exos X24 product media / Pangoly product image
- Western Digital official Ultrastar DC HC580 media
- Toshiba Storage official MG-series product media
- Seagate IronWolf Pro ST24000NT002 product image (Avendor listing)
- Samsung Semiconductor official PM893 media
- Micron official 5400 media
- Solidigm official D3-S4520 media
- KIOXIA official CD8-R media
- Samsung PM9A3 product image

Because capacities in one family use the same enclosure, variants share the
family visual while retaining an exact model, capacity, SKU and specification
record.

## Price authority

`sourcePriceAmount` is a USD reference input checked on 2026-08-04 against the
manufacturer/distributor/retailer URL stored as `specs["Price Reference"]`.
It is not the public toman price. Public prices continue to be calculated by
the existing server-side currency-rate, per-product adjustment and seller
benefit pipeline. Admins can update a source price without changing this
manifest or the frontend.
