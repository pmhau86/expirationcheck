import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import { Update, CalendarToday } from '@mui/icons-material'
import type { Domain } from '@/types/domain'

interface UpdateDomainDialogProps {
  open: boolean
  onClose: () => void
  domain: Domain | null
  onUpdate: (domainId: string, newDate: string) => Promise<void>
  updateType?: 'domain' | 'ssl'
  dateField?: 'issued_date' | 'expire_date' | 'ssl_expire_date'
}

export function UpdateDomainDialog({ 
  open, 
  onClose, 
  domain, 
  onUpdate,
  updateType = 'domain',
  dateField = 'expire_date'
}: UpdateDomainDialogProps) {
  const [expireDate, setExpireDate] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens/closes
  const handleClose = () => {
    setExpireDate('')
    setError(null)
    setIsUpdating(false)
    onClose()
  }

  // Set initial date when domain changes
  const handleDomainChange = () => {
    if (domain) {
      const currentDate = new Date(domain[dateField] || new Date())
      setExpireDate(currentDate.toISOString().split('T')[0])
    }
  }

  // Update when domain prop changes
  useEffect(() => {
    if (open && domain) {
      handleDomainChange()
    }
  }, [open, domain])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain || !expireDate) return

    setIsUpdating(true)
    setError(null)

    try {
      // Validate date
      const newDate = new Date(expireDate)
      if (isNaN(newDate.getTime())) {
        throw new Error('Invalid date format')
      }

      // Convert to ISO string for database
      const isoDate = newDate.toISOString()
      
      await onUpdate(domain.$id, isoDate)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update domain')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!domain) return null

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 6
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: 'white'
            }}
          >
            <Update />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Update {dateField === 'ssl_expire_date' ? 'SSL ' : ''}{dateField === 'issued_date' ? 'Issued' : 'Expire'} Date
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Domain: <strong>{domain.domain}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current {dateField === 'ssl_expire_date' ? 'SSL ' : ''}{dateField === 'issued_date' ? 'issued' : 'expire'} date: {
                domain[dateField] ? new Date(domain[dateField]).toLocaleDateString() : 'Not set'
              }
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={`New ${dateField === 'ssl_expire_date' ? 'SSL ' : ''}${dateField === 'issued_date' ? 'Issued' : 'Expire'} Date`}
            type="date"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            sx={{ mb: 2 }}
            required
            disabled={isUpdating}
          />

          <Typography variant="caption" color="text.secondary">
            💡 This will manually update the {dateField === 'ssl_expire_date' ? 'SSL certificate ' : ''}{dateField === 'issued_date' ? 'issued' : 'expiration'} date. {dateField === 'ssl_expire_date' ? 'Use the SSL Sync button to get real certificate data.' : dateField === 'issued_date' ? 'This is the domain registration date.' : 'Use the Sync button to get real WHOIS data.'}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose}
            disabled={isUpdating}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUpdating || !expireDate}
            startIcon={isUpdating ? <CircularProgress size={16} /> : <Update />}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              }
            }}
          >
            {isUpdating ? 'Updating...' : 'Update Date'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
