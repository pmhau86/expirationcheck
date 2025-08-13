import { useState, useEffect } from 'react'
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Paper,
  Box,
  CircularProgress
} from '@mui/material'
import { 
  Refresh, 
  Visibility, 
  CheckCircle, 
  Warning, 
  Error,
  Add as AddIcon
} from '@mui/icons-material'
import { domainService } from '@/services/domain'
import type { Domain, DomainStats } from '@/types/domain'
import { AddDomainForm } from '@/components/common/AddDomainForm'
import { StatusBanner } from '@/components/common/StatusBanner'
import { DomainsTable } from '@/components/common/DomainsTable'
// import { WhoisInfoDialog } from '@/components/common/WhoisInfoDialog'

export function DomainListPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [stats, setStats] = useState<DomainStats>({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)
  // const [whoisDialogOpen, setWhoisDialogOpen] = useState(false)
  // const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [domainsData, statsData] = await Promise.all([
        domainService.getAllDomains(),
        domainService.getStats()
      ])
      
      setDomains(domainsData)
      setStats(statsData)
      setIsLive(true)
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'An error occurred while loading data')
      setIsLive(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDomain = async (domain: Domain) => {
    if (!window.confirm(`Are you sure you want to delete domain "${domain.domain}"?`)) {
      return
    }
    try {
      await domainService.deleteDomain(domain.$id)
      await loadData() // Refresh data
      alert(`✅ Domain "${domain.domain}" has been deleted successfully!`)
    } catch (error: any) {
      console.error('Error deleting domain:', error)
      alert(`❌ Error deleting domain: ${error.message}`)
    }
  }

  const handleSyncDomain = async (domain: Domain) => {
    try {
      // Show loading state
      console.log(`🔄 Syncing expire date for ${domain.domain}...`)
      
      // Call sync service
      const syncedDomain = await domainService.syncDomainExpireDate(domain)
      
      // Check if expire date actually changed
      const oldExpireDate = new Date(domain.expire_date)
      const newExpireDate = new Date(syncedDomain.expire_date)
      
      if (oldExpireDate.getTime() !== newExpireDate.getTime()) {
        // Expire date changed - show success message
        alert(`🔄 Sync completed for "${domain.domain}"!\n\nOld expire date: ${oldExpireDate.toLocaleDateString()}\nNew expire date: ${newExpireDate.toLocaleDateString()}`)
      } else {
        // No change - still show confirmation
        alert(`✅ Sync completed for "${domain.domain}"!\n\nExpire date confirmed: ${newExpireDate.toLocaleDateString()}`)
      }
      
      // Refresh data to show updated information
      await loadData()
      
    } catch (error: any) {
      console.error('Error syncing domain:', error)
      alert(`❌ Error syncing "${domain.domain}": ${error.message}`)
    }
  }

  const handleUpdateDomain = async (domain: Domain) => {
    try {
      // Update domain with new expire date
      const updatedDomain = await domainService.updateDomain(domain.$id, {
        expire_date: domain.expire_date
      })
      
      console.log(`✅ Manual update completed for ${domain.domain}`)
      alert(`✅ Expire date updated for "${domain.domain}"!\n\nNew expire date: ${new Date(updatedDomain.expire_date).toLocaleDateString()}`)
      
      // Refresh data to show updated information
      await loadData()
      
    } catch (error: any) {
      console.error('Error updating domain:', error)
      alert(`❌ Error updating "${domain.domain}": ${error.message}`)
    }
  }

  const handleSSLUpdateDomain = async (domain: Domain) => {
    try {
      // Update domain with new SSL expire date
      const updatedDomain = await domainService.updateDomain(domain.$id, {
        ssl_expire_date: domain.ssl_expire_date
      })
      
      console.log(`✅ SSL manual update completed for ${domain.domain}`)
      alert(`✅ SSL expire date updated for "${domain.domain}"!\n\nNew SSL expire date: ${new Date(updatedDomain.ssl_expire_date).toLocaleDateString()}`)
      
      // Refresh data to show updated information
      await loadData()
      
    } catch (error: any) {
      console.error('Error updating SSL domain:', error)
      alert(`❌ Error updating SSL for "${domain.domain}": ${error.message}`)
    }
  }

  const handleSSLSyncDomain = async (domain: Domain) => {
    try {
      // Show loading state
      console.log(`🔄 Syncing SSL expire date for ${domain.domain}...`)
      
      // Call SSL sync service
      const syncedDomain = await domainService.syncSSLExpireDate(domain)
      
      // Check if SSL expire date actually changed
      const oldSSLExpireDate = domain.ssl_expire_date ? new Date(domain.ssl_expire_date) : null
      const newSSLExpireDate = new Date(syncedDomain.ssl_expire_date)
      
      if (!oldSSLExpireDate || oldSSLExpireDate.getTime() !== newSSLExpireDate.getTime()) {
        // SSL expire date changed - show success message
        alert(`🔄 SSL sync completed for "${domain.domain}"!\n\nOld SSL expire date: ${oldSSLExpireDate ? oldSSLExpireDate.toLocaleDateString() : 'Not set'}\nNew SSL expire date: ${newSSLExpireDate.toLocaleDateString()}`)
      } else {
        // No change - still show confirmation
        alert(`✅ SSL sync completed for "${domain.domain}"!\n\nSSL expire date confirmed: ${newSSLExpireDate.toLocaleDateString()}`)
      }
      
      // Refresh data to show updated information
      await loadData()
      
    } catch (error: any) {
      console.error('Error syncing SSL domain:', error)
      alert(`❌ Error syncing SSL for "${domain.domain}": ${error.message}`)
    }
  }

  // const handleViewWhois = (domain: Domain) => {
  //   setSelectedDomain(domain)
  //   setWhoisDialogOpen(true)
  // }

  // const handleCloseWhoisDialog = () => {
  //   setWhoisDialogOpen(false)
  //   setSelectedDomain(null)
  // }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading data...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Error color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
            Error Loading Data
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
                      <Button 
            variant="contained"
            color="error"
            size="large"
            startIcon={<Refresh />}
            onClick={loadData}
            fullWidth
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBanner isLive={isLive} />
      
      <Container maxWidth="xl" sx={{ pt: 8, pb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
            🌐 Domain Portfolio
          </Typography>
          <Button 
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadData}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: 'white',
                      mr: 2 
                    }}
                  >
                    <Visibility />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="primary.dark" sx={{ textTransform: 'uppercase' }}>
                      Total Domains
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {stats.total}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="primary.main" fontWeight="medium">
                  📊 Complete overview
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
                '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                      color: 'white',
                      mr: 2 
                    }}
                  >
                    <CheckCircle />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="success.dark" sx={{ textTransform: 'uppercase' }}>
                      Active
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.dark">
                      {stats.active}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main" fontWeight="medium">
                  ✅ Healthy domains
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                      color: 'white',
                      mr: 2 
                    }}
                  >
                    <Warning />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="warning.dark" sx={{ textTransform: 'uppercase' }}>
                      Expiring Soon
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.dark">
                      {stats.expiringSoon}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="warning.main" fontWeight="medium">
                  ⚠️ Need attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                      color: 'white',
                      mr: 2 
                    }}
                  >
                    <Error />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="error.dark" sx={{ textTransform: 'uppercase' }}>
                      Expired
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.dark">
                      {stats.expired}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="error.main" fontWeight="medium">
                  ❌ Urgent renewal
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Domains Table */}
        <DomainsTable 
          domains={domains}
          onSync={handleSyncDomain}
          onUpdate={handleUpdateDomain}
          onDelete={handleDeleteDomain}
          onSSLUpdate={handleSSLUpdateDomain}
          onSSLSync={handleSSLSyncDomain}
        />

        {/* Add Domain Form */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(236,72,153,0.05) 100%)',
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                color: 'white',
                mr: 2 
              }}
            >
              <AddIcon />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Add New Domain
            </Typography>
          </Box>
          <AddDomainForm 
            isOpen={true}
            onClose={() => {}}
            onDomainAdded={loadData}
          />
        </Paper>

        {/* WHOIS Info Dialog - temporarily disabled
        <WhoisInfoDialog
          open={whoisDialogOpen}
          onClose={handleCloseWhoisDialog}
          domain={selectedDomain}
        />
        */}

      </Container>
    </Box>
  )
}