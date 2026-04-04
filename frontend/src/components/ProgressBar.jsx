import { motion } from 'framer-motion'

export default function ProgressBar({ value, max, label, color = 'neon', showText = true, height = 'h-2' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    neon: 'from-emerald-400 to-emerald-500',
    emergency: 'from-red-400 to-red-500',
    amber: 'from-amber-400 to-amber-500',
    blue: 'from-blue-400 to-blue-500',
    purple: 'from-purple-400 to-purple-500',
  }

  const getAutoColor = () => {
    if (percentage < 20) return 'from-red-400 to-red-500'
    if (percentage < 50) return 'from-amber-400 to-amber-500'
    return colors[color]
  }

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-dark-300 font-medium">{label}</span>
          <span className="text-xs font-semibold text-white">{value}/{max}</span>
        </div>
      )}
      <div className={`progress-bar-bg ${height}`}>
        <motion.div
          className={`progress-bar-fill bg-gradient-to-r ${color === 'auto' ? getAutoColor() : colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ boxShadow: percentage < 20 ? '0 0 10px rgba(239,68,68,0.4)' : percentage > 50 ? '0 0 10px rgba(16,185,129,0.3)' : '0 0 10px rgba(245,158,11,0.3)' }}
        />
      </div>
    </div>
  )
}
