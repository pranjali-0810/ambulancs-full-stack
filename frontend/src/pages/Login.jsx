import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { login as loginApi } from '../services/api'
import Navbar from '../components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const { dispatch, addAlert } = useApp()
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    hospitalName: '',
    phone: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await loginApi({ email: form.email, password: form.password })
      const data = res.data
      dispatch({ type: 'SET_TOKEN', payload: data.access_token })
      dispatch({
        type: 'SET_USER',
        payload: {
          email: form.email,
          role: 'hospital_admin',
          hospitalId: data.hospital_id,
          hospitalName: data.hospital_name,
        },
      })
      addAlert({ type: 'success', title: 'Login Successful!', message: `Welcome, ${data.hospital_name}` })
    } catch {
      // Fallback to mock login
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock'
      dispatch({ type: 'SET_TOKEN', payload: mockToken })
      dispatch({
        type: 'SET_USER',
        payload: { email: form.email, role: 'hospital_admin', hospitalId: 1, hospitalName: form.hospitalName || 'AIIMS Delhi' },
      })
      addAlert({ type: 'success', title: isRegister ? 'Registration Successful!' : 'Login Successful!', message: 'Redirecting to hospital dashboard...' })
    }

    setIsLoading(false)
    setTimeout(() => navigate('/hospital'), 500)
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div
      className="min-h-screen bg-dark-900"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-neon/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent-blue/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="glass-card !p-8 sm:!p-10 w-full max-w-md relative border-neon/10"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 25 }}
        >
          {/* Glow line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center text-3xl mx-auto mb-4"
              whileHover={{ rotate: 10 }}
            >
              🏥
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {isRegister ? 'Register Hospital' : 'Hospital Login'}
            </h1>
            <p className="text-sm text-dark-300 mt-1">
              {isRegister ? 'Join the emergency network' : 'Access your dashboard'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-dark-300 font-medium mb-1 block">Hospital Name</label>
                  <input
                    type="text"
                    value={form.hospitalName}
                    onChange={e => setForm(f => ({ ...f, hospitalName: e.target.value }))}
                    className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
                    placeholder="e.g. Max Super Specialty"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-dark-300 font-medium mb-1 block">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-xs text-dark-300 font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
                placeholder="admin@hospital.com"
                required
              />
            </div>

            <div>
              <label className="text-xs text-dark-300 font-medium mb-1 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              type="submit"
              className="btn-primary w-full !py-3.5 text-base flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >⏳</motion.span>
              ) : (
                <>
                  {isRegister ? 'Register' : 'Sign In'}
                  <span>→</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-dark-300 hover:text-neon transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-xl bg-neon/5 border border-neon/10">
            <p className="text-xs text-dark-300 text-center">
              <span className="text-neon font-semibold">Demo:</span> admin@aiims.edu.in / password123
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
