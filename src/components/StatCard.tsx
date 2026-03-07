'use client'

import { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  isEmpty?: boolean
  variant?: 'gold' | 'green' | 'red' | 'blue'
}

function AnimatedNumber({ value }: { value: string }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current !== value) {
      setDisplay(value)
      prevRef.current = value
    }
  }, [value])

  return <span key={display}>{display}</span>
}

const variantStyles = {
  gold: {
    iconBg: 'bg-gradient-to-br from-amber-400/20 to-yellow-600/10',
    iconColor: 'text-amber-400',
    border: 'border-amber-400/15 hover:border-amber-400/40',
    glow: 'stat-glow-gold',
    dot: 'bg-amber-400',
  },
  green: {
    iconBg: 'bg-gradient-to-br from-green-400/20 to-emerald-600/10',
    iconColor: 'text-green-400',
    border: 'border-green-400/15 hover:border-green-400/40',
    glow: 'stat-glow-green',
    dot: 'bg-green-400',
  },
  red: {
    iconBg: 'bg-gradient-to-br from-red-400/20 to-rose-600/10',
    iconColor: 'text-red-400',
    border: 'border-red-400/15 hover:border-red-400/40',
    glow: 'stat-glow-red',
    dot: 'bg-red-400',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-400/20 to-indigo-600/10',
    iconColor: 'text-blue-400',
    border: 'border-blue-400/15 hover:border-blue-400/40',
    glow: 'stat-glow-blue',
    dot: 'bg-blue-400',
  },
}

export function StatCard({ title, value, icon: Icon, description, isEmpty, variant = 'gold' }: StatCardProps) {
  const s = variantStyles[variant]

  return (
    <div
      className={`
        relative rounded-2xl p-3 md:p-5 border transition-all duration-300 cursor-default
        bg-gradient-to-br from-slate-800/60 to-slate-900/80
        ${s.border} ${!isEmpty ? s.glow : ''}
        ${isEmpty ? 'opacity-60' : ''}
        animate-slide-up
      `}
    >
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className={`w-1 h-1 md:w-2 md:h-2 rounded-full ${s.dot} opacity-70`} />
          <span className="text-gray-400 text-[9px] md:text-xs font-semibold uppercase tracking-widest">{title}</span>
        </div>
        <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl ${s.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 md:h-5 md:w-5 ${s.iconColor}`} />
        </div>
      </div>

      {/* Value */}
      <div className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-1.5 tracking-tight leading-none">
        <AnimatedNumber value={value} />
      </div>

      {/* Description */}
      {description && (
        <p className={`hidden md:block text-xs leading-relaxed ${isEmpty ? 'text-gray-600 italic' : 'text-gray-500'}`}>
          {description}
        </p>
      )}

      {/* Ambient glow overlay */}
      {!isEmpty && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
          style={{ background: `radial-gradient(ellipse at top right, var(--tw-gradient-stops))` }}
        />
      )}
    </div>
  )
}
