import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  IconButton, 
  Typography,
  Box,
  Tooltip,
  TableSortLabel,
  CircularProgress,
  Alert
} from '@mui/material'
import { 
  Sync, 
  Delete, 
  CheckCircle, 
  Warning, 
  Error,
  CalendarToday,
  Update
} from '@mui/icons-material'
import type { Domain } from '@/types/domain'
import { UpdateDomainDialog } from './UpdateDomainDialog'

interface DomainsTableProps {
  domains: Domain[]
  onSync?: (domain: Domain) => Promise<void>
  onUpdate?: (domain: Domain) => Promise<void>
  onDelete?: (domain: Domain) => Promise<void>
  onSSLUpdate?: (domain: Domain) => Promise<void>
  onSSLSync?: (domain: Domain) => Promise<void>
}

type SortOrder = 'asc' | 'desc'
type SortField = 'domain' | 'issued_date' | 'expire_date' | 'ssl_expire_date' | 'status' | 'days_left' | 'ssl_days_left'

export function DomainsTable({ domains, onSync, onUpdate, onDelete, onSSLUpdate, onSSLSync }: DomainsTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [sortField, setSortField] = useState<SortField>('domain')
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [sslUpdatingIds, setSSLUpdatingIds] = useState<Set<string>>(new Set())
  const [sslSyncingIds, setSSLSyncingIds] = useState<Set<string>>(new Set())
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [updateType, setUpdateType] = useState<'domain' | 'ssl'>('domain')
  const [syncError, setSyncError] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortField(field)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusInfo = (domain: Domain) => {
    const expireDate = new Date(domain.expire_date)
    const now = new Date()
    const isExpired = expireDate < now
    const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (isExpired) {
      return { 
        status: 'EXPIRED', 
        color: 'error' as const,
        icon: <Error />,
        daysLeft: Math.abs(daysLeft),
        daysText: `Expired ${Math.abs(daysLeft)} days ago`
      }
    }
    
    if (daysLeft <= 30) {
      return { 
        status: 'EXPIRING', 
        color: 'warning' as const,
        icon: <Warning />,
        daysLeft,
        daysText: `${daysLeft} days left`
      }
    }
    
    return { 
      status: 'ACTIVE', 
      color: 'success' as const,
      icon: <CheckCircle />,
      daysLeft,
      daysText: `${daysLeft} days left`
    }
  }

  const getSSLStatusInfo = (domain: Domain) => {
    if (!domain.ssl_expire_date) {
      return {
        daysLeft: null,
        daysText: '-',
        color: 'text.secondary' as const
      }
    }

    const sslExpireDate = new Date(domain.ssl_expire_date)
    const now = new Date()
    const isExpired = sslExpireDate < now
    const daysLeft = Math.ceil((sslExpireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (isExpired) {
      return { 
        daysLeft: Math.abs(daysLeft),
        daysText: `Expired ${Math.abs(daysLeft)} days ago`,
        color: 'error.dark' as const
      }
    }
    
    if (daysLeft <= 30) {
      return { 
        daysLeft,
        daysText: `${daysLeft} days left`,
        color: 'warning.dark' as const
      }
    }
    
    return { 
      daysLeft,
      daysText: `${daysLeft} days left`,
      color: 'success.dark' as const
    }
  }

  const handleDelete = async (domain: Domain) => {
    if (!onDelete) return
    
    const confirmed = window.confirm(`Are you sure you want to delete domain "${domain.domain}"?`)
    if (!confirmed) return

    setDeletingIds(prev => new Set(prev).add(domain.$id))
    try {
      await onDelete(domain)
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(domain.$id)
        return next
      })
    }
  }

  const handleSync = async (domain: Domain) => {
    if (!onSync) return

    setSyncError(null) // Clear previous errors
    setSyncingIds(prev => new Set(prev).add(domain.$id))
    try {
      await onSync(domain)
    } catch (error: any) {
      setSyncError(`WHOIS sync failed for "${domain.domain}". Please input expiration date manually.`)
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev)
        next.delete(domain.$id)
        return next
      })
    }
  }

  const handleUpdate = async (domain: Domain) => {
    setSelectedDomain(domain)
    setUpdateType('domain')
    setUpdateDialogOpen(true)
  }

  const handleUpdateSubmit = async (domainId: string, newExpireDate: string) => {
    if (updateType === 'ssl') {
      if (!onSSLUpdate) return

      setSSLUpdatingIds(prev => new Set(prev).add(domainId))
      try {
        await onSSLUpdate({ ...selectedDomain!, ssl_expire_date: newExpireDate })
      } finally {
        setSSLUpdatingIds(prev => {
          const next = new Set(prev)
          next.delete(domainId)
          return next
        })
      }
    } else {
      if (!onUpdate) return

      setUpdatingIds(prev => new Set(prev).add(domainId))
      try {
        await onUpdate({ ...selectedDomain!, expire_date: newExpireDate })
      } finally {
        setUpdatingIds(prev => {
          const next = new Set(prev)
          next.delete(domainId)
          return next
        })
      }
    }
  }

  const handleSSLUpdate = async (domain: Domain) => {
    if (!onSSLUpdate) return
    
    setSelectedDomain(domain)
    setUpdateType('ssl')
    setUpdateDialogOpen(true)
  }

  const handleSSLSync = async (domain: Domain) => {
    if (!onSSLSync) return

    setSyncError(null) // Clear previous errors
    setSSLSyncingIds(prev => new Set(prev).add(domain.$id))
    try {
      await onSSLSync(domain)
    } catch (error: any) {
      setSyncError(`SSL sync failed for "${domain.domain}". Please input SSL expiration date manually.`)
    } finally {
      setSSLSyncingIds(prev => {
        const next = new Set(prev)
        next.delete(domain.$id)
        return next
      })
    }
  }

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false)
    setSelectedDomain(null)
  }

  const sortedDomains = [...domains].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (sortField) {
      case 'domain':
        aValue = a.domain
        bValue = b.domain
        break
      case 'issued_date':
        aValue = new Date(a.issued_date)
        bValue = new Date(b.issued_date)
        break
      case 'expire_date':
        aValue = new Date(a.expire_date)
        bValue = new Date(b.expire_date)
        break
      case 'ssl_expire_date':
        aValue = new Date(a.ssl_expire_date || '1970-01-01')
        bValue = new Date(b.ssl_expire_date || '1970-01-01')
        break
      case 'status':
        aValue = getStatusInfo(a).status
        bValue = getStatusInfo(b).status
        break
      case 'days_left':
        aValue = getStatusInfo(a).daysLeft
        bValue = getStatusInfo(b).daysLeft
        break
      case 'ssl_days_left':
        aValue = getSSLStatusInfo(a).daysLeft ?? 999999
        bValue = getSSLStatusInfo(b).daysLeft ?? 999999
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  if (domains.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          🔍 No domains found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first domain using the form below
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      {/* Sync Error Alert */}
      {syncError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setSyncError(null)}
        >
                     <Typography variant="body2">
             <strong>Sync Error:</strong> {syncError}
           </Typography>
        </Alert>
      )}
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 3,
          borderRadius: 3,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            transition: 'box-shadow 0.3s ease'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'domain'}
                  direction={sortField === 'domain' ? sortOrder : 'asc'}
                  onClick={() => handleSort('domain')}
                  sx={{ fontWeight: 'bold' }}
                >
                  🌐 Domain
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                  sx={{ fontWeight: 'bold' }}
                >
                  📊 Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'issued_date'}
                  direction={sortField === 'issued_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('issued_date')}
                  sx={{ fontWeight: 'bold' }}
                >
                  📅 Issued Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'expire_date'}
                  direction={sortField === 'expire_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('expire_date')}
                  sx={{ fontWeight: 'bold' }}
                >
                  ⏰ Expires Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'days_left'}
                  direction={sortField === 'days_left' ? sortOrder : 'asc'}
                  onClick={() => handleSort('days_left')}
                  sx={{ fontWeight: 'bold' }}
                >
                  ⏳ Days Left
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'ssl_expire_date'}
                  direction={sortField === 'ssl_expire_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('ssl_expire_date')}
                  sx={{ fontWeight: 'bold' }}
                >
                  🔒 SSL Expires
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'ssl_days_left'}
                  direction={sortField === 'ssl_days_left' ? sortOrder : 'asc'}
                  onClick={() => handleSort('ssl_days_left')}
                  sx={{ fontWeight: 'bold' }}
                >
                  ⏳ SSL Days Left
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                ⚡ Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDomains.map((domain, index) => {
                             const statusInfo = getStatusInfo(domain)
               const isDeleting = deletingIds.has(domain.$id)
               const isSyncing = syncingIds.has(domain.$id)
               const isUpdating = updatingIds.has(domain.$id)
               const isSSLUpdating = sslUpdatingIds.has(domain.$id)
               const isSSLSyncing = sslSyncingIds.has(domain.$id)
              
              return (
                <TableRow 
                  key={domain.$id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: statusInfo.color === 'success' ? 'success.50' : 
                               statusInfo.color === 'warning' ? 'warning.50' : 'error.50',
                      transition: 'background-color 0.2s ease'
                    },
                    bgcolor: index % 2 === 0 ? 'grey.50' : 'white'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {statusInfo.icon}
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {domain.domain}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={statusInfo.status}
                      color={statusInfo.color}
                      size="small"
                      icon={statusInfo.icon}
                      sx={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        minWidth: 90
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(domain.issued_date)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography 
                        variant="body2"
                        color={statusInfo.color === 'error' ? 'error.main' : 'text.primary'}
                        fontWeight={statusInfo.color === 'error' ? 700 : 400}
                      >
                        {formatDate(domain.expire_date)}
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        {/* Manual Update Button */}
                        {onUpdate && (
                          <Tooltip title="Update expire date manually">
                            <IconButton
                              size="small"
                              color="info"
                              disabled={isUpdating || isSyncing}
                              onClick={() => handleUpdate(domain)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'info.50',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              {isUpdating ? (
                                <CircularProgress size={14} color="info" />
                              ) : (
                                <Update fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* Sync Domain Button */}
                        <Tooltip title="Sync domain with WHOIS">
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={isSyncing || isUpdating}
                            onClick={() => handleSync(domain)}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: 'primary.50',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            {isSyncing ? (
                              <CircularProgress size={14} color="primary" />
                            ) : (
                              <Sync fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight={700}
                      color={statusInfo.color + '.dark'}
                    >
                      {statusInfo.daysText}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {domain.ssl_expire_date ? formatDate(domain.ssl_expire_date) : '-'}
                      </Typography>
                      <Box display="flex" gap={0.5}>
                        {/* SSL Manual Update Button */}
                        {onSSLUpdate && (
                          <Tooltip title="Update SSL expire date manually">
                            <IconButton
                              size="small"
                              color="info"
                              disabled={isSSLUpdating || isSSLSyncing}
                              onClick={() => handleSSLUpdate(domain)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'info.50',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              {isSSLUpdating ? (
                                <CircularProgress size={14} color="info" />
                              ) : (
                                <Update fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* SSL Sync Button */}
                        {onSSLSync && (
                          <Tooltip title="Sync SSL certificate with server">
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={isSSLSyncing || isSSLUpdating}
                              onClick={() => handleSSLSync(domain)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'primary.50',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              {isSSLSyncing ? (
                                <CircularProgress size={14} color="primary" />
                              ) : (
                                <Sync fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight={700}
                      color={getSSLStatusInfo(domain).color}
                    >
                      {getSSLStatusInfo(domain).daysText}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {/* Delete Button */}
                    {onDelete && (
                      <Tooltip title="Delete domain">
                        <IconButton
                          size="small"
                          color="error"
                                                     disabled={isDeleting || isSyncing || isUpdating || isSSLUpdating || isSSLSyncing}
                          onClick={() => handleDelete(domain)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'error.50',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        >
                          {isDeleting ? (
                            <CircularProgress size={16} color="error" />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Domain Dialog */}
      <UpdateDomainDialog
        open={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
        domain={selectedDomain}
        onUpdate={handleUpdateSubmit}
        updateType={updateType}
      />
    </>
  )
}
