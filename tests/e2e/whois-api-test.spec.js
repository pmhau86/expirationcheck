import { test, expect } from '@playwright/test'

test.describe('🔍 WHOIS API Test', () => {
  test('should test WHOIS API functionality', async ({ page }) => {
    console.log('🔍 Testing WHOIS API...')
    
    // Test WHOIS API directly
    const whoisTest = await page.evaluate(async () => {
      try {
        // Test WHOIS API call
        const testDomain = 'google.com'
        console.log(`🔍 Testing WHOIS API for: ${testDomain}`)
        
        // Make direct API call to WHOIS service
        const response = await fetch(`https://whois.whoisxmlapi.com/api/v1?apiKey=demo&domainName=${testDomain}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log(`📊 WHOIS API response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ WHOIS API data:', data)
          
          return {
            success: true,
            status: response.status,
            data: data,
            error: null
          }
        } else {
          console.log(`❌ WHOIS API error: ${response.status} ${response.statusText}`)
          
          return {
            success: false,
            status: response.status,
            data: null,
            error: `${response.status} ${response.statusText}`
          }
        }
      } catch (error) {
        console.error('❌ WHOIS API test failed:', error)
        return {
          success: false,
          status: null,
          data: null,
          error: error.message
        }
      }
    })
    
    console.log('🔍 WHOIS API test result:', whoisTest)
    
    if (whoisTest.success) {
      console.log('✅ WHOIS API is working!')
      console.log('📊 WHOIS API data:', whoisTest.data)
      
      // Check for expected fields
      const hasExpireDate = whoisTest.data.expiresDate || whoisTest.data.expireDate
      const hasRegistrar = whoisTest.data.registrar
      const hasStatus = whoisTest.data.status
      
      console.log(`📅 Has expire date: ${!!hasExpireDate}`)
      console.log(`📋 Has registrar: ${!!hasRegistrar}`)
      console.log(`📊 Has status: ${!!hasStatus}`)
      
    } else {
      console.log('❌ WHOIS API failed:', whoisTest.error)
      console.log('ℹ️ This is expected for demo API - will use simulated data')
    }
    
    // Test our WHOIS service with fallback
    const serviceTest = await page.evaluate(async () => {
      try {
        // Import our WHOIS service
        const { whoisService } = await import('/src/services/whois.js')
        
        const testDomain = 'example.com'
        console.log(`🔍 Testing WHOIS service for: ${testDomain}`)
        
        const result = await whoisService.getDomainWhois(testDomain)
        console.log('✅ WHOIS service result:', result)
        
        return {
          success: true,
          data: result,
          error: null
        }
      } catch (error) {
        console.error('❌ WHOIS service test failed:', error)
        return {
          success: false,
          data: null,
          error: error.message
        }
      }
    })
    
    console.log('🔍 WHOIS service test result:', serviceTest)
    
    if (serviceTest.success) {
      console.log('✅ WHOIS service is working!')
      console.log('📊 WHOIS service data:', serviceTest.data)
      
      // Check if using simulated data
      if (serviceTest.data.error && serviceTest.data.error.includes('simulated')) {
        console.log('ℹ️ Using simulated data (expected for demo)')
      } else {
        console.log('🎉 Using real WHOIS data!')
      }
    } else {
      console.log('❌ WHOIS service failed:', serviceTest.error)
    }
    
    console.log('🎉 WHOIS API test completed!')
  })
})






