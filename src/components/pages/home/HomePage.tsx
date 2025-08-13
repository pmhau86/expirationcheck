import { useState, useEffect } from 'react'

export function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Expiration Check System
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quản lý Users</h2>
            <p className="text-gray-600 mb-4">
              Xem và quản lý danh sách người dùng trong hệ thống.
            </p>
            <button className="btn-primary">
              Xem Users
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Kiểm tra hạn sử dụng</h2>
            <p className="text-gray-600 mb-4">
              Theo dõi và quản lý các mục sắp hết hạn.
            </p>
            <button className="btn-secondary">
              Kiểm tra ngay
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Báo cáo</h2>
            <p className="text-gray-600 mb-4">
              Xem báo cáo chi tiết về tình trạng hết hạn.
            </p>
            <button className="btn-secondary">
              Xem báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
