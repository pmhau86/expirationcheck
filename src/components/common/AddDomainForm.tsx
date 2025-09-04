import { useState } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Box,
  Typography,
  Grid,
  Divider
} from '@mui/material'
import { 
  Add, 
  CalendarToday, 
  Domain,
  Security
} from '@mui/icons-material'
import { createDomain } from '@/services/domain'
import type { CreateDomainData } from '@/types/domain'

interface AddDomainFormProps {
  isOpen: boolean
  onClose: () => void
  onDomainAdded: () => void
}

export function AddDomainForm({ isOpen, onClose, onDomainAdded }: AddDomainFormProps) {
  const [formData, setFormData] = useState<CreateDomainData>({
    domain: '',
    issued_date: '',
    expire_date: '',
    ssl_expire_date: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof CreateDomainData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await createDomain(formData)
      setFormData({
        domain: '',
        issued_date: '',
        expire_date: '',
        ssl_expire_date: ''
      })
      onDomainAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add domain')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        domain: '',
        issued_date: '',
        expire_date: '',
        ssl_expire_date: ''
      })
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}
          >
            <Add />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Add New Domain
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Domain Information */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Domain color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Domain Information
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                autoFocus
                fullWidth
                label="Domain Name"
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                placeholder="example.com"
                disabled={isLoading}
                error={!!error && !formData.domain.trim()}
                helperText={!formData.domain.trim() && error ? error : ''}
                required
                InputProps={{
                  startAdornment: <Domain sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Domain Registration Dates */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalendarToday color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Domain Registration Dates
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Issued Date"
                type="date"
                value={formData.issued_date}
                onChange={(e) => handleInputChange('issued_date', e.target.value)}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expire Date"
                type="date"
                value={formData.expire_date}
                onChange={(e) => handleInputChange('expire_date', e.target.value)}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* SSL Certificate Information */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Security color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  SSL Certificate Information
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SSL Expire Date"
                type="date"
                value={formData.ssl_expire_date}
                onChange={(e) => handleInputChange('ssl_expire_date', e.target.value)}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  💡 <strong>Note:</strong> You can leave SSL dates empty and use the SSL Sync feature later to automatically fetch certificate information.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading || !formData.domain.trim()}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Add />}
            sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            {isLoading ? 'Adding...' : 'Add Domain'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
