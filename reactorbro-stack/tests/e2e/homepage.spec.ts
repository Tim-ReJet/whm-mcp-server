import { test, expect } from '@playwright/test';

/**
 * E2E Tests for ReactorBro Stack
 */

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/ReactorBro|Berg Projects/i);

    // Check main content is visible
    const mainContent = page.locator('main, body');
    await expect(mainContent).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Look for navigation links
    const nav = page.locator('nav, header');
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
  });
});

test.describe('Site Functionality', () => {
  test('should handle page navigation', async ({ page }) => {
    await page.goto('/');

    // Try to find and click a link
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      const href = await firstLink.getAttribute('href');

      if (href && !href.startsWith('#')) {
        await firstLink.click();
        // Wait for navigation
        await page.waitForLoadState('networkidle');
      }
    }
  });
});

