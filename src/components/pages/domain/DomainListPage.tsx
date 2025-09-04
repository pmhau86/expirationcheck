import { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  Button,
  Fab,
  Paper,
  Snackbar
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { getDomains, deleteDomain, syncSSLCertificate } from '@/services/domain'
import { initAuth } from '@/lib/appwrite'
import { DomainsTable } from '@/components/common/DomainsTable'
import { AddDomainForm } from '@/components/common/AddDomainForm'
import type { Models } from 'appwrite'
import type { Domain as DomainType } from '@/types/domain'

export function DomainListPage() {
  const [domains, setDomains] = useState<DomainType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

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
      const data = await getDomains()
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
      setDomains(convertedDomains)
      console.log('✅ Data loaded successfully:', convertedDomains.length, 'domains')
    } catch (error: any) {
      setError(`Failed to fetch domains: ${error.message}`)
    }
  }

  async function handleDeleteDomain(domain: DomainType) {
    try {
      await deleteDomain(domain.$id)
      await fetchDomains()
    } catch (error: any) {
      setError(`Failed to delete domain: ${error.message}`)
    }
  }

  async function handleUpdateDomain(domain: DomainType) {
    try {
      // Handle domain update
      console.log('Update domain:', domain)
      await fetchDomains()
    } catch (error: any) {
      setError(`Failed to update domain: ${error.message}`)
    }
  }

  async function handleSyncDomain(domain: DomainType) {
    try {
      // Handle domain sync
      console.log('Sync domain:', domain)
      await fetchDomains()
    } catch (error: any) {
      setError(`Failed to sync domain: ${error.message}`)
    }
  }

  async function handleSSLUpdateDomain(domain: DomainType) {
    try {
      // Handle SSL update
      console.log('SSL update domain:', domain)
      await fetchDomains()
    } catch (error: any) {
      setError(`Failed to update SSL: ${error.message}`)
    }
  }

  async function handleSSLSyncDomain(domain: DomainType) {
    try {
      console.log(`🔄 Starting SSL sync for ${domain.domain}...`)
      
      const result = await syncSSLCertificate(domain)
      
      if (result.success) {
        setSyncMessage({
          type: 'success',
          message: `SSL certificate synced for ${domain.domain}. New expire date: ${new Date(result.newSSLExpireDate!).toLocaleDateString()}`
        })
        await fetchDomains() // Refresh the list
      } else {
        setSyncMessage({
          type: 'error',
          message: `SSL sync failed for ${domain.domain}: ${result.error}`
        })
      }
    } catch (error: any) {
      setSyncMessage({
        type: 'error',
        message: `SSL sync error for ${domain.domain}: ${error.message}`
      })
    }
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Domain Manager
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your domains and monitor their expiration dates
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            }
          }}
        >
          Add Domain
        </Button>
      </Box>

      {/* Stats Summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Box display="flex" gap={4}>
          <Box>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {domains.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Domains
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {domains.filter(d => {
                if (!d.expire_date) return false
                return new Date(d.expire_date) > new Date()
              }).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {domains.filter(d => {
                if (!d.expire_date) return false
                const daysLeft = Math.ceil((new Date(d.expire_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return daysLeft <= 30 && daysLeft > 0
              }).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Expiring Soon
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {domains.filter(d => {
                if (!d.expire_date) return false
                return new Date(d.expire_date) < new Date()
              }).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Expired
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Domains Table */}
      <DomainsTable 
        domains={domains}
        onUpdate={handleUpdateDomain}
        onDelete={handleDeleteDomain}
        onSync={handleSyncDomain}
        onSSLUpdate={handleSSLUpdateDomain}
        onSSLSync={handleSSLSyncDomain}
      />

      {/* Add Domain FAB for mobile */}
      <Fab 
        color="primary" 
        aria-label="add domain"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Add Domain Dialog */}
      <AddDomainForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onDomainAdded={fetchDomains}
      />

      {/* Sync Message Snackbar */}
      <Snackbar
        open={!!syncMessage}
        autoHideDuration={6000}
        onClose={() => setSyncMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSyncMessage(null)} 
          severity={syncMessage?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {syncMessage?.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}