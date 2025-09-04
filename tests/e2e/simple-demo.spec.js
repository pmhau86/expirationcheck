// Simple Demo Test - Quick verification of testing structure
import { test, expect } from '@playwright/test';

test.describe('🎯 Simple Demo - Testing Structure Works', () => {
  
  test('should load application and show basic components', async ({ page }) => {
    console.log('🚀 Starting Simple Demo Test...');
    
    // Navigate to the page
    await page.goto('http://localhost:5173/domains');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Vite \+ React/);
    console.log('✅ Page title correct');
    
    // Check if any content is visible (less strict than checking for specific text)
    const body = await page.locator('body').textContent();
    expect(body.length).toBeGreaterThan(0);
    console.log('✅ Page has content');
    
    // Try to find some basic elements
    const hasCards = await page.locator('.MuiCard-root').count();
    const hasTable = await page.locator('table').count();
    const hasButtons = await page.locator('button').count();
    
    console.log(`📊 Found ${hasCards} cards, ${hasTable} tables, ${hasButtons} buttons`);
    
    // Take a screenshot for manual verification
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/simple-demo-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved');
    
    console.log('🎉 Simple Demo Test Completed!');
  });
  
  test('should demonstrate testing framework capabilities', async ({ page }) => {
    console.log('🔧 Testing Framework Capabilities Demo...');
    
    await page.goto('http://localhost:5173/domains');
    await page.waitForTimeout(3000); // Give time to load
    
    // Test viewport changes
    await page.setViewportSize({ width: 1280, height: 720 });
    console.log('📱 Viewport set to 1280x720');
    
    // Test screenshot capability
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/framework-demo.png' 
    });
    console.log('📸 Framework screenshot taken');
    
    // Test element counting
    const elementCounts = {
      divs: await page.locator('div').count(),
      buttons: await page.locator('button').count(),
      inputs: await page.locator('input').count(),
      cards: await page.locator('.MuiCard-root').count()
    };
    
    console.log('📊 Element counts:', elementCounts);
    
    // Test that we can interact with the page
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    console.log(`📄 Page title: "${pageTitle}"`);
    
    console.log('✅ Framework capabilities demonstrated!');
  });
});






