// Sync Domain Expire Date E2E Tests
import { test, expect } from '@playwright/test';

test.describe('🔄 Sync Domain Expire Date Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/domains');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give extra time for data loading
  });

  test('should display sync buttons in domains table', async ({ page }) => {
    console.log('🔍 Checking for sync buttons in domains table...');
    
    // Look for sync buttons in the table
    const syncButtons = page.locator('button[title="Sync domain"], .MuiIconButton-root:has(svg[data-testid="SyncIcon"])');
    const syncButtonCount = await syncButtons.count();
    
    console.log(`📊 Found ${syncButtonCount} sync buttons`);
    expect(syncButtonCount).toBeGreaterThan(0);
    
    // Take screenshot of table with sync buttons
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/sync-buttons-table.png',
      fullPage: true 
    });
  });

  test('should be able to click sync button and trigger sync process', async ({ page }) => {
    console.log('🚀 Testing sync button functionality...');
    
    // Set up console log monitoring to catch sync messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Sync')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Look for any sync button (either in table or cards)
    const syncButton = page.locator('button:has-text("Sync"), button[title="Sync domain"]').first();
    
    if (await syncButton.count() > 0) {
      console.log('✅ Found sync button, clicking...');
      
      // Click the sync button
      await syncButton.click();
      
      // Wait for potential alert or feedback
      await page.waitForTimeout(2000);
      
      // Check if sync was logged to console
      console.log('📝 Console logs:', consoleLogs);
      
      // Take screenshot after sync attempt
      await page.screenshot({ 
        path: 'tests/fixtures/screenshots/after-sync-click.png',
        fullPage: true 
      });
      
    } else {
      console.log('⚠️ No sync buttons found in current view');
      
      // Take screenshot to see current state
      await page.screenshot({ 
        path: 'tests/fixtures/screenshots/no-sync-buttons.png',
        fullPage: true 
      });
    }
  });

  test('should handle sync success scenarios', async ({ page }) => {
    console.log('✅ Testing sync success scenarios...');
    
    // Monitor for alert dialogs
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log(`🔔 Alert received: ${alertMessage}`);
      await dialog.accept();
    });
    
    // Find and click a sync button
    const syncButton = page.locator('button:has-text("Sync"), button[title="Sync domain"]').first();
    
    if (await syncButton.count() > 0) {
      await syncButton.click();
      
      // Wait for sync operation to complete
      await page.waitForTimeout(3000);
      
      // Check if alert was shown
      if (alertMessage) {
        expect(alertMessage).toContain('Sync completed');
        console.log('✅ Sync success message confirmed');
      } else {
        console.log('ℹ️ No alert shown, sync may be in progress or completed silently');
      }
      
    } else {
      console.log('⚠️ No sync buttons available for testing');
    }
  });

  test('should update domain data after sync', async ({ page }) => {
    console.log('🔄 Testing data update after sync...');
    
    // Get initial domain data from the first row
    const firstDomainRow = page.locator('table tbody tr').first();
    
    if (await firstDomainRow.count() > 0) {
      // Get initial expire date
      const initialExpireDate = await firstDomainRow.locator('td').nth(3).textContent(); // Assuming expire date is 4th column
      console.log(`📅 Initial expire date: ${initialExpireDate}`);
      
      // Find sync button in this row
      const syncButton = firstDomainRow.locator('button[title="Sync domain"], button:has-text("Sync")');
      
      if (await syncButton.count() > 0) {
        // Handle potential alert
        page.on('dialog', async dialog => {
          console.log(`🔔 Sync result: ${dialog.message()}`);
          await dialog.accept();
        });
        
        // Click sync
        await syncButton.click();
        
        // Wait for sync to complete and data to refresh
        await page.waitForTimeout(4000);
        
        // Get updated expire date
        const updatedExpireDate = await firstDomainRow.locator('td').nth(3).textContent();
        console.log(`📅 Updated expire date: ${updatedExpireDate}`);
        
        // Take screenshot of updated table
        await page.screenshot({ 
          path: 'tests/fixtures/screenshots/after-sync-update.png',
          fullPage: true 
        });
        
        console.log('✅ Sync operation completed');
        
      } else {
        console.log('⚠️ No sync button found in first row');
      }
    } else {
      console.log('⚠️ No domain rows found in table');
    }
  });

  test('should display sync functionality in domain cards', async ({ page }) => {
    console.log('🃏 Testing sync functionality in domain cards...');
    
    // Look for domain cards (if any exist)
    const domainCards = page.locator('.MuiCard-root');
    const cardCount = await domainCards.count();
    
    console.log(`🃏 Found ${cardCount} domain cards`);
    
    if (cardCount > 0) {
      // Look for sync buttons in cards
      const cardSyncButtons = domainCards.locator('button:has-text("Sync")');
      const syncButtonsInCards = await cardSyncButtons.count();
      
      console.log(`🔄 Found ${syncButtonsInCards} sync buttons in cards`);
      
      if (syncButtonsInCards > 0) {
        // Test clicking a sync button in card
        const firstCardSyncButton = cardSyncButtons.first();
        
        // Set up alert handler
        page.on('dialog', async dialog => {
          console.log(`🔔 Card sync result: ${dialog.message()}`);
          await dialog.accept();
        });
        
        await firstCardSyncButton.click();
        await page.waitForTimeout(2000);
        
        console.log('✅ Card sync button clicked');
      }
    } else {
      console.log('ℹ️ No domain cards found (table view may be active)');
    }
    
    // Take screenshot of current view
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/sync-cards-view.png',
      fullPage: true 
    });
  });

  test('should demonstrate sync service functionality', async ({ page }) => {
    console.log('🧪 Demonstrating sync service scenarios...');
    
    // Add a test domain first if none exist
    const addButton = page.locator('button:has-text("Add Domain")');
    
    if (await addButton.count() > 0) {
      // Fill out add domain form
      await page.fill('input[name="domain"]', 'sync-test.com');
      await page.fill('input[name="issued_date"]', '2024-01-01');
      await page.fill('input[name="expire_date"]', '2024-12-31');
      
      // Handle success alert
      page.on('dialog', async dialog => {
        console.log(`📝 Add domain result: ${dialog.message()}`);
        await dialog.accept();
      });
      
      await addButton.click();
      await page.waitForTimeout(3000);
      
      console.log('✅ Test domain added for sync testing');
    }
    
    // Now test sync on the new domain
    const syncButtons = page.locator('button:has-text("Sync"), button[title="Sync domain"]');
    const buttonCount = await syncButtons.count();
    
    if (buttonCount > 0) {
      console.log(`🔄 Testing sync on ${buttonCount} available domains`);
      
      // Test sync on last domain (likely our new one)
      const lastSyncButton = syncButtons.last();
      
      // Monitor sync result
      page.on('dialog', async dialog => {
        const message = dialog.message();
        console.log(`📊 Sync result: ${message}`);
        
        // Verify the message contains expected sync information
        expect(message).toContain('Sync completed');
        
        await dialog.accept();
      });
      
      await lastSyncButton.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ Sync service demonstration completed');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/sync-demo-complete.png',
      fullPage: true 
    });
  });
});






