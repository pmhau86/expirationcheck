import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Chip, 
  Button, 
  Box, 
  Divider
} from '@mui/material'
import { 
  Sync, 
  Delete, 
  CheckCircle, 
  Warning, 
  Error,
  CalendarToday
} from '@mui/icons-material'
import type { Domain } from '@/types/domain'

interface DomainCardProps {
  domain: Domain
  onSync?: (domain: Domain) => void
  onDelete?: (domain: Domain) => void
}

export function DomainCard({ domain, onSync, onDelete }: DomainCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusInfo = () => {
    const expireDate = new Date(domain.expire_date)
    const now = new Date()
    const isExpired = expireDate < now
    const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (isExpired) {
      return { 
        status: 'EXPIRED', 
        color: 'error' as const,
        icon: <Error />,
        bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)', // Red gradient
        chipColor: 'error' as const
      }
    }
    
    if (daysLeft <= 30) {
      return { 
        status: 'EXPIRING', 
        color: 'warning' as const,
        icon: <Warning />,
        bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)', // Yellow gradient
        chipColor: 'warning' as const
      }
    }
    
    return { 
      status: 'ACTIVE', 
      color: 'success' as const,
      icon: <CheckCircle />,
      bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)', // Green gradient
      chipColor: 'success' as const
    }
  }

  const getDaysInfo = () => {
    const expireDate = new Date(domain.expire_date)
    const now = new Date()
    const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (expireDate < now) {
      return {
        text: `Expired ${Math.abs(daysLeft)} days ago`,
        color: 'text-red-600'
      }
    }
    
    return {
      text: `${daysLeft} days left`,
      color: daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600'
    }
  }

  const statusInfo = getStatusInfo()
  const daysInfo = getDaysInfo()

  const handleDelete = async () => {
    if (!onDelete) return
    
    const confirmed = window.confirm(`Are you sure you want to delete domain "${domain.domain}"?`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await onDelete(domain)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 280, // Minimum height for consistent sizing
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: statusInfo.bgGradient,
        border: `2px solid ${
          statusInfo.color === 'success' ? '#22c55e' : 
          statusInfo.color === 'warning' ? '#f59e0b' : '#ef4444'
        }20`, // 20% opacity border
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: `0 20px 40px -8px ${
            statusInfo.color === 'success' ? '#22c55e' : 
            statusInfo.color === 'warning' ? '#f59e0b' : '#ef4444'
          }30`, // Colored shadow
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
            {statusInfo.icon}
            <Typography variant="h6" component="h3" noWrap fontSize="0.95rem" fontWeight={600}>
              {domain.domain}
            </Typography>
          </Box>
          <Chip
            label={statusInfo.status}
            color={statusInfo.chipColor}
            size="small"
            icon={statusInfo.icon}
            sx={{ 
              fontSize: '0.7rem', 
              fontWeight: 700,
              minWidth: 'auto',
              boxShadow: 2,
              '& .MuiChip-icon': {
                fontSize: '0.8rem'
              }
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Domain Info */}
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
              Issued:
            </Typography>
            <Typography variant="body2" fontWeight={600} fontSize="0.75rem">
              {formatDate(domain.issued_date)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
              Expires:
            </Typography>
            <Typography variant="body2" fontWeight={600} fontSize="0.75rem">
              {formatDate(domain.expire_date)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
              Days left:
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={700} 
              fontSize="0.8rem"
              color={statusInfo.color + '.dark'}
            >
              {daysInfo.text}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1, flexDirection: 'column' }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          startIcon={<Sync />}
          onClick={() => onSync && onSync(domain)}
          sx={{ 
            fontSize: '0.7rem',
            py: 0.5,
          }}
        >
          Sync
        </Button>
        
        {onDelete && (
          <Button
            variant="outlined"
            size="small"
            fullWidth
            color="error"
            startIcon={isDeleting ? <CalendarToday /> : <Delete />}
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{ 
              fontSize: '0.7rem',
              py: 0.5,
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </CardActions>
    </Card>
  )
}
