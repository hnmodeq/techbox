import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('User can navigate to admin login and see form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('ورود به تکباکس');
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();
  });

  test('Fails to login with invalid credentials', async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!process.env.DATABASE_URL, 'DATABASE_URL is required for credential verification');
    await page.goto('/admin/login');
    await page.fill('input[autocomplete="username"]', 'wronguser');
    await page.fill('input[placeholder="••••••••"]', 'wrongpass');
    await page.locator('form').getByRole('button', { name: 'ورود', exact: true }).click();
    // The first request compiles the route in `next dev`; on the shared CI
    // runner that can exceed the suite-wide 7s assertion default even though
    // the API returns the correct 401 immediately after compilation.
    await expect(page.getByText(/نام کاربری یا رمز عبور اشتباه است|اطلاعات ورود صحیح نیست|خطا در ورود/)).toBeVisible({ timeout: 30_000 });
  });
});
