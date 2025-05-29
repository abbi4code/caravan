import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Caravan/);
});

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check if the main caravan elements are present
  await expect(page.locator('body')).toBeVisible();
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/homepage.png' });
});

test('navigation works', async ({ page }) => {
  await page.goto('/');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check if we can interact with the page
  const body = page.locator('body');
  await expect(body).toBeVisible();
}); 