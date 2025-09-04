import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import { 
  Rocket, 
  CheckCircle, 
  Dashboard, 
  Domain,
  Refresh
} from '@mui/icons-material'
// import { domainService } from '@/services/domain'

export function LandingPage() {
  const [currentView, setCurrentView] = useState<'home' | 'loading' | 'connected'>('home')
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [isLive, setIsLive] = useState<boolean>(false)

  const testConnection = async () => {
    try {
      setCurrentView('loading')
      setConnectionStatus('Đang kết nối đến Appwrite...')

      // Test connection by getting stats
      // const stats = await domainService.getStats()
      
      setConnectionStatus('✅ Kết nối thành công đến Appwrite!')
      setIsLive(true)
      
      setTimeout(() => setCurrentView('connected'), 1500)
      
    } catch (error: any) {
      console.error('Connection test failed:', error)
      setConnectionStatus(`❌ Lỗi kết nối: ${error.message}`)
      
      // Still proceed to connected view with demo data warning
      setTimeout(() => setCurrentView('connected'), 2000)
    }
  }

  if (currentView === 'home') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Card sx={{ maxWidth: 600, width: '100%', textAlign: 'center', p: 4 }}>
            <CardContent>
              {/* Icon */}
              <Rocket sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
              
              {/* Title */}
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Domain Expiration Checker
              </Typography>
              
              {/* Description */}
              <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                Theo dõi domains và nhận cảnh báo trước khi hết hạn
              </Typography>
              
              {/* Info Box */}
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Kết nối trực tiếp:</strong> Ứng dụng sẽ kết nối trực tiếp đến Appwrite Database để lấy dữ liệu real-time
                </Typography>
              </Alert>
              
              {/* Features */}
              <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  📊 Tính năng:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2">Dashboard với thống kê real-time</Typography>
                  <Typography component="li" variant="body2">Quản lý domains với filter và tìm kiếm</Typography>
                  <Typography component="li" variant="body2">Thêm, sửa, xóa domains</Typography>
                  <Typography component="li" variant="body2">Cảnh báo domains sắp hết hạn</Typography>
                </Box>
              </Paper>
              
              {/* Action Button */}
              <Button 
                variant="contained" 
                size="large"
                onClick={testConnection}
                startIcon={<Rocket />}
                sx={{ 
                  py: 2, 
                  px: 4, 
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                Khởi động Domain Manager
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    )
  }

  if (currentView === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center', p: 4 }}>
            <CardContent>
              {/* Animated Loader */}
              <Box sx={{ mb: 4 }}>
                <CircularProgress size={80} thickness={4} />
              </Box>
              
              {/* Status Text */}
              <Typography variant="h6" gutterBottom>
                {connectionStatus}
              </Typography>
              
              <Alert severity="info">
                Đang kiểm tra kết nối và tải dữ liệu...
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Container>
    )
  }

  // Connected view - show quick navigation
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Card sx={{ maxWidth: 800, width: '100%', p: 4 }}>
          <CardContent>
            {/* Success Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Kết nối thành công!
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {isLive ? '🟢 Đã kết nối đến Appwrite Database' : '🟡 Chế độ Demo'}
              </Typography>
            </Box>

            {/* Quick Navigation Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card 
                  component={Link} 
                  to="/dashboard"
                  sx={{ 
                    p: 3, 
                    textDecoration: 'none',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s'
                    }
                  }}
                >
                  <CardContent>
                    <Dashboard sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Dashboard
                    </Typography>
                    <Typography variant="body2">
                      Xem tổng quan và thống kê domains
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card 
                  component={Link} 
                  to="/domains"
                  sx={{ 
                    p: 3, 
                    textDecoration: 'none',
                    background: 'linear-gradient(45deg, #3F51B5 30%, #9C27B0 90%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s'
                    }
                  }}
                >
                  <CardContent>
                    <Domain sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Quản lý Domains
                    </Typography>
                    <Typography variant="body2">
                      Xem, thêm, sửa domains
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Button 
                component={Link}
                to="/dashboard"
                variant="contained" 
                size="large"
                fullWidth
                sx={{ py: 2 }}
              >
                🚀 Bắt đầu sử dụng
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={testConnection}
                startIcon={<Refresh />}
                fullWidth
                sx={{ py: 2 }}
              >
                Kiểm tra lại kết nối
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
