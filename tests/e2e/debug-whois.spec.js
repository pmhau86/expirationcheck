import { test, expect } from '@playwright/test'

test.describe('🔍 Debug WHOIS Test', () => {
  test('should debug WHOIS functionality', async ({ page }) => {
    console.log('🔍 Starting debug WHOIS test...')
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`🔍 Console: ${msg.type()} ${msg.text()}`)
    })
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`)
    })
    
    // Navigate to the domains page
    await page.goto('http://localhost:5173/domains')
    console.log('✅ Navigated to domains page')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    console.log('✅ Page loaded')
    
    // Get page content
    const pageContent = await page.content()
    console.log(`📄 Page content length: ${pageContent.length}`)
    
    // Check for specific elements
    const elements = [
      { selector: 'h1', name: 'H1 elements' },
      { selector: 'h2', name: 'H2 elements' },
      { selector: 'h3', name: 'H3 elements' },
      { selector: 'table', name: 'Table elements' },
      { selector: 'button', name: 'Button elements' },
      { selector: 'div', name: 'Div elements' }
    ]
    
    for (const element of elements) {
      const count = await page.locator(element.selector).count()
      console.log(`📊 ${element.name}: ${count}`)
    }
    
    // Check for text content
    const textContent = await page.textContent('body')
    console.log(`📝 Text content preview: ${textContent?.substring(0, 200)}...`)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/debug-whois.png',
      fullPage: true 
    })
    console.log('📸 Debug screenshot saved')
    
    console.log('🎉 Debug WHOIS test completed!')
  })
})
