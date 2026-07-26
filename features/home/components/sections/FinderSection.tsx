/**
 * §4 · Global Finder — Tom's Guide `product-finder-1` ("Find your next TV")
 *
 * Values below are lifted verbatim from TG's live CSS:
 *   .help__widget  { border-radius: 25px; background: brand; }
 *   @media (min-width: 900px) { padding: 20px 45px 70px; }
 *   .help__search  { background: #fff; border-radius: 1rem; padding: .5rem; margin-bottom: 25px; }
 *   .help__input::placeholder { color: #64748b; }
 *   .help__links   { display: flex; flex-wrap: wrap; gap: 8px; }
 *   .help__link    { padding: 8px 24px; border: 2px solid #fff; border-radius: 200px;
 *                    background: transparent; font-size: 1rem; transition: all .2s ease; }
 *   .help__link:hover { transform: translateY(-2px); }
 *   .help__submit  { width: 40px; height: 40px; }
 *   decorative disks: 230px and 130px
 *
 * The heading uses .hp-gradient-text, which is @supports-guarded in
 * design/globals.css — background-clip:text failing would otherwise
 * render the title invisible rather than merely unstyled.
 *
 * Submits GET to the existing /search route, so every query flows through
 * lib/search.ts and is recorded by lib/search-log.ts.
 *
 * Server Component — a plain GET form needs no JS.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §4
 */
import * as React from "react";
import Link from "next/link";

export type FinderChip = { labelFa: string; href: string };

export type FinderSectionProps = {
  /** From SiteSetting `home.finder.chips`; falls back to real category searches. */
  chips?: FinderChip[];
  title?: string;
};

const HEADING_ID = "hp-finder-heading";

/**
 * Fallback chips. Each maps to a query that returns real catalogue rows —
 * a chip leading to an empty result page would be worse than no chip.
 */
const DEFAULT_CHIPS: FinderChip[] = [
  { labelFa: "ذخیره‌ساز شبکه (NAS)", href: "/search?q=NAS" },
  { labelFa: "مناسب بکاپ سازمانی", href: "/search?q=%D8%A8%DA%A9%D8%A7%D9%BE" },
  { labelFa: "رک‌مونت و دیتاسنتر", href: "/search?q=%D8%B1%DA%A9%E2%80%8C%D9%85%D9%88%D9%86%D8%AA" },
  { labelFa: "دارای گارانتی رسمی", href: "/search?q=%DA%AF%D8%A7%D8%B1%D8%A7%D9%86%D8%AA%DB%8C" },
];

export function FinderSection({
  chips,
  title = "دنبال چی می‌گردی؟",
}: FinderSectionProps) {
  const links = chips?.length ? chips : DEFAULT_CHIPS;

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="w-full px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[var(--hp-r-finder)] bg-[color:var(--hp-brand)] px-6 pb-12 pt-8 md:px-[45px] md:pb-[70px] md:pt-5 dark:border dark:border-white/[0.08]">
          {/* Decorative disks — TG places two, 230px and 130px, bleeding
              off opposite corners. Mirrored for RTL. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 start-0 h-[230px] w-[230px] -translate-x-1/2 translate-y-[70%] rounded-full bg-white/[0.07] rtl:translate-x-1/2"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 end-0 h-[130px] w-[130px] translate-x-1/4 translate-y-[75%] rounded-full bg-white/[0.07] rtl:-translate-x-1/4"
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-4 start-4 h-[88px] w-[88px] opacity-[0.12]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>

          <div className="relative mx-auto max-w-3xl">
            <h2
              id={HEADING_ID}
              className="hp-gradient-text mb-[30px] text-center text-2xl font-medium tracking-[0.4px] md:mb-6 md:text-3xl"
            >
              {title}
            </h2>

            {/* GET so the query lands in the URL and the existing /search
                page (and SearchLog) handle it — no client JS required. */}
            <form
              action="/search"
              method="GET"
              role="search"
              className="mb-[25px] flex items-center gap-2 rounded-2xl bg-white p-2"
            >
              <label htmlFor="hp-finder-q" className="sr-only">
                جست‌وجو در تکباکس
              </label>
              <svg
                aria-hidden="true"
                className="ms-2 h-5 w-5 shrink-0 text-[#64748b]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                id="hp-finder-q"
                name="q"
                type="search"
                required
                placeholder="مثلاً: ذخیره‌ساز مناسب بکاپ ۳۰ کاربر"
                className="min-w-0 flex-1 bg-transparent p-1.5 text-lg text-slate-700 placeholder:text-[#64748b] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="جست‌وجو"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--hp-accent)] text-lg text-white transition-opacity hover:opacity-90"
              >
                <span aria-hidden="true">←</span>
              </button>
            </form>

            <ul className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center">
              {links.map((chip) => (
                <li key={chip.href} className="flex">
                  <Link
                    href={chip.href}
                    className="flex w-full items-center justify-center rounded-[200px] border-2 border-white px-6 py-2 text-center text-[15px] leading-5 text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transform-none md:text-base"
                  >
                    {chip.labelFa}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinderSection;
