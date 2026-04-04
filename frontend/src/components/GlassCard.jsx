import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true, glow = false, ...props }) {
  return (
    <motion.div
      className={`glass-card p-6 ${glow ? 'glow-neon' : ''} ${className}`}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
