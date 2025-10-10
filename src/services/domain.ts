import { databases } from '@/lib/appwrite'
import type { Models } from 'appwrite'
import type { CreateDomainData } from '@/types/domain'
import { sslService } from './ssl'
// import { whoisService } from './whois'

export async function getDomains(): Promise<Models.Document[]> {
  try {
    const res = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_DOMAINS_COLLECTION_ID
    )
    return res.documents
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}

export async function createDomain(domainData: CreateDomainData): Promise<Models.Document> {
  try {
    const res = await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_DOMAINS_COLLECTION_ID,
      'unique()',
      {
        domain: domainData.domain,
        issued_date: domainData.issued_date || null,
        expire_date: domainData.expire_date || null,
        ssl_expire_date: domainData.ssl_expire_date || null
      }
    )
    return res
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}

export async function updateDomain(documentId: string, data: any): Promise<Models.Document> {
  try {
    console.log(`🔄 Updating document ${documentId} with data:`, data)

    const res = await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_DOMAINS_COLLECTION_ID,
      documentId,
      data
    )

    console.log(`✅ Document updated successfully:`, res)
    return res
  } catch (err: any) {
    console.error(`❌ Update failed:`, err)
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}

export async function deleteDomain(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_DOMAINS_COLLECTION_ID,
      documentId
    )
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}

// Sync domain with WHOIS data
export async function syncDomainWithWhois(domain: any): Promise<{
  success: boolean
  oldExpireDate: string
  newExpireDate: string | null
  registrar: string | null
  status: string | null
  error?: string | undefined
}> {
  return {
    success: false,
    oldExpireDate: domain.expire_date || '',
    newExpireDate: null,
    registrar: null,
    status: null,
    error: undefined
  }
}

// Sync SSL certificate for a domain
export async function syncSSLCertificate(domain: any): Promise<{
  success: boolean
  oldSSLExpireDate: string
  newSSLExpireDate: string | null
  error?: string
}> {
  try {
    console.log(`🔄 Syncing SSL certificate for ${domain.domain}...`)

    const sslResult = await sslService.syncSSLWithCertificate(domain)

    if (sslResult.success && sslResult.newSSLExpireDate) {
      // Update the domain in database
      await updateDomain(domain.$id, {
        ssl_expire_date: sslResult.newSSLExpireDate
      })

      console.log(`✅ SSL certificate synced for ${domain.domain}`)
      return {
        success: true,
        oldSSLExpireDate: sslResult.oldSSLExpireDate,
        newSSLExpireDate: sslResult.newSSLExpireDate
      }
    } else {
      console.log(`❌ SSL sync failed for ${domain.domain}: ${sslResult.error}`)
      return {
        success: false,
        oldSSLExpireDate: sslResult.oldSSLExpireDate,
        newSSLExpireDate: null,
        error: sslResult.error
      }
    }

  } catch (error: any) {
    console.error(`❌ SSL sync error for ${domain.domain}:`, error.message)
    return {
      success: false,
      oldSSLExpireDate: domain.ssl_expire_date || '',
      newSSLExpireDate: null,
      error: error.message
    }
  }
}
