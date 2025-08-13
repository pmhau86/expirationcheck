import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material'
import type { Domain } from '@/types/domain'
import { whoisService } from '@/services/whois'

interface WhoisInfoDialogProps {
  open: boolean
  onClose: () => void
  domain: Domain | null
}

interface WhoisData {
  domain: string
  expireDate: string | null
  registrar: string | null
  status: string | null
  createdDate: string | null
  updatedDate: string | null
  error?: string
}

export function WhoisInfoDialog({ open, onClose, domain }: WhoisInfoDialogProps) {
  const [whoisData, setWhoisData] = React.useState<WhoisData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && domain) {
      fetchWhoisData()
    }
  }, [open, domain])

  const fetchWhoisData = async () => {
    if (!domain) return

    setLoading(true)
    setError(null)
    setWhoisData(null)

    try {
      const data = await whoisService.getDomainWhois(domain.domain)
      setWhoisData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default'
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('active') || lowerStatus.includes('ok')) return 'success'
    if (lowerStatus.includes('pending') || lowerStatus.includes('hold')) return 'warning'
    if (lowerStatus.includes('expired') || lowerStatus.includes('suspended')) return 'error'
    return 'default'
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">
            🔍 WHOIS Information
          </Typography>
          {domain && (
            <Chip 
              label={domain.domain} 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box py={2}>
            <Typography color="error" variant="body2">
              ❌ Error: {error}
            </Typography>
          </Box>
        )}

        {whoisData && !loading && (
          <Box>
            {/* Domain Info */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Domain Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Domain:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {whoisData.domain}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Registrar:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {whoisData.registrar || 'Unknown'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip 
                    label={whoisData.status || 'Unknown'} 
                    color={getStatusColor(whoisData.status)}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Dates */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Important Dates
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Created:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(whoisData.createdDate)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Updated:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(whoisData.updatedDate)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Expires:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={700}
                    color={whoisData.expireDate ? 'primary.main' : 'error.main'}
                  >
                    {formatDate(whoisData.expireDate)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Warning if using simulated data */}
            {whoisData.error && (
              <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
                <Typography variant="body2" color="warning.dark">
                  ⚠️ {whoisData.error}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button 
          onClick={fetchWhoisData}
          disabled={loading}
          variant="outlined"
        >
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  )
}
