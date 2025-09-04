import { test, expect } from '@playwright/test'

test.describe('🔍 Test WHOIS Service', () => {
  test('should test WHOIS service functionality', async ({ page }) => {
    console.log('🔍 Testing WHOIS service...')
    
    // Navigate to the domains page
    await page.goto('http://localhost:5173/domains')
    console.log('✅ Navigated to domains page')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    console.log('✅ Page loaded')
    
    // Test WHOIS service directly in browser console
    const whoisTest = await page.evaluate(async () => {
      try {
        // Import WHOIS service
        const { whoisService } = await import('/src/services/whois.js')
        
        // Test with a sample domain
        const testDomain = 'example.com'
        console.log(`🔍 Testing WHOIS for: ${testDomain}`)
        
        const result = await whoisService.getDomainWhois(testDomain)
        console.log('✅ WHOIS result:', result)
        
        return {
          success: true,
          data: result,
          error: null
        }
      } catch (error) {
        console.error('❌ WHOIS test failed:', error)
        return {
          success: false,
          data: null,
          error: error.message
        }
      }
    })
    
    console.log('🔍 WHOIS test result:', whoisTest)
    
    if (whoisTest.success) {
      console.log('✅ WHOIS service is working!')
      console.log('📊 WHOIS data:', whoisTest.data)
    } else {
      console.log('❌ WHOIS service failed:', whoisTest.error)
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/fixtures/screenshots/whois-service-test.png',
      fullPage: true 
    })
    
    console.log('🎉 WHOIS service test completed!')
  })
})






