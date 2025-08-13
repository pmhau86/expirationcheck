import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
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
    <nav className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/50 sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text flex items-center hover:scale-105 transition-transform">
            🌐 Domain Manager
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              to="/dashboard" 
              className={`${isActive('/dashboard') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 hover:shadow-lg'} px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105`}
            >
              🏠 Dashboard
            </Link>
            <Link 
              to="/domains" 
              className={`${isActive('/domains') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 hover:shadow-lg'} px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105`}
            >
              📋 Domains
            </Link>
            <Link 
              to="/users" 
              className={`${isActive('/users') ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 hover:shadow-lg'} px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105`}
            >
              👤 Users
            </Link>
          </div>
        </div>
      </div>
    </nav>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Auth Error Banner */}
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
              <strong>⚠️ Authentication Warning:</strong> {authError}
              <br />
              <small>Some features may not work properly.</small>
            </div>
          )}
          
          <Navigation />

          {/* Routes */}
          <Routes>
            <Route path="/dashboard" element={<DomainDashboard />} />
            <Route path="/domains" element={<DomainListPage />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
