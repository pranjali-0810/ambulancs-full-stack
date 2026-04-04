import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/ambulance', label: 'Ambulance', icon: '🚑' },
  { path: '/hospital', label: 'Hospital', icon: '🏥' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon to-emerald-600 flex items-center justify-center"
              whileHover={{ rotate: 10 }}
            >
              <span className="text-lg">🚑</span>
            </motion.div>
            <div>
              <span className="font-heading text-lg font-bold text-white tracking-tight">
                Aether<span className="text-neon">Aid</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'text-neon'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navActive"
                      className="absolute inset-0 rounded-xl bg-neon/10 border border-neon/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="btn-outline !py-2 !px-5 text-sm"
          >
            Hospital Login
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-neon' : 'text-dark-400'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
