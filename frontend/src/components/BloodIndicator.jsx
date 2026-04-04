import { motion } from 'framer-motion'

const bloodColors = {
  'A+': '#ef4444',
  'A-': '#f87171',
  'B+': '#3b82f6',
  'B-': '#60a5fa',
  'O+': '#10b981',
  'O-': '#34d399',
  'AB+': '#8b5cf6',
  'AB-': '#a78bfa',
}

export default function BloodIndicator({ group, units, compact = false }) {
  const color = bloodColors[group] || '#64748b'
  const isCritical = units <= 3
  const isLow = units <= 8

  return (
    <motion.div
      className={`flex items-center gap-2 ${compact ? 'p-1.5' : 'p-2 px-3'} rounded-lg`}
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
      whileHover={{ scale: 1.05 }}
      animate={isCritical ? { borderColor: [`${color}30`, `${color}80`, `${color}30`] } : {}}
      transition={isCritical ? { duration: 1.5, repeat: Infinity } : { duration: 0.2 }}
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 ${isCritical ? '12px' : '6px'} ${color}60`,
        }}
      />
      <span className="text-xs font-bold text-white">{group}</span>
      {!compact && (
        <span className={`text-xs font-semibold ml-auto ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
          {units}u
        </span>
      )}
    </motion.div>
  )
}
