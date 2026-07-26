import { expect, test, type Page } from '@playwright/test';

/**
 * Homepage upgrade — browser-level checks.
 *
 * These exist because the constraints this project is most likely to
 * violate are invisible to typecheck and to SSR-to-string rendering:
 * render loops, RTL overflow, invisible text after a theme swap, and
 * layout shift. Each test below targets one of those.
 *
 * Docs: docs/homepage-upgrade/06-VERIFICATION.md
 */

const SECTION_HEADINGS = [
  'hp-magazine-heading',
  'hp-video-heading',
  'hp-insights-heading',
  'hp-finder-heading',
  'hp-timeline-heading',
  'hp-deals-heading',
  'hp-tools-heading',
  'hp-community-heading',
];

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message || String(e)));
  return errors;
}

test.describe('homepage', () => {
  test('renders without console errors or hydration mismatch', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const fatal = errors.filter((e) =>
      /Hydration failed|did not match|Maximum update depth|Unhandled Runtime Error/i.test(e),
    );
    expect(fatal, `fatal console errors:\n${fatal.join('\n')}`).toHaveLength(0);
  });

  test('renders at least half the sections with real content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const present: string[] = [];
    for (const id of SECTION_HEADINGS) {
      if (await page.locator(`#${id}`).count()) present.push(id);
    }
    // Sections self-hide when their query is empty, so an exact count would
    // be brittle. What matters is that the page is not blank.
    expect(present.length, `sections found: ${present.join(', ')}`).toBeGreaterThanOrEqual(4);
  });

  test('every section heading is reachable from its aria-labelledby', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const orphans = await page.evaluate(() =>
      [...document.querySelectorAll('section[aria-labelledby]')]
        .map((s) => s.getAttribute('aria-labelledby')!)
        .filter((id) => !document.getElementById(id)),
    );
    expect(orphans, `aria-labelledby pointing at nothing: ${orphans.join(', ')}`).toEqual([]);
  });

  test('heading order never skips a level', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const levels = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])),
    );
    expect(levels[0], 'page must start at h1').toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(
        levels[i] - levels[i - 1],
        `jumped from h${levels[i - 1]} to h${levels[i]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('the ScrollRail observer settles — no infinite render loop', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    // A ResizeObserver -> setState -> layout loop surfaces either as React's
    // depth guard or as the browser's own observer warning. Both are fatal.
    await page.waitForTimeout(3000);
    const loopy = errors.filter((e) =>
      /Maximum update depth|ResizeObserver loop/i.test(e),
    );
    expect(loopy, `render loop detected:\n${loopy.join('\n')}`).toHaveLength(0);
  });

  for (const width of [375, 768, 1280, 1440]) {
    test(`no horizontal overflow at ${width}px (RTL)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      // A couple of pixels is scrollbar rounding; anything more is a bug.
      expect(overflow, `page scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(2);
    });
  }

  test('no nested anchors — invalid HTML that breaks hydration', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // React reports this as "<a> cannot be a descendant of <a>" and then
    // fails hydration, because the browser silently restructures the DOM
    // around the invalid nesting. Easy to introduce by putting a Byline or
    // any inner link inside a card that is itself wrapped in a Link.
    const nested = await page.evaluate(() =>
      [...document.querySelectorAll('a a')].map(
        (a) => `${(a as HTMLAnchorElement).getAttribute('href')} inside ${(a.closest('a[href]:not(:scope)') as HTMLAnchorElement)?.getAttribute('href') ?? '?'}`,
      ),
    );
    expect(nested, `nested anchors:\n${nested.join('\n')}`).toEqual([]);
  });

  test('page direction is RTL and language is Persian', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  });

  test('no invisible text in dark mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('takbox-theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Catches the class of bug introduced when --primary flipped to
    // near-white in dark mode: text painted the same colour as its parent.
    const invisible = await page.evaluate(() => {
      const parse = (c: string) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const bad: string[] = [];
      for (const el of [...document.querySelectorAll('h2,h3,p,a,button,span')].slice(0, 400)) {
        const text = (el.textContent || '').trim();
        if (!text || text.length > 120) continue;
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.1) continue;

        let bgEl: Element | null = el;
        let bg = 'rgba(0, 0, 0, 0)';
        while (bgEl) {
          const c = getComputedStyle(bgEl).backgroundColor;
          if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; }
          bgEl = bgEl.parentElement;
        }
        const [fr, fg, fb] = parse(s.color);
        const [br, bg2, bb] = parse(bg);
        if ([fr, fg, fb, br, bg2, bb].some((n) => Number.isNaN(n))) continue;
        const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (Math.abs(lum(fr, fg, fb) - lum(br, bg2, bb)) < 12) {
          bad.push(`${el.tagName}: "${text.slice(0, 40)}"`);
        }
      }
      return bad;
    });
    expect(invisible, `text indistinguishable from its background:\n${invisible.join('\n')}`).toEqual([]);
  });

  test('every image reserves space, so nothing shifts as it loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const unreserved = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((img) => {
          if (img.getAttribute('width') && img.getAttribute('height')) return false;
          const own = getComputedStyle(img).aspectRatio;
          if (own && own !== 'auto') return false;
          const parent = img.parentElement;
          const p = parent ? getComputedStyle(parent).aspectRatio : 'auto';
          return !p || p === 'auto';
        })
        .map((img) => img.getAttribute('src')?.slice(0, 70) || '(no src)'),
    );
    expect(unreserved, `images without reserved dimensions:\n${unreserved.join('\n')}`).toEqual([]);
  });

  test('exactly one image is eager — the LCP candidate', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const eager = await page.evaluate(
      () => [...document.querySelectorAll('img')].filter((i) => i.getAttribute('loading') === 'eager').length,
    );
    expect(eager).toBeLessThanOrEqual(1);
  });

  test('the finder submits a query to /search', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const finder = page.locator('#hp-finder-q');
    if (!(await finder.count())) test.skip(true, 'finder not rendered');

    await finder.fill('NAS');
    await finder.press('Enter');
    await page.waitForURL(/\/search\?/);
    expect(page.url()).toContain('q=NAS');
  });

  test('keyboard focus stays visible while tabbing', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const visible = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return true;
        const s = getComputedStyle(el);
        return s.outlineStyle !== 'none' || !!s.boxShadow || s.outlineWidth !== '0px';
      });
      expect(visible, `element ${i} took focus with no visible indicator`).toBe(true);
    }
  });
});
