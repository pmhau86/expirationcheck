// Domain Management E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Domain Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the domain management page
    await page.goto('http://localhost:5173/domains');
    await page.waitForLoadState('networkidle');
  });

  test('should display domain portfolio header', async ({ page }) => {
    // Check if the main header is visible
    const header = page.locator('h1:has-text("Domain Portfolio"), h3:has-text("Domain Portfolio")');
    await expect(header).toBeVisible();
  });

  test('should display statistics cards in correct order', async ({ page }) => {
    // Verify statistics cards are positioned under header
    const statsCards = page.locator('.MuiCard-root').first();
    await expect(statsCards).toBeVisible();
    
    // Check all 4 statistics cards are present
    const cardCount = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').count();
    expect(cardCount).toBe(4);
  });

  test('should have equal width statistics cards', async ({ page }) => {
    const cards = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').all();
    
    let widths = [];
    for (const card of cards) {
      const box = await card.boundingBox();
      if (box) widths.push(box.width);
    }
    
    // Check width difference is minimal (within 30px tolerance)
    if (widths.length > 1) {
      const maxWidth = Math.max(...widths);
      const minWidth = Math.min(...widths);
      const difference = maxWidth - minWidth;
      expect(difference).toBeLessThan(30);
    }
  });

  test('should display domains table', async ({ page }) => {
    // Check if domains table is visible
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check table headers
    const headers = ['Domain', 'Status', 'Issued Date', 'Expiry Date', 'Days Left', 'Actions'];
    for (const header of headers) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
  });

  test('should display add domain form', async ({ page }) => {
    // Check if add domain form is visible
    const addForm = page.locator('h5:has-text("Add New Domain")');
    await expect(addForm).toBeVisible();
    
    // Check form fields
    await expect(page.locator('input[name="domain"]')).toBeVisible();
    await expect(page.locator('input[name="issued_date"]')).toBeVisible();
    await expect(page.locator('input[name="expire_date"]')).toBeVisible();
    await expect(page.locator('button:has-text("Add Domain")')).toBeVisible();
  });

  test('should add new domain successfully', async ({ page }) => {
    // Fill out the add domain form
    await page.fill('input[name="domain"]', 'test-domain.com');
    await page.fill('input[name="issued_date"]', '2024-01-01');
    await page.fill('input[name="expire_date"]', '2025-01-01');
    
    // Submit the form
    await page.click('button:has-text("Add Domain")');
    
    // Wait for success message
    const successAlert = page.locator('.MuiAlert-root:has-text("successfully")');
    await expect(successAlert).toBeVisible({ timeout: 10000 });
  });

  test('should have responsive layout', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1, h3')).toBeVisible();
    
    // Test tablet layout  
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.MuiCard-root')).toBeVisible();
    
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.MuiGrid-container')).toBeVisible();
  });
});
