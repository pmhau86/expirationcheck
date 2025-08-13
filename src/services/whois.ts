import type { Domain } from '@/types/domain'

// WHOIS API service for real domain information
export const whoisService = {
  // Get domain WHOIS information
  async getDomainWhois(domain: string): Promise<{
    domain: string
    expireDate: string | null
    registrar: string | null
    status: string | null
    createdDate: string | null
    updatedDate: string | null
    error?: string
  }> {
    try {
      // Remove protocol and www if present
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '')
      
      console.log(`🔍 Querying WHOIS for: ${cleanDomain}`)
      
      // Use a public WHOIS API service
      // Note: In production, you might want to use a paid service like:
      // - whoisxmlapi.com
      // - whois.whoisxmlapi.com
      // - ipapi.com
      
      const response = await fetch(`https://whois.whoisxmlapi.com/api/v1?apiKey=demo&domainName=${cleanDomain}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`WHOIS API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Parse WHOIS response
      const whoisInfo = {
        domain: cleanDomain,
        expireDate: this.parseWhoisDate(data.expiresDate),
        registrar: data.registrar?.name || null,
        status: data.status?.[0] || null,
        createdDate: this.parseWhoisDate(data.creationDate),
        updatedDate: this.parseWhoisDate(data.updatedDate),
      }

      console.log(`✅ WHOIS data for ${cleanDomain}:`, whoisInfo)
      return whoisInfo

    } catch (error: any) {
      console.error(`❌ WHOIS query failed for ${domain}:`, error.message)
      
      // Fallback to simulated data if WHOIS fails
      return this.getSimulatedWhoisData(domain)
    }
  },

  // Parse WHOIS date format
  parseWhoisDate(dateString: string | null): string | null {
    if (!dateString) return null
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      return date.toISOString()
    } catch {
      return null
    }
  },

  // Fallback to simulated data when WHOIS API is unavailable
  getSimulatedWhoisData(domain: string) {
    console.log(`🔄 Using simulated WHOIS data for ${domain}`)
    
    const now = new Date()
    const expireDate = new Date(now)
    expireDate.setFullYear(expireDate.getFullYear() + 1)
    
    return {
      domain: domain.replace(/^(https?:\/\/)?(www\.)?/, ''),
      expireDate: expireDate.toISOString(),
      registrar: 'Simulated Registrar',
      status: 'active',
      createdDate: now.toISOString(),
      updatedDate: now.toISOString(),
      error: 'Using simulated data - WHOIS API unavailable'
    }
  },

  // Sync domain expire date using real WHOIS data
  async syncDomainWithWhois(domain: Domain): Promise<{
    success: boolean
    oldExpireDate: string
    newExpireDate: string | null
    registrar: string | null
    status: string | null
    error?: string
  }> {
    try {
      console.log(`🔄 Syncing ${domain.domain} with WHOIS...`)
      
      const whoisData = await this.getDomainWhois(domain.domain)
      
      const result = {
        success: true,
        oldExpireDate: domain.expire_date,
        newExpireDate: whoisData.expireDate,
        registrar: whoisData.registrar,
        status: whoisData.status,
        error: undefined as string | undefined
      }

      if (whoisData.error) {
        result.success = false
        result.error = whoisData.error || 'Unknown error'
      }

      console.log(`✅ WHOIS sync result for ${domain.domain}:`, result)
      return result

    } catch (error: any) {
      console.error(`❌ WHOIS sync failed for ${domain.domain}:`, error.message)
      
      return {
        success: false,
        oldExpireDate: domain.expire_date,
        newExpireDate: null,
        registrar: null,
        status: null,
        error: error.message
      }
    }
  },

  // Bulk sync multiple domains with WHOIS
  async syncMultipleDomainsWithWhois(domains: Domain[]): Promise<{
    success: Array<{
      domain: Domain
      whoisData: {
        oldExpireDate: string
        newExpireDate: string | null
        registrar: string | null
        status: string | null
      }
    }>
    failed: Array<{
      domain: Domain
      error: string
    }>
  }> {
    const results = {
      success: [] as Array<{
        domain: Domain
        whoisData: {
          oldExpireDate: string
          newExpireDate: string | null
          registrar: string | null
          status: string | null
        }
      }>,
      failed: [] as Array<{
        domain: Domain
        error: string
      }>
    }

    console.log(`🔄 Starting bulk WHOIS sync for ${domains.length} domains...`)

    for (const domain of domains) {
      try {
        const syncResult = await this.syncDomainWithWhois(domain)
        
        if (syncResult.success && syncResult.newExpireDate) {
          results.success.push({
            domain,
            whoisData: {
              oldExpireDate: syncResult.oldExpireDate,
              newExpireDate: syncResult.newExpireDate,
              registrar: syncResult.registrar,
              status: syncResult.status
            }
          })
        } else {
          results.failed.push({
            domain,
            error: syncResult.error || 'No expire date found in WHOIS data'
          })
        }

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error: any) {
        results.failed.push({
          domain,
          error: error.message
        })
      }
    }

    console.log(`✅ Bulk WHOIS sync completed: ${results.success.length} success, ${results.failed.length} failed`)
    return results
  }
}
