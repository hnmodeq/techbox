import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('User can navigate to checkout page', async ({ page }) => {
    // Navigating directly to checkout logic mock page
    await page.goto('/shop/checkout?pay=mock&amount=100000');
    // Ensure the page renders without 500 error
    await expect(page.locator('text=ZarinPal')).toBeVisible();
  });
});
