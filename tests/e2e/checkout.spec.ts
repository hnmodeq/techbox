import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('live checkout route renders the canonical cart flow', async ({ page }) => {
    await page.goto('/shop/checkout');

    await expect(page.getByRole('heading', { name: 'سبد خرید خالی است' })).toBeVisible();
    await expect(page.getByText('بازگشت به فروشگاه')).toBeVisible();
    await expect(page.getByText('فروشگاه در حال حاضر فقط کاتالوگ است')).toHaveCount(0);
  });
});
