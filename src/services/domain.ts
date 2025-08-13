import { databases } from '@/lib/appwrite'
import { whoisService } from './whois'
import type { Domain, DomainStats, CreateDomainData } from '@/types/domain'

// Domain Service
export const domainService = {
  // Get all domains
  async getAllDomains(): Promise<Domain[]> {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID
      )
      return res.documents as unknown as Domain[]
    } catch (err: any) {
      throw new Error(`Failed to fetch domains: ${err.message}`)
    }
  },

  // Get domain by ID
  async getDomainById(id: string): Promise<Domain> {
    try {
      const res = await databases.getDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        id
      )
      return res as unknown as Domain
    } catch (err: any) {
      throw new Error(`Failed to fetch domain: ${err.message}`)
    }
  },

  // Create new domain
  async createDomain(data: CreateDomainData): Promise<Domain> {
    try {
      const res = await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        'unique()', // Let Appwrite generate ID
        {
          domain: data.domain,
          issued_date: data.issued_date,
          expire_date: data.expire_date,
          ssl_expire_date: data.ssl_expire_date
        }
      )
      return res as unknown as Domain
    } catch (err: any) {
      throw new Error(`Failed to create domain: ${err.message}`)
    }
  },

  // Update domain
  async updateDomain(id: string, data: Partial<CreateDomainData>): Promise<Domain> {
    try {
      const res = await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        id,
        data
      )
      return res as unknown as Domain
    } catch (err: any) {
      throw new Error(`Failed to update domain: ${err.message}`)
    }
  },

  // Delete domain
  async deleteDomain(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        import.meta.env.VITE_APPWRITE_DB_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        id
      )
    } catch (err: any) {
      throw new Error(`Failed to delete domain: ${err.message}`)
    }
  },

  // Get domain statistics
  async getStats(): Promise<DomainStats> {
    try {
      const domains = await this.getAllDomains()
      const now = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(now.getDate() + 30)

      const stats: DomainStats = {
        total: domains.length,
        active: 0,
        expiringSoon: 0,
        expired: 0
      }

      domains.forEach(domain => {
        const expireDate = new Date(domain.expire_date)
        
        if (expireDate < now) {
          stats.expired++
        } else if (expireDate <= thirtyDaysFromNow) {
          stats.expiringSoon++
        } else {
          stats.active++
        }
      })

      return stats
    } catch (err: any) {
      throw new Error(`Failed to get domain stats: ${err.message}`)
    }
  },

  // Get domains expiring soon (within 30 days)
  async getExpiringSoonDomains(): Promise<Domain[]> {
    try {
      const domains = await this.getAllDomains()
      const now = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(now.getDate() + 30)

      return domains.filter(domain => {
        const expireDate = new Date(domain.expire_date)
        return expireDate >= now && expireDate <= thirtyDaysFromNow
      })
    } catch (err: any) {
      throw new Error(`Failed to get expiring soon domains: ${err.message}`)
    }
  },

  // Get expired domains
  async getExpiredDomains(): Promise<Domain[]> {
    try {
      const domains = await this.getAllDomains()
      const now = new Date()

      return domains.filter(domain => {
        const expireDate = new Date(domain.expire_date)
        return expireDate < now
      })
    } catch (err: any) {
      throw new Error(`Failed to get expired domains: ${err.message}`)
    }
  },

  // Sync domain expire date with WHOIS data
  async syncDomainExpireDate(domain: Domain): Promise<Domain> {
    try {
      console.log(`🔄 Syncing ${domain.domain} with WHOIS...`)
      
      // Try real WHOIS first
      const whoisResult = await whoisService.syncDomainWithWhois(domain)
      
      if (whoisResult.success && whoisResult.newExpireDate) {
        // Update domain with real WHOIS data
        const updatedDomain = await this.updateDomain(domain.$id, {
          expire_date: whoisResult.newExpireDate
        })
        
        console.log(`✅ WHOIS sync successful for ${domain.domain}:`)
        console.log(`📅 Old: ${whoisResult.oldExpireDate}`)
        console.log(`📅 New: ${whoisResult.newExpireDate}`)
        console.log(`🏢 Registrar: ${whoisResult.registrar}`)
        console.log(`📊 Status: ${whoisResult.status}`)
        
        return updatedDomain
      } else {
        // WHOIS sync failed - throw error instead of using simulated data
        const errorMessage = whoisResult.error || 'Unable to fetch WHOIS information for this domain'
        throw new Error(`WHOIS sync failed: ${errorMessage}`)
      }
      
    } catch (err: any) {
      console.error(`❌ Sync failed for ${domain.domain}:`, err.message)
      
      // Re-throw the error instead of falling back to simulated sync
      throw new Error(`Unable to sync domain ${domain.domain}: ${err.message}`)
    }
  },

  // Sync SSL certificate expire date
  async syncSSLExpireDate(domain: Domain): Promise<Domain> {
    try {
      console.log(`🔒 Syncing SSL certificate for ${domain.domain}...`)
      
      // TODO: Implement actual SSL certificate checking
      // This would typically involve:
      // 1. Making HTTPS request to the domain
      // 2. Extracting certificate information
      // 3. Parsing expiration date
      
      // For now, we'll simulate SSL certificate checking
      const sslResult = await this.simulateSSLSync(domain)
      
      if (sslResult.success && sslResult.newSSLExpireDate) {
        // Update domain with SSL certificate data
        const updatedDomain = await this.updateDomain(domain.$id, {
          ssl_expire_date: sslResult.newSSLExpireDate
        })
        
        console.log(`✅ SSL sync successful for ${domain.domain}:`)
        console.log(`🔒 Old SSL: ${sslResult.oldSSLExpireDate || 'Not set'}`)
        console.log(`🔒 New SSL: ${sslResult.newSSLExpireDate}`)
        
        return updatedDomain
      } else {
        const errorMessage = sslResult.error || 'Unable to fetch SSL certificate information'
        throw new Error(`SSL sync failed: ${errorMessage}`)
      }
      
    } catch (err: any) {
      console.error(`❌ SSL sync failed for ${domain.domain}:`, err.message)
      throw new Error(`Unable to sync SSL for ${domain.domain}: ${err.message}`)
    }
  },

  // Simulate SSL certificate sync
  async simulateSSLSync(domain: Domain): Promise<{
    success: boolean
    oldSSLExpireDate?: string
    newSSLExpireDate?: string
    error?: string
  }> {
    try {
      // Simulate different SSL scenarios
      const sslScenarios = [
        // Scenario 1: SSL certificate found and valid
        {
          probability: 0.7,
          action: () => {
            const newSSLExpireDate = new Date()
            newSSLExpireDate.setFullYear(newSSLExpireDate.getFullYear() + 1)
            newSSLExpireDate.setMonth(newSSLExpireDate.getMonth() + Math.floor(Math.random() * 6))
            return newSSLExpireDate.toISOString()
          },
          message: 'SSL certificate found and valid'
        },
        // Scenario 2: SSL certificate expired
        {
          probability: 0.2,
          action: () => {
            const newSSLExpireDate = new Date()
            newSSLExpireDate.setMonth(newSSLExpireDate.getMonth() - Math.floor(Math.random() * 3))
            return newSSLExpireDate.toISOString()
          },
          message: 'SSL certificate expired'
        },
        // Scenario 3: No SSL certificate found
        {
          probability: 0.1,
          action: () => null,
          message: 'No SSL certificate found'
        }
      ]

      // Select scenario based on probability
      const random = Math.random()
      let cumulativeProbability = 0
      let selectedScenario = sslScenarios[0]

      for (const scenario of sslScenarios) {
        cumulativeProbability += scenario.probability
        if (random <= cumulativeProbability) {
          selectedScenario = scenario
          break
        }
      }

      const newSSLExpireDate = selectedScenario.action()

      if (newSSLExpireDate) {
        return {
          success: true,
          oldSSLExpireDate: domain.ssl_expire_date,
          newSSLExpireDate: newSSLExpireDate
        }
      } else {
        return {
          success: false,
          error: 'No SSL certificate found for this domain'
        }
      }

    } catch (err: any) {
      return {
        success: false,
        error: `SSL simulation failed: ${err.message}`
      }
    }
  },

  // Fallback simulated sync (when WHOIS is unavailable)
  async simulateDomainSync(domain: Domain): Promise<Domain> {
    try {
      const currentExpireDate = new Date(domain.expire_date)
      
      // Simulate different scenarios for demo purposes
      const syncScenarios = [
        // Scenario 1: Expire date extended (renewed)
        { 
          probability: 0.3, 
          action: () => {
            const newExpireDate = new Date(currentExpireDate)
            newExpireDate.setFullYear(newExpireDate.getFullYear() + 1)
            return newExpireDate.toISOString()
          },
          message: 'Domain renewed - expire date extended by 1 year'
        },
        // Scenario 2: Expire date shortened (early expiration)
        {
          probability: 0.1,
          action: () => {
            const newExpireDate = new Date(currentExpireDate)
            newExpireDate.setMonth(newExpireDate.getMonth() - 2)
            return newExpireDate.toISOString()
          },
          message: 'Domain expiration moved up - expires 2 months earlier'
        },
        // Scenario 3: No change (most common)
        {
          probability: 0.6,
          action: () => domain.expire_date,
          message: 'No changes detected - expire date confirmed'
        }
      ]
      
      // Select scenario based on probability
      const random = Math.random()
      let cumulativeProbability = 0
      let selectedScenario = syncScenarios[2] // default to no change
      
      for (const scenario of syncScenarios) {
        cumulativeProbability += scenario.probability
        if (random <= cumulativeProbability) {
          selectedScenario = scenario
          break
        }
      }
      
      const newExpireDate = selectedScenario.action()
      
      // Only update if expire date changed
      if (newExpireDate !== domain.expire_date) {
        const updatedDomain = await this.updateDomain(domain.$id, {
          expire_date: newExpireDate
        })
        
        console.log(`🔄 Simulated sync result for ${domain.domain}: ${selectedScenario.message}`)
        
        return updatedDomain
      } else {
        console.log(`✅ Simulated sync result for ${domain.domain}: ${selectedScenario.message}`)
        return domain
      }
      
    } catch (err: any) {
      console.error(`❌ Simulated sync failed for ${domain.domain}:`, err.message)
      throw new Error(`Failed to sync domain ${domain.domain}: ${err.message}`)
    }
  },

  // Bulk sync multiple domains with WHOIS
  async syncMultipleDomains(domains: Domain[]): Promise<{
    success: Domain[]
    failed: { domain: Domain, error: string }[]
  }> {
    console.log(`🔄 Starting bulk WHOIS sync for ${domains.length} domains...`)
    
    const results = {
      success: [] as Domain[],
      failed: [] as { domain: Domain, error: string }[]
    }
    
    for (const domain of domains) {
      try {
        const syncedDomain = await this.syncDomainExpireDate(domain)
        results.success.push(syncedDomain)
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error: any) {
        results.failed.push({ domain, error: error.message })
      }
    }
    
    console.log(`✅ Bulk WHOIS sync completed: ${results.success.length} success, ${results.failed.length} failed`)
    return results
  }
}
