import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

export default function FloatingEmergency() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/') return null

  return (
    <motion.button
      id="floating-emergency-btn"
      className="floating-emergency group"
      onClick={() => navigate('/dashboard')}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      title="Emergency Dashboard"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0zM17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0z"/>
        <path d="M5 17H3v-6l2-5h9l4 5h3v6h-2"/>
        <line x1="11" y1="17" x2="17" y2="17"/>
        <path d="M14 8V5"/>
        <path d="M12.5 6.5h3"/>
      </svg>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-red-400"
        animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  )
}
