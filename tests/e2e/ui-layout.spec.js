// UI Layout & Visual Tests
import { test, expect } from '@playwright/test';

test.describe('UI Layout & Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/domains');
    await page.waitForLoadState('networkidle');
  });

  test('should have correct component ordering', async ({ page }) => {
    // Get Y positions of all major components to verify order
    const components = [];
    
    const headerPos = await page.locator('text="Domain Portfolio"').boundingBox();
    if (headerPos) components.push({ name: 'header', y: headerPos.y });
    
    const statsPos = await page.locator('.MuiGrid-container').first().boundingBox();
    if (statsPos) components.push({ name: 'stats', y: statsPos.y });
    
    const tablePos = await page.locator('table').boundingBox();
    if (tablePos) components.push({ name: 'table', y: tablePos.y });
    
    const formPos = await page.locator('text="Add New Domain"').boundingBox();
    if (formPos) components.push({ name: 'form', y: formPos.y });
    
    // Sort by Y position
    components.sort((a, b) => a.y - b.y);
    
    // Verify expected order: header -> stats -> table -> form
    expect(components[0].name).toBe('header');
    expect(components[1].name).toBe('stats');
    expect(components[2].name).toBe('table');
    expect(components[3].name).toBe('form');
  });

  test('should have color-coded statistics cards', async ({ page }) => {
    const cards = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').all();
    
    // Check each card has appropriate background gradient
    for (const card of cards) {
      const styles = await card.evaluate(el => window.getComputedStyle(el));
      expect(styles.background || styles.backgroundImage).toContain('gradient');
    }
  });

  test('should have proper card hover effects', async ({ page }) => {
    const firstCard = page.locator('.MuiGrid-container').first().locator('.MuiCard-root').first();
    
    // Get initial transform
    const initialTransform = await firstCard.evaluate(el => window.getComputedStyle(el).transform);
    
    // Hover over the card
    await firstCard.hover();
    await page.waitForTimeout(500); // Wait for animation
    
    // Check if transform changed (hover effect)
    const hoverTransform = await firstCard.evaluate(el => window.getComputedStyle(el).transform);
    expect(hoverTransform).not.toBe(initialTransform);
  });

  test('should take consistent screenshots', async ({ page }) => {
    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/full-layout.png', 
      fullPage: true 
    });
    
    // Take header section screenshot
    const headerSection = page.locator('text="Domain Portfolio"').locator('../..');
    await headerSection.screenshot({ 
      path: 'tests/fixtures/screenshots/header-stats-section.png' 
    });
    
    // Take table section screenshot
    const tableSection = page.locator('table').locator('..');
    await tableSection.screenshot({ 
      path: 'tests/fixtures/screenshots/domains-table.png' 
    });
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    
    // Should have at least one main heading
    expect(h1Count + h3Count).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
    
    // Check for proper button labels
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
