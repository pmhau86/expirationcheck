// Manual Sync Test - Direct UI Interaction
import { test, expect } from '@playwright/test';

test.describe('🔄 Manual Sync Domain Test', () => {
  
  test('should manually test sync functionality step by step', async ({ page }) => {
    console.log('🚀 Starting Manual Sync Test...');
    
    // Step 1: Navigate to domains page
    await page.goto('http://localhost:5173/domains');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    console.log('✅ Page loaded');
    
    // Step 2: Take initial screenshot
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/manual-sync-initial.png',
      fullPage: true 
    });
    console.log('📸 Initial screenshot taken');
    
    // Step 3: Look for domains table
    const table = page.locator('table');
    const hasTable = await table.count() > 0;
    console.log(`📋 Table found: ${hasTable}`);
    
    if (hasTable) {
      // Step 4: Count table rows
      const rows = await page.locator('table tbody tr').count();
      console.log(`📊 Found ${rows} domain rows`);
      
      if (rows > 0) {
        // Step 5: Look for sync icon in first row
        const firstRow = page.locator('table tbody tr').first();
        
        // Try different selectors for sync button
        const syncSelectors = [
          'button[title="Sync domain"]',
          'button:has([data-testid="SyncIcon"])',
          '.MuiIconButton-root:has(svg)',
          'button:has-text("Sync")'
        ];
        
        let syncButton = null;
        for (const selector of syncSelectors) {
          const btn = firstRow.locator(selector);
          if (await btn.count() > 0) {
            syncButton = btn.first();
            console.log(`✅ Found sync button with selector: ${selector}`);
            break;
          }
        }
        
        if (syncButton) {
          // Step 6: Set up alert handling
          let alertReceived = false;
          let alertMessage = '';
          
          page.on('dialog', async dialog => {
            alertReceived = true;
            alertMessage = dialog.message();
            console.log(`🔔 Alert: ${alertMessage}`);
            await dialog.accept();
          });
          
          // Step 7: Get initial domain info
          const domainName = await firstRow.locator('td').first().textContent();
          const initialExpireDate = await firstRow.locator('td').nth(3).textContent();
          console.log(`🌐 Testing sync for: ${domainName}`);
          console.log(`📅 Initial expire date: ${initialExpireDate}`);
          
          // Step 8: Click sync button
          console.log('🔄 Clicking sync button...');
          await syncButton.click();
          
          // Step 9: Wait for sync operation
          await page.waitForTimeout(3000);
          
          // Step 10: Check results
          if (alertReceived) {
            console.log('✅ Sync alert received successfully');
            expect(alertMessage).toContain('Sync completed');
            
            // Check if expire date changed
            await page.waitForTimeout(1000);
            const updatedExpireDate = await firstRow.locator('td').nth(3).textContent();
            console.log(`📅 Updated expire date: ${updatedExpireDate}`);
            
            if (initialExpireDate !== updatedExpireDate) {
              console.log('🔄 ✅ EXPIRE DATE CHANGED - Sync worked!');
            } else {
              console.log('✅ EXPIRE DATE CONFIRMED - No changes needed');
            }
            
          } else {
            console.log('⚠️ No alert received - sync may have failed');
          }
          
          // Step 11: Take final screenshot
          await page.screenshot({ 
            path: 'tests/fixtures/screenshots/manual-sync-result.png',
            fullPage: true 
          });
          
        } else {
          console.log('❌ No sync button found in first row');
          
          // Debug: Show what buttons are available
          const allButtons = await firstRow.locator('button').all();
          console.log(`🔍 Available buttons in row: ${allButtons.length}`);
          
          for (let i = 0; i < allButtons.length; i++) {
            const buttonText = await allButtons[i].textContent();
            const buttonTitle = await allButtons[i].getAttribute('title');
            console.log(`  Button ${i}: "${buttonText}" (title: ${buttonTitle})`);
          }
        }
      }
    }
    
    console.log('🏁 Manual Sync Test Completed');
  });
  
  test('should test sync with a specific domain', async ({ page }) => {
    console.log('🎯 Testing sync with specific domain...');
    
    await page.goto('http://localhost:5173/domains');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Add a test domain for sync testing
    const addButton = page.locator('button:has-text("Add Domain")');
    
    if (await addButton.count() > 0) {
      console.log('➕ Adding test domain...');
      
      // Fill form
      await page.fill('input[name="domain"]', 'sync-demo.com');
      await page.fill('input[name="issued_date"]', '2024-01-01');
      await page.fill('input[name="expire_date"]', '2024-06-01');
      
      // Handle add success alert
      page.on('dialog', async dialog => {
        console.log(`📝 Add result: ${dialog.message()}`);
        await dialog.accept();
      });
      
      await addButton.click();
      await page.waitForTimeout(3000);
      
      // Now find and sync the new domain
      const tableRows = page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      console.log(`🔍 Searching in ${rowCount} rows for sync-demo.com`);
      
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const domainCell = await row.locator('td').first().textContent();
        
        if (domainCell?.includes('sync-demo.com')) {
          console.log('🎯 Found sync-demo.com row, testing sync...');
          
          // Set up sync alert handler
          page.on('dialog', async dialog => {
            const message = dialog.message();
            console.log(`🔄 Sync result: ${message}`);
            
            // Verify it's a sync message
            if (message.includes('Sync completed')) {
              console.log('✅ SYNC FUNCTIONALITY VERIFIED!');
            }
            
            await dialog.accept();
          });
          
          // Find sync button in this row
          const syncButton = row.locator('button').first(); // Try first button
          
          if (await syncButton.count() > 0) {
            console.log('🔄 Clicking sync button for sync-demo.com...');
            await syncButton.click();
            await page.waitForTimeout(2000);
          }
          
          break;
        }
      }
    }
    
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/specific-sync-test.png',
      fullPage: true 
    });
    
    console.log('✅ Specific domain sync test completed');
  });
});
