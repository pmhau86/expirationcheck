interface StatsCardProps {
  title: string
  value: number
  icon: string
  bgColor: string
}

export function StatsCard({ title, value, icon, bgColor }: StatsCardProps) {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}





