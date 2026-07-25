import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('User can navigate to admin login and see form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('ورود به پنل تکباکس');
    await expect(page.locator('input[placeholder="username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();
  });

  test('Fails to login with invalid credentials', async ({ page }) => {
    test.skip(!process.env.DATABASE_URL, 'DATABASE_URL is required for credential verification');
    await page.goto('/admin/login');
    await page.fill('input[placeholder="username"]', 'wronguser');
    await page.fill('input[placeholder="••••••••"]', 'wrongpass');
    await page.getByRole('button', { name: 'ورود', exact: true }).click();
    await expect(page.getByText(/نام کاربری یا رمز عبور اشتباه است|خطا در ورود/)).toBeVisible();
  });
});
