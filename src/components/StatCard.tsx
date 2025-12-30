import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  isEmpty?: boolean
}

export function StatCard({ title, value, icon: Icon, description, isEmpty }: StatCardProps) {
  return (
    <div className={`relative bg-gradient-to-br from-nexa-gray/40 to-nexa-gray/20 border border-white/10 rounded-2xl p-7 hover:border-nexa-gold/40 hover:shadow-xl hover:shadow-nexa-gold/5 transition-all duration-300 ${isEmpty ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{title}</span>
        <div className={`p-3 rounded-xl ${isEmpty ? 'bg-white/5' : 'bg-gradient-to-br from-nexa-gold/20 to-nexa-gold/10 shadow-lg shadow-nexa-gold/10'}`}>
          <Icon className={`h-6 w-6 ${isEmpty ? 'text-gray-500' : 'text-nexa-gold'}`} />
        </div>
      </div>
      <div className="text-4xl font-bold text-white mb-3 tracking-tight">{value}</div>
      {description && (
        <p className={`text-sm leading-relaxed ${isEmpty ? 'text-gray-500 italic' : 'text-gray-400'}`}>
          {description}
        </p>
      )}
      {!isEmpty && <div className="absolute inset-0 bg-gradient-to-br from-nexa-gold/5 to-transparent rounded-2xl pointer-events-none"></div>}
    </div>
  )
}
