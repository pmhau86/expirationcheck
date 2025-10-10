import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material'
import {
  Domain,
  Warning,
  CheckCircle,
  Error,
  Add
} from '@mui/icons-material'
import { getDomains, syncSSLCertificate, syncDomainWithWhois, updateDomain, deleteDomain } from '@/services/domain'
import { initAuth } from '@/lib/appwrite'
import { DomainsTable } from '@/components/common/DomainsTable'
import { AddDomainForm } from '@/components/common/AddDomainForm'
import type { Models } from 'appwrite'
import type { Domain as DomainType } from '@/types/domain'

export function DomainDashboard() {
  const [domains, setDomains] = useState<DomainType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false)

  useEffect(() => {
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      await initAuth()
      await fetchDomains()
    } catch (error: any) {
      setError(`Initialization failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchDomains() {
    try {
      // console.log('🔄 Fetching domains from database...')
      const data = await getDomains()
      // console.log('📋 Raw data from database:', data)

      // Convert Appwrite documents to Domain type
      const convertedDomains: DomainType[] = data.map((doc: Models.Document) => ({
        $id: doc.$id,
        domain: doc.domain || '',
        issued_date: doc.issued_date || '',
        expire_date: doc.expire_date || '',
        ssl_expire_date: doc.ssl_expire_date || '',
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt
      }))

      // console.log('🔄 Setting domains state:', convertedDomains)
      setDomains(convertedDomains)
      // console.log('✅ Data loaded successfully:', convertedDomains.length, 'domains')
    } catch (error: any) {
      console.error('❌ Failed to fetch domains:', error)
      setError(`Failed to fetch domains: ${error.message}`)
    }
  }

  const getStats = () => {
    const total = domains.length
    const active = domains.filter(d => {
      if (!d.expire_date) return false
      return new Date(d.expire_date) > new Date()
    }).length
    const expiringSoon = domains.filter(d => {
      if (!d.expire_date) return false
      const daysLeft = Math.ceil((new Date(d.expire_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 30 && daysLeft > 0
    }).length
    const expired = domains.filter(d => {
      if (!d.expire_date) return false
      return new Date(d.expire_date) < new Date()
    }).length

    return { total, active, expiringSoon, expired }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={initializeApp}>
          Retry
        </Button>
      </Container>
    )
  }

  const stats = getStats()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Domain Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsAddDomainOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            }
          }}
        >
          Add Domain
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Domains
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                </Box>
                <Domain color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.active}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Expiring Soon
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.expiringSoon}
                  </Typography>
                </Box>
                <Warning color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Expired
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.expired}
                  </Typography>
                </Box>
                <Error color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Domains Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Domains
          </Typography>
          <DomainsTable
            domains={domains.slice(0, 10)}
            onUpdate={async (domain) => {
              // Handle update - this will be called with the updated domain object
              console.log('🔄 Updating domain:', domain)
              try {
                // Extract the field that was updated
                const updateData: any = {}
                if (domain.expire_date) updateData.expire_date = domain.expire_date
                if (domain.issued_date) updateData.issued_date = domain.issued_date
                if (domain.ssl_expire_date) updateData.ssl_expire_date = domain.ssl_expire_date

                const result = await updateDomain(domain.$id, updateData)
                console.log('✅ Domain update successful:', result)
                await fetchDomains()
              } catch (error) {
                console.error('💥 Domain update failed:', error)
              }
            }}
            onDelete={async (domain) => {
              // Handle delete
              console.log('🔄 Deleting domain:', domain)
              try {
                await deleteDomain(domain.$id)
                console.log('✅ Domain deleted successfully:', domain.domain)
                console.log('🔄 Refreshing domains list...')
                await fetchDomains()
                console.log('✅ Domains list refreshed after delete')
              } catch (error) {
                console.error('💥 Domain delete failed:', error)
              }
            }}
            onSync={async (domain) => {
              // Handle domain sync
              console.log('🔄 Starting domain sync for:', domain)
              try {
                const result = await syncDomainWithWhois(domain)
                console.log('📋 Sync result:', result)

                if (result.success) {
                  console.log('✅ Domain WHOIS sync successful:', result)
                  console.log('🔄 Refreshing domains list...')

                  // Refresh the domains list
                  await fetchDomains()
                  console.log('✅ Domains list refreshed')
                } else {
                  console.error('❌ Domain WHOIS sync failed:', result.error)
                }
              } catch (error) {
                console.error('💥 Domain WHOIS sync failed:', error)
              }
            }}
            onSSLSync={async (domain) => {
              // Handle SSL sync
              console.log('SSL Sync domain:', domain)
              try {
                const result = await syncSSLCertificate(domain)
                if (result.success) {
                  console.log('✅ SSL sync successful:', result)
                  // Refresh the domains list
                  await fetchDomains()
                } else {
                  console.error('❌ SSL sync failed:', result.error)
                }
              } catch (error) {
                console.error('SSL sync failed:', error)
              }
            }}
            onUpdateDate={async (domainId, expireDate) => {
              // Handle update date
              console.log('🔄 Updating date for domain:', domainId, 'to:', expireDate)
              try {
                const result = await updateDomain(domainId, { expire_date: expireDate })
                console.log('✅ Date update successful:', result)
                // Refresh the domains list
                await fetchDomains()
              } catch (error) {
                console.error('💥 Date update failed:', error)
                throw error
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Add Domain Form */}
      <AddDomainForm
        isOpen={isAddDomainOpen}
        onClose={() => setIsAddDomainOpen(false)}
        onDomainAdded={fetchDomains}
      />
    </Container>
  )
}
