import type { Domain } from '@/types/domain'

// SSL Certificate service for checking SSL expiration using server API
export const sslService = {
  // Check SSL certificate for a domain using server API
  async checkSSLCertificate(domain: string): Promise<{
    domain: string
    sslExpireDate: string | null
    issuer: string | null
    subject: string | null
    validFrom: string | null
    validTo: string | null
    error?: string
  }> {
    try {
      // Remove protocol but keep www prefix for SSL checks
      const cleanDomain = domain.replace(/^(https?:\/\/)?/, '')
      
      console.log(`🔒 Checking SSL certificate for: ${cleanDomain} using server API`)
      
      // Use server API to get certificate info
      const sslData = await this.getSSLCertificateInfo(cleanDomain)
      
      if (sslData.error) {
        throw new Error(sslData.error)
      }

      const sslInfo = {
        domain: cleanDomain,
        sslExpireDate: sslData.validTo,
        issuer: sslData.issuer,
        subject: sslData.subject,
        validFrom: sslData.validFrom,
        validTo: sslData.validTo,
      }

      console.log(`✅ SSL data from server API for ${cleanDomain}:`, sslInfo)
      return sslInfo

    } catch (error: any) {
      console.error(`❌ SSL check failed for ${domain}:`, error.message)
      
      return {
        domain: domain.replace(/^(https?:\/\/)?/, ''),
        sslExpireDate: null,
        issuer: null,
        subject: null,
        validFrom: null,
        validTo: null,
        error: error.message
      }
    }
  },

  // Get SSL certificate info using server API
  async getSSLCertificateInfo(domain: string): Promise<{
    validFrom: string | null
    validTo: string | null
    issuer: string | null
    subject: string | null
    error?: string
  }> {
    try {
      console.log(`🔧 Calling server API for ${domain}`)
      
      // Call the server API that uses Node.js tls module
      const response = await fetch(`http://192.168.10.239:3001/api/ssl-check/${domain}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'SSL check failed');
      }

      console.log(`✅ Server API result for ${domain}:`, data);
      
      return {
        validFrom: data.validFrom,
        validTo: data.validTo,
        issuer: data.issuer,
        subject: data.subject,
      };

    } catch (error: any) {
      console.log(`⚠️ Server API failed for ${domain}: ${error.message}`);
      throw error;
    }
  },

  // Parse SSL date format
  parseSSLDate(dateString: string | null): string | null {
    if (!dateString) return null
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      return date.toISOString()
    } catch {
      return null
    }
  },

  // Sync SSL expire date using real certificate data
  async syncSSLWithCertificate(domain: Domain): Promise<{
    success: boolean
    oldSSLExpireDate: string
    newSSLExpireDate: string | null
    issuer: string | null
    subject: string | null
    error?: string
  }> {
    try {
      console.log(`🔄 Syncing SSL for ${domain.domain}...`)
      
      const sslData = await this.checkSSLCertificate(domain.domain)
      
      const result = {
        success: true,
        oldSSLExpireDate: domain.ssl_expire_date,
        newSSLExpireDate: sslData.sslExpireDate,
        issuer: sslData.issuer,
        subject: sslData.subject,
        error: undefined as string | undefined
      }

      // Only consider success if we have real SSL data
      if (sslData.sslExpireDate && !sslData.error) {
        result.success = true
      } else {
        result.success = false
        result.error = sslData.error || 'No SSL certificate found'
      }

      console.log(`✅ SSL sync result for ${domain.domain}:`, result)
      return result

    } catch (error: any) {
      console.error(`❌ SSL sync failed for ${domain.domain}:`, error.message)
      
      return {
        success: false,
        oldSSLExpireDate: domain.ssl_expire_date,
        newSSLExpireDate: null,
        issuer: null,
        subject: null,
        error: error.message
      }
    }
  },

  // Bulk sync multiple domains SSL certificates
  async syncMultipleDomainsSSL(domains: Domain[]): Promise<{
    success: Array<{
      domain: Domain
      sslData: {
        oldSSLExpireDate: string
        newSSLExpireDate: string | null
        issuer: string | null
        subject: string | null
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
        sslData: {
          oldSSLExpireDate: string
          newSSLExpireDate: string | null
          issuer: string | null
          subject: string | null
        }
      }>,
      failed: [] as Array<{
        domain: Domain
        error: string
      }>
    }

    console.log(`🔄 Starting bulk SSL sync for ${domains.length} domains...`)

    for (const domain of domains) {
      try {
        const syncResult = await this.syncSSLWithCertificate(domain)
        
        if (syncResult.success && syncResult.newSSLExpireDate) {
          results.success.push({
            domain,
            sslData: {
              oldSSLExpireDate: syncResult.oldSSLExpireDate,
              newSSLExpireDate: syncResult.newSSLExpireDate,
              issuer: syncResult.issuer,
              subject: syncResult.subject
            }
          })
        } else {
          results.failed.push({
            domain,
            error: syncResult.error || 'No SSL certificate found'
          })
        }

        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error: any) {
        results.failed.push({
          domain,
          error: error.message
        })
      }
    }

    console.log(`✅ Bulk SSL sync completed: ${results.success.length} success, ${results.failed.length} failed`)
    return results
  }
}
