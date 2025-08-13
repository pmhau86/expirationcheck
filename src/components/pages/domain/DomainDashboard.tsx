import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { domainService } from '@/services/domain'
import type { Domain, DomainStats } from '@/types/domain'
import { StatsCard } from '@/components/common/StatsCard'
import { StatusBanner } from '@/components/common/StatusBanner'

export function DomainDashboard() {
  const [stats, setStats] = useState<DomainStats>({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0
  })
  const [recentDomains, setRecentDomains] = useState<Domain[]>([])
  const [expiringDomains, setExpiringDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [statsData, allDomains, expiring] = await Promise.all([
        domainService.getStats(),
        domainService.getAllDomains(),
        domainService.getExpiringSoonDomains()
      ])
      
      setStats(statsData)
      
      // Get 5 most recent domains
      const recent = allDomains
        .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
        .slice(0, 5)
      setRecentDomains(recent)
      
      setExpiringDomains(expiring.slice(0, 5))
      setIsLive(true)
    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'An error occurred while loading data')
      setIsLive(false)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getDaysUntilExpiry = (expireDate: string) => {
    const expire = new Date(expireDate)
    const now = new Date()
    const diffTime = expire.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBanner isLive={isLive} />
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '4rem' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏠 Dashboard Domain Management
          </h1>
          <p className="text-gray-600">
            Tổng quan về tình trạng domains trong hệ thống
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng số Domain"
            value={stats.total}
            icon="🌐"
            bgColor="bg-blue-100"
          />
          <StatsCard
            title="Đang hoạt động"
            value={stats.active}
            icon="✅"
            bgColor="bg-green-100"
          />
          <StatsCard
            title="Sắp hết hạn"
            value={stats.expiringSoon}
            icon="⚠️"
            bgColor="bg-yellow-100"
          />
          <StatsCard
            title="Đã hết hạn"
            value={stats.expired}
            icon="❌"
            bgColor="bg-red-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/domains"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow block group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-blue-600">View All Domains</h3>
            <p className="text-gray-600 text-sm">
              Manage, search and filter domains
            </p>
          </Link>

          <Link 
            to="/domains?filter=expiring"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow block"
          >
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Domains Expiring Soon</h3>
            <p className="text-gray-600 text-sm">
              Check domains requiring renewal
            </p>
          </Link>

          <Link 
            to="/domains?filter=expired"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow block"
          >
            <div className="text-3xl mb-3">❌</div>
            <h3 className="text-lg font-semibold mb-2">Expired Domains</h3>
            <p className="text-gray-600 text-sm">
              View domains requiring urgent action
            </p>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Domains */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                📝 Recent Domains
              </h2>
              <Link 
                to="/domains"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentDomains.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No domains have been added yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentDomains.map((domain) => (
                  <div key={domain.$id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{domain.domain}</div>
                      <div className="text-sm text-gray-500">
                        Added: {formatDate(domain.$createdAt)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires: {formatDate(domain.expire_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiring Domains */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                ⚠️ Sắp hết hạn (30 ngày)
              </h2>
              <Link 
                to="/domains?filter=expiring"
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
              >
                View All →
              </Link>
            </div>

            {expiringDomains.length === 0 ? (
              <p className="text-green-600 text-center py-8">
                ✅ Không có domain nào sắp hết hạn
              </p>
            ) : (
              <div className="space-y-3">
                {expiringDomains.map((domain) => {
                  const daysLeft = getDaysUntilExpiry(domain.expire_date)
                  return (
                    <div key={domain.$id} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{domain.domain}</div>
                        <div className="text-sm text-gray-600">
                          Expires: {formatDate(domain.expire_date)}
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        daysLeft <= 7 ? 'text-red-600' : 
                        daysLeft <= 14 ? 'text-orange-600' : 
                        'text-yellow-600'
                      }`}>
                        {daysLeft} ngày
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={loadDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Làm mới Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
