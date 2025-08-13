import { Box, Chip } from '@mui/material'
import { CheckCircle, Warning } from '@mui/icons-material'

interface StatusBannerProps {
  isLive: boolean
  message?: string
}

export function StatusBanner({ isLive, message }: StatusBannerProps) {
  const defaultMessage = isLive 
    ? 'Live Data Connected' 
    : 'Demo Mode Active'

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: isLive ? 'success.main' : 'warning.main',
        color: 'white',
        py: 1.5,
        px: 3,
        textAlign: 'center',
        boxShadow: 3,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Chip
          icon={isLive ? <CheckCircle /> : <Warning />}
          label={message || defaultMessage}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'inherit',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: 'inherit',
              animation: 'pulse 2s infinite',
            },
          }}
        />
      </Box>
    </Box>
  )
}
