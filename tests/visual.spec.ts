import { test, expect } from '@playwright/test';

test.describe('Regressão Visual', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/test/reset');
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Snapshot Desktop: Home', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('desktop-home.png', { maxDiffPixelRatio: 0.1 });
  });

  test('Snapshot Desktop: Detalhe do NFT', async ({ page }) => {
    await page.goto('/nft/nft_1');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('desktop-detail.png', { maxDiffPixelRatio: 0.1 });
  });

  test('Snapshot Desktop: Carrinho', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('desktop-cart.png', { maxDiffPixelRatio: 0.1 });
  });

  test('Snapshot Desktop: Login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot('desktop-login.png', { maxDiffPixelRatio: 0.1 });
  });
});
