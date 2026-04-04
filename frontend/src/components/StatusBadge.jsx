import { motion } from 'framer-motion'

const statusConfig = {
  idle: { color: 'bg-emerald-500', glow: 'shadow-emerald-500/30', label: 'Idle', dot: '#10b981' },
  on_route: { color: 'bg-amber-500', glow: 'shadow-amber-500/30', label: 'On Route', dot: '#f59e0b' },
  emergency: { color: 'bg-red-500', glow: 'shadow-red-500/30', label: 'Emergency', dot: '#ef4444' },
  assigned: { color: 'bg-blue-500', glow: 'shadow-blue-500/30', label: 'Assigned', dot: '#3b82f6' },
  active: { color: 'bg-emerald-500', glow: 'shadow-emerald-500/30', label: 'Active', dot: '#10b981' },
  critical: { color: 'bg-red-500', glow: 'shadow-red-500/30', label: 'Critical', dot: '#ef4444' },
  completed: { color: 'bg-dark-400', glow: '', label: 'Completed', dot: '#64748b' },
}

export default function StatusBadge({ status, size = 'md', pulse = true }) {
  const config = statusConfig[status] || statusConfig.idle
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizes[size]} bg-opacity-20 ${config.color}/20 text-white`}>
      <motion.span
        className={`w-2 h-2 rounded-full ${config.color}`}
        animate={pulse && (status === 'emergency' || status === 'critical') ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ boxShadow: `0 0 8px ${config.dot}` }}
      />
      {config.label}
    </span>
  )
}
