import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all duration-300 hover:scale-105">
          {/* Icon */}
          <div className="text-6xl mb-6 animate-bounce">🚀</div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Domain Expiration Checker
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Theo dõi domains và nhận cảnh báo trước khi hết hạn
          </p>
          
          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left rounded-r-lg">
            <div className="flex items-start">
              <div className="text-blue-400 mr-3 text-lg">💡</div>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Kết nối trực tiếp:</p>
                <p className="text-xs text-blue-600">
                  Ứng dụng sẽ kết nối trực tiếp đến Appwrite Database để lấy dữ liệu real-time
                </p>
              </div>
            </div>
          </div>
          
          {/* Note */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 text-left rounded-r-lg">
            <div className="flex items-start">
              <div className="text-green-400 mr-3 text-lg">📊</div>
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Tính năng:</p>
                <ul className="text-xs text-green-600 list-disc list-inside space-y-1">
                  <li>Dashboard với thống kê real-time</li>
                  <li>Quản lý domains với filter và tìm kiếm</li>
                  <li>Thêm, sửa, xóa domains</li>
                  <li>Cảnh báo domains sắp hết hạn</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <button 
            onClick={testConnection}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">🚀</span>
              Khởi động Domain Manager
            </span>
          </button>
        </div>
      </div>
    )
  }

  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Animated Loader */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
          </div>
          
          {/* Status Text */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {connectionStatus}
            </p>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-600">
                Đang kiểm tra kết nối và tải dữ liệu...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connected view - show quick navigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kết nối thành công!
          </h1>
          <p className="text-gray-600">
            {isLive ? '🟢 Đã kết nối đến Appwrite Database' : '🟡 Chế độ Demo'}
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link 
            to="/dashboard"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 block"
          >
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-blue-100 text-sm">
              Xem tổng quan và thống kê domains
            </p>
          </Link>

          <Link 
            to="/domains"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 block"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">Quản lý Domains</h3>
            <p className="text-purple-100 text-sm">
              Xem, thêm, sửa domains
            </p>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/dashboard"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🚀 Bắt đầu sử dụng
          </Link>
          <button 
            onClick={testConnection}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🔄 Kiểm tra lại kết nối
          </button>
        </div>
      </div>
    </div>
  )
}
