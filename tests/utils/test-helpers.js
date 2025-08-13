// Test Helper Functions
import { expect } from '@playwright/test';

/**
 * Wait for page to load completely with domain data
 */
async function waitForDomainPageLoad(page) {
  await page.goto('http://localhost:5173/domains');
  await page.waitForLoadState('networkidle');
  
  // Wait for key components to be visible
  await page.waitForSelector('text="Domain Portfolio"');
  await page.waitForSelector('.MuiCard-root');
  await page.waitForTimeout(2000); // Extra time for animations
}

/**
 * Get component positions for layout verification
 */
async function getComponentPositions(page) {
  const components = [];
  
  try {
    const headerPos = await page.locator('text="Domain Portfolio"').boundingBox();
    if (headerPos) components.push({ name: 'header', y: headerPos.y, element: 'header' });
    
    const statsPos = await page.locator('.MuiGrid-container').first().boundingBox();
    if (statsPos) components.push({ name: 'statistics', y: statsPos.y, element: 'stats-cards' });
    
    const tablePos = await page.locator('table').boundingBox();
    if (tablePos) components.push({ name: 'table', y: tablePos.y, element: 'domains-table' });
    
    const formPos = await page.locator('text="Add New Domain"').boundingBox();
    if (formPos) components.push({ name: 'form', y: formPos.y, element: 'add-form' });
    
  } catch (error) {
    console.log('Some components may not be visible:', error.message);
  }
  
  return components.sort((a, b) => a.y - b.y);
}

/**
 * Verify statistics cards have equal width
 */
async function verifyEqualWidthCards(page, tolerance = 30) {
  const cards = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').all();
  const widths = [];
  
  for (const card of cards) {
    const box = await card.boundingBox();
    if (box) widths.push(box.width);
  }
  
  if (widths.length > 1) {
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    const difference = maxWidth - minWidth;
    
    expect(difference).toBeLessThan(tolerance);
    return { widths, difference, equal: difference < tolerance };
  }
  
  return { widths, difference: 0, equal: true };
}

/**
 * Check if layout components are in correct order
 */
async function verifyLayoutOrder(page, expectedOrder = ['header', 'statistics', 'table', 'form']) {
  const components = await getComponentPositions(page);
  const actualOrder = components.map(c => c.name);
  
  // Check if actual order matches expected order
  const orderCorrect = expectedOrder.every((expected, index) => {
    return actualOrder[index] && actualOrder[index].includes(expected);
  });
  
  return { actualOrder, expectedOrder, orderCorrect, components };
}

/**
 * Add a test domain
 */
async function addTestDomain(page, domain = 'test-domain.com', issueDate = '2024-01-01', expireDate = '2025-01-01') {
  await page.fill('input[name="domain"]', domain);
  await page.fill('input[name="issued_date"]', issueDate);
  await page.fill('input[name="expire_date"]', expireDate);
  
  await page.click('button:has-text("Add Domain")');
  
  // Wait for success message
  const successAlert = page.locator('.MuiAlert-root:has-text("successfully")');
  await expect(successAlert).toBeVisible({ timeout: 10000 });
}

/**
 * Check responsive behavior across different screen sizes
 */
async function testResponsiveLayout(page) {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  const results = {};
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    // Check if key components are still visible
    const headerVisible = await page.locator('text="Domain Portfolio"').isVisible();
    const cardsVisible = await page.locator('.MuiCard-root').first().isVisible();
    const tableVisible = await page.locator('table').isVisible();
    
    results[viewport.name] = {
      headerVisible,
      cardsVisible,
      tableVisible,
      viewport: viewport
    };
  }
  
  return results;
}

/**
 * Take comprehensive screenshots for comparison
 */
async function takeComprehensiveScreenshots(page, testName = 'test') {
  const screenshotDir = 'tests/fixtures/screenshots';
  
  // Full page screenshot
  await page.screenshot({ 
    path: `${screenshotDir}/${testName}-full.png`, 
    fullPage: true 
  });
  
  // Header and stats section
  try {
    const headerSection = page.locator('text="Domain Portfolio"').locator('../..');
    await headerSection.screenshot({ 
      path: `${screenshotDir}/${testName}-header-stats.png` 
    });
  } catch (error) {
    console.log('Could not capture header section:', error.message);
  }
  
  // Table section
  try {
    const tableSection = page.locator('table').locator('..');
    await tableSection.screenshot({ 
      path: `${screenshotDir}/${testName}-table.png` 
    });
  } catch (error) {
    console.log('Could not capture table section:', error.message);
  }
}

/**
 * Verify Material UI theme consistency
 */
async function verifyThemeConsistency(page) {
  // Check if cards have gradient backgrounds
  const cards = await page.locator('.MuiGrid-container').first().locator('.MuiCard-root').all();
  let gradientCount = 0;
  
  for (const card of cards) {
    const styles = await card.evaluate(el => window.getComputedStyle(el));
    if ((styles.background || styles.backgroundImage).includes('gradient')) {
      gradientCount++;
    }
  }
  
  // Check for consistent hover effects
  const firstCard = page.locator('.MuiCard-root').first();
  await firstCard.hover();
  await page.waitForTimeout(300);
  
  const hoverStyles = await firstCard.evaluate(el => window.getComputedStyle(el));
  const hasHoverEffect = hoverStyles.transform && hoverStyles.transform !== 'none';
  
  return {
    totalCards: cards.length,
    cardsWithGradient: gradientCount,
    hasHoverEffect,
    themeConsistent: gradientCount === cards.length && hasHoverEffect
  };
}

export {
  waitForDomainPageLoad,
  getComponentPositions,
  verifyEqualWidthCards,
  verifyLayoutOrder,
  addTestDomain,
  testResponsiveLayout,
  takeComprehensiveScreenshots,
  verifyThemeConsistency
};
