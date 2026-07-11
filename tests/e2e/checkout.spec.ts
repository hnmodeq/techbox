import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('checkout page makes it clear payments are disabled', async ({ page }) => {
    await page.goto('/shop/checkout?pay=mock&amount=100000');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('فروشگاه در حال حاضر فقط کاتالوگ است')).toBeVisible();
    await expect(page.getByText('بازگشت به فروشگاه')).toBeVisible();
  });
});
