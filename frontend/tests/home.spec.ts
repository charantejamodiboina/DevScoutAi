import { test, expect } from '@playwright/test';

test('DevScout homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/DevScout/i);
});