import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

export default function AlertOverlay() {
  const { state, dispatch } = useApp()
  const { alerts } = state

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto glass-card p-4 relative overflow-hidden ${
              alert.type === 'emergency' ? 'border-red-500/40' :
              alert.type === 'warning' ? 'border-amber-500/40' :
              alert.type === 'success' ? 'border-emerald-500/40' :
              'border-blue-500/40'
            }`}
          >
            {/* Glow line at top */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${
              alert.type === 'emergency' ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' :
              alert.type === 'warning' ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' :
              alert.type === 'success' ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' :
              'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
            }`} />

            {/* Emergency pulse background */}
            {alert.type === 'emergency' && (
              <motion.div
                className="absolute inset-0 bg-red-500/5 rounded-2xl"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            <div className="flex items-start gap-3 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                alert.type === 'emergency' ? 'bg-red-500/20' :
                alert.type === 'warning' ? 'bg-amber-500/20' :
                alert.type === 'success' ? 'bg-emerald-500/20' :
                'bg-blue-500/20'
              }`}>
                <span className="text-sm">
                  {alert.type === 'emergency' ? '🚨' :
                   alert.type === 'warning' ? '⚠️' :
                   alert.type === 'success' ? '✅' : 'ℹ️'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">{alert.title}</p>
                <p className="text-xs text-dark-300 mt-0.5">{alert.message}</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE_ALERT', payload: alert.id })}
                className="text-dark-400 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
