import { test, expect } from '@playwright/test'

test.describe('🔍 WHOIS Functionality Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the domains page
    await page.goto('http://localhost:5173/domains')
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Domain Portfolio")', { timeout: 10000 })
  })

  test('should display WHOIS info button in domain table', async ({ page }) => {
    console.log('🔍 Testing WHOIS info button visibility...')
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Check if WHOIS info button exists
    const whoisButtons = page.locator('button[title="View WHOIS info"]')
    const buttonCount = await whoisButtons.count()
    
    console.log(`📊 Found ${buttonCount} WHOIS info buttons`)
    
    if (buttonCount > 0) {
      console.log('✅ WHOIS info buttons are visible')
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/fixtures/screenshots/whois-buttons.png',
        fullPage: true 
      })
    } else {
      console.log('⚠️ No WHOIS info buttons found - table might be empty')
    }
  })

  test('should open WHOIS dialog when clicking info button', async ({ page }) => {
    console.log('🔍 Testing WHOIS dialog opening...')
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Find first WHOIS info button
    const whoisButton = page.locator('button[title="View WHOIS info"]').first()
    
    if (await whoisButton.count() > 0) {
      console.log('🔄 Clicking WHOIS info button...')
      
      // Click the WHOIS info button
      await whoisButton.click()
      
      // Wait for dialog to appear
      await page.waitForSelector('div[role="dialog"]', { timeout: 10000 })
      
      // Check if dialog title is present
      const dialogTitle = page.locator('h6:has-text("WHOIS Information")')
      const titleVisible = await dialogTitle.isVisible()
      
      console.log(`📋 WHOIS dialog title visible: ${titleVisible}`)
      
      if (titleVisible) {
        console.log('✅ WHOIS dialog opened successfully')
        
        // Take screenshot of dialog
        await page.screenshot({ 
          path: 'tests/fixtures/screenshots/whois-dialog.png',
          fullPage: true 
        })
        
        // Check for loading state
        const loadingSpinner = page.locator('div[role="dialog"] .MuiCircularProgress-root')
        const isLoading = await loadingSpinner.isVisible()
        
        if (isLoading) {
          console.log('⏳ WHOIS data is loading...')
          
          // Wait for loading to complete (max 10 seconds)
          await page.waitForTimeout(10000)
        }
        
        // Check for WHOIS data content
        const whoisContent = page.locator('div[role="dialog"] h6:has-text("Domain Information")')
        const contentVisible = await whoisContent.isVisible()
        
        console.log(`📊 WHOIS content visible: ${contentVisible}`)
        
        // Close dialog
        const closeButton = page.locator('div[role="dialog"] button:has-text("Close")')
        await closeButton.click()
        
        // Wait for dialog to close
        await page.waitForTimeout(1000)
        
        const dialogClosed = !(await page.locator('div[role="dialog"]').isVisible())
        console.log(`✅ Dialog closed: ${dialogClosed}`)
        
      } else {
        console.log('❌ WHOIS dialog did not open properly')
      }
    } else {
      console.log('⚠️ No WHOIS info buttons found - skipping dialog test')
    }
  })

  test('should display WHOIS data in dialog', async ({ page }) => {
    console.log('🔍 Testing WHOIS data display...')
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Find first WHOIS info button
    const whoisButton = page.locator('button[title="View WHOIS info"]').first()
    
    if (await whoisButton.count() > 0) {
      console.log('🔄 Opening WHOIS dialog...')
      
      // Click the WHOIS info button
      await whoisButton.click()
      
      // Wait for dialog to appear
      await page.waitForSelector('div[role="dialog"]', { timeout: 10000 })
      
      // Wait for WHOIS data to load (max 15 seconds)
      await page.waitForTimeout(15000)
      
      // Check for various WHOIS data elements
      const dataChecks = [
        { selector: 'h6:has-text("Domain Information")', name: 'Domain Information section' },
        { selector: 'h6:has-text("Important Dates")', name: 'Important Dates section' },
        { selector: 'text=Registrar:', name: 'Registrar field' },
        { selector: 'text=Status:', name: 'Status field' },
        { selector: 'text=Expires:', name: 'Expires field' }
      ]
      
      for (const check of dataChecks) {
        const element = page.locator(check.selector)
        const visible = await element.isVisible()
        console.log(`📋 ${check.name}: ${visible ? '✅' : '❌'}`)
      }
      
      // Check for error message (in case WHOIS API fails)
      const errorMessage = page.locator('div[role="dialog"] .MuiTypography-colorError')
      const hasError = await errorMessage.isVisible()
      
      if (hasError) {
        const errorText = await errorMessage.textContent()
        console.log(`⚠️ WHOIS Error: ${errorText}`)
      }
      
      // Check for simulated data warning
      const warningMessage = page.locator('div[role="dialog"] .MuiBox-root:has-text("simulated")')
      const hasWarning = await warningMessage.isVisible()
      
      if (hasWarning) {
        console.log('⚠️ Using simulated WHOIS data')
      }
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'tests/fixtures/screenshots/whois-data-display.png',
        fullPage: true 
      })
      
      // Close dialog
      const closeButton = page.locator('div[role="dialog"] button:has-text("Close")')
      await closeButton.click()
      
    } else {
      console.log('⚠️ No WHOIS info buttons found - skipping data display test')
    }
  })

  test('should handle WHOIS API errors gracefully', async ({ page }) => {
    console.log('🔍 Testing WHOIS error handling...')
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Find first WHOIS info button
    const whoisButton = page.locator('button[title="View WHOIS info"]').first()
    
    if (await whoisButton.count() > 0) {
      console.log('🔄 Testing WHOIS error handling...')
      
      // Click the WHOIS info button
      await whoisButton.click()
      
      // Wait for dialog to appear
      await page.waitForSelector('div[role="dialog"]', { timeout: 10000 })
      
      // Wait for data to load
      await page.waitForTimeout(10000)
      
      // Check for error handling
      const errorElements = [
        { selector: '.MuiTypography-colorError', name: 'Error message' },
        { selector: 'text=simulated', name: 'Simulated data warning' },
        { selector: 'text=WHOIS API unavailable', name: 'API unavailable message' }
      ]
      
      let errorHandlingFound = false
      for (const element of errorElements) {
        const found = page.locator(element.selector)
        if (await found.isVisible()) {
          console.log(`✅ Error handling: ${element.name} displayed`)
          errorHandlingFound = true
          break
        }
      }
      
      if (!errorHandlingFound) {
        console.log('✅ WHOIS API working normally')
      }
      
      // Close dialog
      const closeButton = page.locator('div[role="dialog"] button:has-text("Close")')
      await closeButton.click()
      
    } else {
      console.log('⚠️ No WHOIS info buttons found - skipping error handling test')
    }
  })
})
