interface StatsCardProps {
  title: string
  value: number
  icon: string
  bgColor: string
  textColor?: string
}

export function StatsCard({ title, value, icon, bgColor, textColor = 'text-gray-900' }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-md transition-transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className={`text-3xl font-bold ${textColor}`}>
            {value}
          </p>
        </div>
        <div className="text-4xl">
          {icon}
        </div>
      </div>
    </div>
  )
}
