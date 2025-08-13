import { useState } from 'react'
import { 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Alert,
  CircularProgress
} from '@mui/material'
import { Add, Domain, DateRange } from '@mui/icons-material'
import { domainService } from '@/services/domain'
import type { CreateDomainData } from '@/types/domain'

interface AddDomainFormProps {
  onDomainAdded?: () => void
  isOpen: boolean
  onClose: () => void
}

export function AddDomainForm({ onDomainAdded, isOpen, onClose }: AddDomainFormProps) {
  const [formData, setFormData] = useState<CreateDomainData>({
    domain: '',
    issued_date: '',
    expire_date: '',
    ssl_issued_date: '',
    ssl_expire_date: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = (): boolean => {
    if (!formData.domain.trim()) {
      setError('Tên domain là bắt buộc')
      return false
    }
    if (!formData.issued_date) {
      setError('Ngày cấp là bắt buộc')
      return false
    }
    if (!formData.expire_date) {
      setError('Ngày hết hạn là bắt buộc')
      return false
    }
    
    const issuedDate = new Date(formData.issued_date)
    const expireDate = new Date(formData.expire_date)
    
    if (expireDate <= issuedDate) {
      setError('Expiration date must be after issue date')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await domainService.createDomain({
        domain: formData.domain.trim().toLowerCase(),
        issued_date: new Date(formData.issued_date).toISOString(),
        expire_date: new Date(formData.expire_date).toISOString(),
        ssl_issued_date: formData.ssl_issued_date ? new Date(formData.ssl_issued_date).toISOString() : '',
        ssl_expire_date: formData.ssl_expire_date ? new Date(formData.ssl_expire_date).toISOString() : ''
      })
      
      setSuccess(`✅ Domain "${formData.domain}" has been added successfully!`)
      
      // Reset form
      setFormData({
        domain: '',
        issued_date: '',
        expire_date: '',
        ssl_issued_date: '',
        ssl_expire_date: ''
      })
      
      // Notify parent to refresh the list
      if (onDomainAdded) {
        onDomainAdded()
      }

      // Close form after success
      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error adding domain:', error)
      setError(`❌ Error adding domain: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2} alignItems="flex-end">
        {/* Domain Input */}
        <Grid item xs={12} md={3}>
          <TextField
            name="domain"
            label="Domain"
            placeholder="example.com"
            value={formData.domain}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <Domain color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
          />
        </Grid>

        {/* Issued Date Input */}
        <Grid item xs={12} md={3}>
          <TextField
            name="issued_date"
            label="Issue Date"
            type="date"
            value={formData.issued_date}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
            fullWidth
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <DateRange color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
          />
        </Grid>

        {/* Expire Date Input */}
        <Grid item xs={12} md={2}>
          <TextField
            name="expire_date"
            label="Expiration Date"
            type="date"
            value={formData.expire_date}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
            fullWidth
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <DateRange color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
          />
        </Grid>

        {/* SSL Issued Date Input */}
        <Grid item xs={12} md={2}>
          <TextField
            name="ssl_issued_date"
            label="SSL Issue Date"
            type="date"
            value={formData.ssl_issued_date}
            onChange={handleInputChange}
            disabled={isSubmitting}
            fullWidth
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <DateRange color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
          />
        </Grid>

        {/* SSL Expire Date Input */}
        <Grid item xs={12} md={2}>
          <TextField
            name="ssl_expire_date"
            label="SSL Expiration Date"
            type="date"
            value={formData.ssl_expire_date}
            onChange={handleInputChange}
            disabled={isSubmitting}
            fullWidth
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <DateRange color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12} md={3}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            size="medium"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Add />
              )
            }
            sx={{ 
              py: 1.2,
              fontSize: '0.875rem',
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Domain'}
          </Button>
        </Grid>
      </Grid>

      {/* Status Messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2, fontSize: '0.875rem' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mt: 2, fontSize: '0.875rem' }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
    </Box>
  )
}
