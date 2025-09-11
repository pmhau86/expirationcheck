// import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  // TextField,
  Box,
  Typography,
  Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format } from 'date-fns'
import { useState } from 'react'
interface UpdateDateDialogProps {
  open: boolean
  onClose: () => void
  domain: {
    $id: string
    domain: string
    expire_date?: string
  } | null
  onUpdate: (domainId: string, expireDate: string) => Promise<void>
}

export function UpdateDateDialog({ open, onClose, domain, onUpdate }: UpdateDateDialogProps) {
  const [expireDate, setExpireDate] = useState<Date | null>(
    domain?.expire_date ? new Date(domain.expire_date) : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!domain || !expireDate) {
      setError('Please select a valid date')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await onUpdate(domain.$id, expireDate.toISOString())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update date')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setExpireDate(domain?.expire_date ? new Date(domain.expire_date) : null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Expiration Date
        {domain && (
          <Typography variant="subtitle2" color="text.secondary">
            Domain: {domain.domain}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <DatePicker
            label="Expiration Date"
            value={expireDate}
            onChange={(newValue) => setExpireDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
            minDate={new Date()}
          />

          {expireDate && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected: {format(expireDate, 'PPP')}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !expireDate}
        >
          {isLoading ? 'Updating...' : 'Update Date'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
