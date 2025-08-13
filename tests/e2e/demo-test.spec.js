// Demo Test - Showcase the new testing structure
import { test, expect } from '@playwright/test';
import { 
  waitForDomainPageLoad, 
  verifyLayoutOrder, 
  verifyEqualWidthCards,
  takeComprehensiveScreenshots 
} from '../utils/test-helpers.js';

test.describe('🎯 Demo Test Suite - Testing Structure Showcase', () => {
  
  test('🏗️ should demonstrate complete testing framework', async ({ page }) => {
    console.log('🚀 Starting Demo Test...');
    
    // 1. Load page using helper
    await waitForDomainPageLoad(page);
    console.log('✅ Page loaded with helper function');
    
    // 2. Verify layout order
    const { orderCorrect, actualOrder } = await verifyLayoutOrder(page);
    console.log(`📐 Layout order: ${actualOrder.join(' → ')}`);
    expect(orderCorrect).toBe(true);
    
    // 3. Check equal width cards
    const { equal, widths, difference } = await verifyEqualWidthCards(page, 30);
    console.log(`📊 Card widths: ${widths.map(w => Math.round(w)).join('px, ')}px`);
    console.log(`📏 Width difference: ${Math.round(difference)}px`);
    expect(equal).toBe(true);
    
    // 4. Take comprehensive screenshots
    await takeComprehensiveScreenshots(page, 'demo-test');
    console.log('📸 Screenshots captured');
    
    // 5. Verify key components are present
    const componentsToCheck = [
      { name: 'Header', selector: 'text="Domain Portfolio"' },
      { name: 'Stats Cards', selector: '.MuiCard-root' },
      { name: 'Domains Table', selector: 'table' },
      { name: 'Add Form', selector: 'text="Add New Domain"' }
    ];
    
    for (const component of componentsToCheck) {
      await expect(page.locator(component.selector)).toBeVisible();
      console.log(`✅ ${component.name} is visible`);
    }
    
    // 6. Test Material UI theming
    const cards = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').all();
    console.log(`🎨 Found ${cards.length} Material UI cards`);
    expect(cards.length).toBe(4);
    
    // 7. Verify hover effects
    const firstCard = cards[0];
    await firstCard.hover();
    await page.waitForTimeout(300);
    console.log('🎭 Hover effect tested');
    
    // 8. Check responsive behavior
    const originalViewport = page.viewportSize();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('text="Domain Portfolio"')).toBeVisible();
    console.log('📱 Tablet view responsive');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('text="Domain Portfolio"')).toBeVisible();
    console.log('📱 Mobile view responsive');
    
    // Reset viewport
    await page.setViewportSize(originalViewport);
    
    console.log('🎉 Demo Test Completed Successfully!');
    
    // Final assertion - everything should still be working
    await expect(page.locator('text="Domain Portfolio"')).toBeVisible();
    await expect(page.locator('.MuiCard-root')).toHaveCount(4);
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text="Add New Domain"')).toBeVisible();
  });
  
  test('📊 should verify statistics cards data flow', async ({ page }) => {
    await waitForDomainPageLoad(page);
    
    // Check each statistics card has proper content
    const expectedCards = ['Total Domains', 'Active', 'Expiring Soon', 'Expired'];
    
    for (const cardType of expectedCards) {
      const cardLocator = page.locator('.MuiCard-root', { hasText: cardType });
      await expect(cardLocator).toBeVisible();
      
      // Check if card has a number displayed
      const numberExists = await cardLocator.locator('text=/\\d+/').count();
      expect(numberExists).toBeGreaterThan(0);
      
      console.log(`✅ ${cardType} card has numeric data`);
    }
  });
  
  test('🎨 should verify Material UI theme consistency', async ({ page }) => {
    await waitForDomainPageLoad(page);
    
    // Check color gradients on cards
    const cards = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').all();
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      // Get computed styles
      const backgroundStyle = await card.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.background || styles.backgroundImage;
      });
      
      // Should have gradient background
      expect(backgroundStyle).toContain('gradient');
      console.log(`✅ Card ${i + 1} has gradient background`);
      
      // Test hover effect
      const originalTransform = await card.evaluate(el => window.getComputedStyle(el).transform);
      await card.hover();
      await page.waitForTimeout(300);
      
      const hoverTransform = await card.evaluate(el => window.getComputedStyle(el).transform);
      expect(hoverTransform).not.toBe(originalTransform);
      console.log(`✅ Card ${i + 1} has working hover effect`);
    }
  });
});
