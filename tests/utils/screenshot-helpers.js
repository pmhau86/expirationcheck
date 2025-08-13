// Screenshot Helper Functions for Visual Testing

/**
 * Take full page screenshot with consistent naming
 */
async function takeFullPageScreenshot(page, name, options = {}) {
  const defaultOptions = {
    fullPage: true,
    animations: 'disabled',
    ...options
  };
  
  await page.screenshot({
    path: `tests/fixtures/screenshots/${name}-full.png`,
    ...defaultOptions
  });
}

/**
 * Take screenshot of specific component
 */
async function takeComponentScreenshot(page, selector, name, options = {}) {
  const element = page.locator(selector);
  await element.screenshot({
    path: `tests/fixtures/screenshots/${name}-component.png`,
    ...options
  });
}

/**
 * Take screenshots at different viewport sizes
 */
async function takeResponsiveScreenshots(page, name) {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500); // Wait for resize
    
    await page.screenshot({
      path: `tests/fixtures/screenshots/${name}-${viewport.name}.png`,
      fullPage: true
    });
  }
  
  // Reset to desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
}

/**
 * Take before/after screenshots for comparison
 */
async function takeBeforeAfterScreenshots(page, name, actionCallback) {
  // Before screenshot
  await page.screenshot({
    path: `tests/fixtures/screenshots/${name}-before.png`,
    fullPage: true
  });
  
  // Perform action
  await actionCallback(page);
  
  // After screenshot
  await page.screenshot({
    path: `tests/fixtures/screenshots/${name}-after.png`,
    fullPage: true
  });
}

/**
 * Take screenshot of hover states
 */
async function takeHoverScreenshots(page, selector, name) {
  const element = page.locator(selector);
  
  // Normal state
  await element.screenshot({
    path: `tests/fixtures/screenshots/${name}-normal.png`
  });
  
  // Hover state
  await element.hover();
  await page.waitForTimeout(300); // Wait for animation
  await element.screenshot({
    path: `tests/fixtures/screenshots/${name}-hover.png`
  });
}

/**
 * Compare screenshots (basic implementation)
 */
async function compareScreenshots(page, name, threshold = 0.1) {
  const currentScreenshot = await page.screenshot({ fullPage: true });
  // Note: In a real implementation, you'd compare with a baseline image
  // This is a placeholder for the concept
  return {
    passed: true,
    difference: 0,
    threshold,
    screenshot: currentScreenshot
  };
}

/**
 * Take screenshot with annotation
 */
async function takeAnnotatedScreenshot(page, name, annotations = []) {
  // Add annotations to page (this would require additional implementation)
  for (const annotation of annotations) {
    await page.locator(annotation.selector).highlight({
      color: annotation.color || 'red'
    });
  }
  
  await page.screenshot({
    path: `tests/fixtures/screenshots/${name}-annotated.png`,
    fullPage: true
  });
}

/**
 * Capture element dimensions for layout testing
 */
async function captureElementDimensions(page, selectors) {
  const dimensions = {};
  
  for (const [name, selector] of Object.entries(selectors)) {
    const element = page.locator(selector);
    const box = await element.boundingBox();
    
    dimensions[name] = {
      x: box?.x || 0,
      y: box?.y || 0,
      width: box?.width || 0,
      height: box?.height || 0
    };
  }
  
  return dimensions;
}

/**
 * Take screenshot with grid overlay for alignment testing
 */
async function takeGridScreenshot(page, name, gridSize = 20) {
  // Add CSS grid overlay (this would require injecting CSS)
  await page.addStyleTag({
    content: `
      .test-grid-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
        background-size: ${gridSize}px ${gridSize}px;
        pointer-events: none;
        z-index: 9999;
      }
    `
  });
  
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.className = 'test-grid-overlay';
    document.body.appendChild(overlay);
  });
  
  await page.screenshot({
    path: `tests/fixtures/screenshots/${name}-grid.png`,
    fullPage: true
  });
  
  // Remove overlay
  await page.evaluate(() => {
    const overlay = document.querySelector('.test-grid-overlay');
    if (overlay) overlay.remove();
  });
}

export {
  takeFullPageScreenshot,
  takeComponentScreenshot,
  takeResponsiveScreenshots,
  takeBeforeAfterScreenshots,
  takeHoverScreenshots,
  compareScreenshots,
  takeAnnotatedScreenshot,
  captureElementDimensions,
  takeGridScreenshot
};
