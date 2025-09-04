import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  Alert,
  CircularProgress
} from '@mui/material'
import { 
  Dashboard, 
  Domain, 
  Person,
  Language
} from '@mui/icons-material'
import { theme } from '@/theme/muiTheme'
import { DomainDashboard } from '@/components/pages/domain/DomainDashboard'
import { DomainListPage } from '@/components/pages/domain/DomainListPage'
import { UserListPage } from '@/components/pages/user/UserListPage'
import { LandingPage } from '@/components/pages/home/LandingPage'
import { initAuth } from '@/lib/appwrite'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Box display="flex" alignItems="center">
              <Language sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                component="span" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Domain Manager
              </Typography>
            </Box>
          </Link>
          
          <Box display="flex" gap={1}>
            <Button
              component={Link}
              to="/dashboard"
              variant={isActive('/dashboard') ? 'contained' : 'text'}
              startIcon={<Dashboard />}
              sx={{ 
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/domains"
              variant={isActive('/domains') ? 'contained' : 'text'}
              startIcon={<Domain />}
              sx={{ 
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              Domains
            </Button>
            <Button
              component={Link}
              to="/users"
              variant={isActive('/users') ? 'contained' : 'text'}
              startIcon={<Person />}
              sx={{ 
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              Users
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

function App() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initAuth()
        setIsAuthInitialized(true)
        setAuthError(null)
      } catch (error: any) {
        console.error('Authentication initialization failed:', error)
        setAuthError(error.message || 'Failed to initialize authentication')
        setIsAuthInitialized(true) // Still show app, but with error
      }
    }

    initializeAuth()
  }, [])

  if (!isAuthInitialized) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="grey.50"
      >
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Initializing application...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box minHeight="100vh" bgcolor="grey.50">
          {/* Auth Error Banner */}
          {authError && (
            <Alert severity="warning" sx={{ textAlign: 'center' }}>
              <strong>⚠️ Authentication Warning:</strong> {authError}
              <br />
              <small>Some features may not work properly.</small>
            </Alert>
          )}
          
          <Navigation />

          {/* Routes */}
          <Routes>
            <Route path="/dashboard" element={<DomainDashboard />} />
            <Route path="/domains" element={<DomainListPage />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/" element={<DomainDashboard />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
