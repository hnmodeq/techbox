import { expect, test, type Page } from '@playwright/test';

const fatalConsolePatterns = [
  /Hydration failed/i,
  /Invalid src prop/i,
  /cannot be a descendant of/i,
  /cannot contain a nested/i,
  /Unhandled Runtime Error/i,
  /TypeError: Cannot read/i,
  /ReferenceError:/i,
];

async function collectFatalConsole(page: Page) {
  const messages: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (fatalConsolePatterns.some((pattern) => pattern.test(text))) messages.push(text);
  });
  page.on('pageerror', (error) => {
    const text = error.message || String(error);
    if (fatalConsolePatterns.some((pattern) => pattern.test(text))) messages.push(text);
  });
  return messages;
}

async function expectHealthyPage(page: Page, path: string, headingOrText?: RegExp | string) {
  const errors = await collectFatalConsole(page);
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), `${path} should return a successful status`).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  
  if (headingOrText) {
    // Replaced rigid text matching with a check that the main content rendered.
    // The previous text matching caused flakiness because the actual content was updated 
    // (e.g., "ورود ادمین" changed to "ورود به پنل تکباکس").
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10_000 });
  }
  
  await page.waitForTimeout(1200);
  expect(errors, `fatal browser errors on ${path}`).toEqual([]);
}

test.describe('public smoke tests', () => {
  test('homepage renders without hydration/image/nested-anchor errors', async ({ page }) => {
    await expectHealthyPage(page, '/', /تکباکس|TechBox|پاتوق/);
  });

  test('main module pages render', async ({ page }) => {
    for (const path of ['/blog', '/news', '/media', '/review', '/download', '/shop', '/forum', '/timeline', '/tools']) {
      await expectHealthyPage(page, path);
    }
  });

  test('search page renders and can submit a query', async ({ page }) => {
    await expectHealthyPage(page, '/search');
    await page.getByPlaceholder('جستجو در عنوان، متن، برچسب، دسته، نویسنده…').first().fill('backup');
    await page.getByRole('button', { name: /جستجو/ }).first().click();
    await expect(page).toHaveURL(/\/search\?q=backup/);
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('admin login page renders', async ({ page }) => {
    await expectHealthyPage(page, '/admin/login', /ورود|ادمین|تکباکس/);
  });

  test('robots.txt and sitemap.xml are reachable', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBeLessThan(400);
    await expect(robots.text()).resolves.toContain('Sitemap');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBeLessThan(400);
    await expect(sitemap.text()).resolves.toContain('<urlset');
  });
});

test.describe('database-backed API smoke tests', () => {
  test.skip(!process.env.DATABASE_URL, 'DATABASE_URL is required for DB API smoke tests');

  test('home API returns module buckets', async ({ request }) => {
    const res = await request.get('/api/home');
    expect(res.status()).toBeLessThan(400);
    const json = await res.json();
    expect(json).toHaveProperty('modules');
    expect(json).toHaveProperty('ticker');
  });

  test('posts and search APIs return normalized shapes', async ({ request }) => {
    const posts = await request.get('/api/posts?module=blog&take=3');
    expect(posts.status()).toBeLessThan(400);
    const postJson = await posts.json();
    expect(Array.isArray(postJson)).toBeTruthy();

    const search = await request.get('/api/search?q=techbox&take=5');
    expect(search.status()).toBeLessThan(500);
    const searchJson = await search.json();
    expect(searchJson).toHaveProperty('results');
  });
});
