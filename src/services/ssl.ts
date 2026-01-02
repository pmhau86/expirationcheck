import type { Domain } from '@/types/domain'
import { functions } from '@/lib/appwrite';

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
      // Add a guard clause to prevent calling the function with an empty domain
      if (!domain || domain.trim() === '') {
        console.error('❌ SSL check cannot be performed: Domain cannot be empty.');
        throw new Error('Domain cannot be empty');
      }

      console.log(`🔧 Calling Appwrite Function for ${domain}`)

      // Call the Appwrite Function by its ID or name
      const execution = await functions.createExecution(
        '68e781b0000efd509766', // Use the specific Function ID for reliability
        JSON.stringify({ domain: domain }), // Data sent to the function, must be a string
        false // Synchronous execution (waits for the result)
      );

      if (execution.status === 'failed') {
        // Use stderr for detailed error messages from the function
        throw new Error('Function execution failed');
      }

      // The response data is in execution.responseBody as a string
      const data = JSON.parse(execution.responseBody);

      if (!data.success) {
        throw new Error(data.error || 'SSL check failed in function');
      }

      console.log(`✅ Appwrite Function result for ${domain}:`, data);

      // Log domain_info if available
      if (data.domain_info) {
        console.log(`📋 Domain info from database:`, data.domain_info);
      } else {
        console.log(`⚠️ No domain info found in database for ${domain}`);
      }

      return {
        validFrom: data.valid_from, // Note: snake_case from function
        validTo: data.valid_to,     // Note: snake_case from function
        issuer: data.issuer,
        subject: data.subject,
        domainInfo: data.domain_info || null, // Include domain_info in response
      };

    } catch (error: any) {
      console.log(`⚠️ Appwrite Function call failed for ${domain}: ${error.message}`);
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