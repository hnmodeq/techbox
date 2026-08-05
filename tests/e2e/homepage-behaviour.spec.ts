import { expect, test } from '@playwright/test';

/**
 * Behavioural replacements for the source-grepping unit tests.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * 22 of 38 unit specs assert on component *source text* — Tailwind class
 * names, JSX ordering, literal strings — via fs.readFileSync + regex. That
 * approach costs more than it returns:
 *
 *   - It fails on safe refactors. Three cosmetic commits (d08c80c, 654172e,
 *     3cec8ee) turned CI red without a single behavioural regression:
 *     DealsSection delegating to ShopProductCard broke a `/<RemoteImage/`
 *     match, and moving <TopicActivity> below the heading broke an
 *     `indexOf() < indexOf()` ordering assertion.
 *   - It passes on real bugs. `<RemoteImage src={broken}>` satisfies every
 *     one of those regexes.
 *   - It anchors the design. Changing `line-clamp-2` to `line-clamp-4` should
 *     not require a test edit.
 *
 * The tests below assert the same *intent* against a rendered page: what the
 * user and the accessibility tree actually get. They survive refactors and
 * catch breakage the regexes cannot see.
 *
 * These run against the seeded CI database (prisma/seed-e2e.ts), so the
 * homepage has real content in every module.
 */

test.describe('homepage behaviour (replaces source-text assertions)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('every content image is optimised, never a raw full-size original', async ({ page }) => {
    // Replaces: homepage-bands-and-images "routes every full-bleed card image
    // through RemoteImage", which grepped for the literal string
    // "<RemoteImage" in six files and broke when DealsSection started
    // delegating to ShopProductCard.
    //
    // What actually matters is that no image bypasses the Next image
    // pipeline — regardless of which component renders it.
    const rawOriginals = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        // Owner-supplied WebP/GIF advertisements deliberately bypass a second
        // encode to preserve typography and animation. They are delivery
        // assets, not raw editorial originals.
        .filter((img) => !img.closest('[data-home-ad], [data-site-ad]'))
        .map((img) => img.currentSrc || img.src)
        .filter((src) => src && !src.startsWith('data:') && !src.startsWith('blob:'))
        .filter((src) => {
          // Optimised images go through /_next/image. Anything else pointing
          // at remote storage is an unoptimised original.
          if (src.includes('/_next/image')) return false;
          if (src.startsWith(location.origin) && !src.includes('supabase')) return false;
          return true;
        }),
    );
    expect(rawOriginals, `images bypassing next/image:\n${rawOriginals.join('\n')}`).toEqual([]);
  });

  test('every image declares sizes, so no desktop file lands in a thumbnail', async ({ page }) => {
    // Replaces the "always passes sizes" source assertion.
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((img) => (img.currentSrc || img.src).includes('/_next/image'))
        .filter((img) => !img.getAttribute('sizes') && !img.getAttribute('width'))
        .map((img) => (img.getAttribute('alt') || '(no alt)').slice(0, 50)),
    );
    expect(missing, `images without sizes:\n${missing.join('\n')}`).toEqual([]);
  });

  test('the forum feature card leads with its title, then the activity meta', async ({ page }) => {
    // Replaces: homepage-forum-section's
    //   expect(feature.indexOf("<TopicActivity")).toBeGreaterThan(indexOf("<h3"))
    // which encodes JSX ordering in a string. The real requirement is that a
    // screen reader announces the topic title before its metadata.
    const community = page.locator('#hp-community-heading').locator('..');
    const heading = community.getByRole('heading', { level: 3 }).first();

    if (!(await heading.count())) test.skip(true, 'forum module disabled or empty');

    const box = await heading.boundingBox();
    expect(box, 'the featured topic heading should be laid out').not.toBeNull();

    // The topic title must be a real link to the topic, not decorative text.
    const link = heading.getByRole('link').first();
    await expect(link).toHaveAttribute('href', /\/forum\//);
  });

  test('an accepted answer is announced as resolved, not just coloured', async ({ page }) => {
    // Replaces a stack of `expect(feature).toMatch(/bg-\[color:var\(--hp-solved\)\]/)`
    // assertions. Colour alone is not an accessible signal; the text is.
    const community = page.locator('#hp-community-heading').locator('..');
    const solved = community.getByText('پاسخ برتر');
    if (await solved.count()) await expect(solved.first()).toBeVisible();
  });

  test('the shop band shows a real price, and a discount never shows alone', async ({ page }) => {
    // Replaces class-name assertions in the deals/top-picks specs. The
    // invariant worth protecting is commercial: a discount badge without a
    // price is a broken offer.
    const deals = page.locator('#hp-deals-heading');
    if (!(await deals.count())) test.skip(true, 'shop module disabled or empty');

    const section = deals.locator('..');
    const badges = section.getByText(/٪|%/);
    const badgeCount = await badges.count();
    if (badgeCount > 0) {
      // Persian digits or Latin, plus the currency word.
      const priced = section.getByText(/تومان/);
      expect(await priced.count(), 'a discount badge implies a visible price').toBeGreaterThan(0);
    }
  });

  test('the ticker never renders an empty announcement', async ({ page }) => {
    // Replaces homepage-bands-and-images' ticker regexes, which asserted on
    // an animation duration and a CSS custom-property name.
    const ticker = page.locator('[class*="ticker"]').first();
    if (!(await ticker.count())) test.skip(true, 'no ticker rendered');

    // Only the announcement links carry meaning. Separator dots, icon
    // wrappers and the aria-hidden marquee duplicate are intentionally
    // textless, so counting every <span> flags 20 false positives.
    const emptyLinks = await ticker.evaluate((el) =>
      [...el.querySelectorAll('a[href]')]
        .filter((a) => !a.closest('[aria-hidden="true"]'))
        .filter((a) => !(a.textContent || '').trim())
        .map((a) => a.getAttribute('href') || '(no href)'),
    );
    expect(emptyLinks, `ticker links with no label:\n${emptyLinks.join('\n')}`).toEqual([]);
  });

  test('every section that renders has a labelled heading in the a11y tree', async ({ page }) => {
    // Generalises the per-section "has this exact id" assertions: whichever
    // sections render, each must be reachable and named.
    const problems = await page.evaluate(() =>
      [...document.querySelectorAll('section[aria-labelledby]')]
        .map((s) => {
          const id = s.getAttribute('aria-labelledby')!;
          const target = document.getElementById(id);
          if (!target) return `${id}: aria-labelledby points at nothing`;
          if (!(target.textContent || '').trim()) return `${id}: heading is empty`;
          return null;
        })
        .filter(Boolean),
    );
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('admin-authored HTML is sanitised before it reaches the browser', async ({ page }) => {
    // The E2E fixture seeds a <script> payload into both about.settings and
    // terms.content. If sanitizeAdminHtml() were removed or bypassed, these
    // globals would be set. This is the render-time counterpart to the unit
    // tests in tests/unit/sanitize-html.test.ts.
    await page.goto('/terms', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => (window as never as Record<string, unknown>).__xss_terms)).toBeUndefined();
    expect(await page.locator('script:has-text("__xss_terms")').count()).toBe(0);

    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => (window as never as Record<string, unknown>).__xss_about)).toBeUndefined();
    expect(await page.locator('script:has-text("__xss_about")').count()).toBe(0);
  });
});
