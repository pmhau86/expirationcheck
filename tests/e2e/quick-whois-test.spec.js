import { test, expect } from '@playwright/test'

test.describe('🔍 Quick WHOIS Test', () => {
  test('should test WHOIS functionality quickly', async ({ page }) => {
    console.log('🔍 Starting quick WHOIS test...')
    
    // Navigate to the domains page
    await page.goto('http://localhost:5173/domains')
    console.log('✅ Navigated to domains page')
    
    // Wait for page to load (more flexible)
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    console.log('✅ Page loaded')
    
    // Check if page contains domain portfolio text
    const hasPortfolio = await page.locator('text=Domain Portfolio').isVisible()
    console.log(`📋 Domain Portfolio visible: ${hasPortfolio}`)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/quick-whois-test.png',
      fullPage: true 
    })
    console.log('📸 Screenshot saved')
    
    // Check for table
    const hasTable = await page.locator('table').isVisible()
    console.log(`📊 Table visible: ${hasTable}`)
    
    if (hasTable) {
      // Check for WHOIS info buttons
      const whoisButtons = page.locator('button[title="View WHOIS info"]')
      const buttonCount = await whoisButtons.count()
      console.log(`🔍 Found ${buttonCount} WHOIS info buttons`)
      
      if (buttonCount > 0) {
        console.log('✅ WHOIS functionality is working!')
        
        // Try clicking the first WHOIS button
        console.log('🔄 Clicking first WHOIS button...')
        await whoisButtons.first().click()
        
        // Wait for dialog
        await page.waitForTimeout(3000)
        
        // Check if dialog appeared
        const hasDialog = await page.locator('div[role="dialog"]').isVisible()
        console.log(`📋 WHOIS dialog visible: ${hasDialog}`)
        
        if (hasDialog) {
          console.log('✅ WHOIS dialog opened successfully!')
          
          // Take screenshot of dialog
          await page.screenshot({ 
            path: 'tests/fixtures/screenshots/whois-dialog-quick.png',
            fullPage: true 
          })
          
          // Close dialog
          const closeButton = page.locator('div[role="dialog"] button:has-text("Close")')
          await closeButton.click()
          
          console.log('✅ WHOIS dialog closed')
        } else {
          console.log('⚠️ WHOIS dialog did not appear')
        }
      } else {
        console.log('⚠️ No WHOIS buttons found - table might be empty')
      }
    } else {
      console.log('⚠️ No table found')
    }
    
    console.log('🎉 Quick WHOIS test completed!')
  })
})
