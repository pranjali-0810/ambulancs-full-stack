import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Navbar from '../components/Navbar'
import GlassCard from '../components/GlassCard'
import ProgressBar from '../components/ProgressBar'
import BloodIndicator from '../components/BloodIndicator'
import { useApp } from '../context/AppContext'
import { mockHospitals, mockBedTrends, mockBloodTrends, mockBloodGroups } from '../services/mockData'

const bloodBarColors = {
  'A+': '#ef4444', 'A-': '#f87171',
  'B+': '#3b82f6', 'B-': '#60a5fa',
  'O+': '#10b981', 'O-': '#34d399',
  'AB+': '#8b5cf6', 'AB-': '#a78bfa',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card !p-3 !rounded-lg text-xs border border-white/10">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function HospitalAdmin() {
  const { addAlert } = useApp()
  const [hospital, setHospital] = useState(mockHospitals[0])
  const [bedTrends] = useState(mockBedTrends)
  const [bloodTrends] = useState(mockBloodTrends)
  const [isSaving, setIsSaving] = useState(false)

  // Simulate real-time bed fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setHospital(prev => ({
        ...prev,
        available_beds_icu: Math.max(0, Math.min(prev.total_beds_icu, prev.available_beds_icu + (Math.random() > 0.5 ? 1 : -1))),
        available_beds_general: Math.max(0, Math.min(prev.total_beds_general, prev.available_beds_general + Math.floor(Math.random() * 3 - 1))),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleBedChange = (type, delta) => {
    setHospital(prev => {
      const key = type === 'icu' ? 'available_beds_icu' : 'available_beds_general'
      const maxKey = type === 'icu' ? 'total_beds_icu' : 'total_beds_general'
      const newVal = Math.max(0, Math.min(prev[maxKey], prev[key] + delta))
      return { ...prev, [key]: newVal }
    })
  }

  const handleBloodChange = (group, delta) => {
    setHospital(prev => ({
      ...prev,
      blood_inventory: {
        ...prev.blood_inventory,
        [group]: Math.max(0, prev.blood_inventory[group] + delta),
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    addAlert({
      type: 'success',
      title: 'Data Updated',
      message: 'Hospital availability has been synced successfully.',
    })
  }

  const totalBeds = hospital.total_beds_icu + hospital.total_beds_general
  const availableBeds = hospital.available_beds_icu + hospital.available_beds_general
  const occupancyRate = ((totalBeds - availableBeds) / totalBeds * 100).toFixed(1)

  const criticalBlood = Object.entries(hospital.blood_inventory).filter(([, v]) => v <= 3)

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
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

      <div className="pt-20 md:pt-24 px-4 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-heading text-3xl font-bold text-white mb-1">
              Hospital <span className="text-neon">Admin Dashboard</span>
            </h1>
            <p className="text-dark-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              {hospital.name} — Live Updates
            </p>
          </div>
          <motion.button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSaving}
          >
            {isSaving ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⏳</motion.span>
            ) : (
              <>💾 Save Changes</>
            )}
          </motion.button>
        </motion.div>

        {/* Critical Alerts */}
        {criticalBlood.length > 0 && (
          <motion.div
            className="mb-6 glass-card !p-4 border-red-500/30 glow-emergency"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >🚨</motion.span>
              <span className="font-heading font-bold text-red-400 text-sm">Critical Blood Shortage</span>
            </div>
            <p className="text-xs text-dark-300">
              Low stock: {criticalBlood.map(([g, v]) => `${g} (${v} units)`).join(', ')}
            </p>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Beds', value: totalBeds, icon: '🛏️', color: 'text-white' },
            { label: 'Available', value: availableBeds, icon: '✅', color: 'text-neon' },
            { label: 'Occupancy', value: `${occupancyRate}%`, icon: '📊', color: parseFloat(occupancyRate) > 80 ? 'text-red-400' : 'text-amber-400' },
            { label: 'Blood Groups', value: Object.keys(hospital.blood_inventory).length, icon: '🩸', color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <GlassCard className="!p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-600/50 flex items-center justify-center text-xl">
                    {stat.icon}
                  </div>
                  <div>
                    <div className={`text-xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-dark-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bed Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="!p-6" hover={false}>
              <h3 className="font-heading text-lg font-bold text-white mb-5 flex items-center gap-2">
                🛏️ Bed Availability
              </h3>

              {/* ICU */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">ICU Beds</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBedChange('icu', -1)}
                    >−</motion.button>
                    <span className="text-lg font-bold text-white w-12 text-center font-mono">
                      {hospital.available_beds_icu}
                    </span>
                    <motion.button
                      className="w-8 h-8 rounded-lg bg-neon/20 border border-neon/30 text-neon font-bold flex items-center justify-center hover:bg-neon/30 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBedChange('icu', 1)}
                    >+</motion.button>
                  </div>
                </div>
                <ProgressBar value={hospital.available_beds_icu} max={hospital.total_beds_icu} label="" color="auto" height="h-3" />
                <p className="text-[10px] text-dark-400 mt-1">Total: {hospital.total_beds_icu}</p>
              </div>

              {/* General */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">General Beds</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBedChange('general', -1)}
                    >−</motion.button>
                    <span className="text-lg font-bold text-white w-12 text-center font-mono">
                      {hospital.available_beds_general}
                    </span>
                    <motion.button
                      className="w-8 h-8 rounded-lg bg-neon/20 border border-neon/30 text-neon font-bold flex items-center justify-center hover:bg-neon/30 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBedChange('general', 1)}
                    >+</motion.button>
                  </div>
                </div>
                <ProgressBar value={hospital.available_beds_general} max={hospital.total_beds_general} label="" color="auto" height="h-3" />
                <p className="text-[10px] text-dark-400 mt-1">Total: {hospital.total_beds_general}</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Blood Stock Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="!p-6" hover={false}>
              <h3 className="font-heading text-lg font-bold text-white mb-5 flex items-center gap-2">
                🩸 Blood Bank Inventory
              </h3>

              <div className="space-y-3">
                {mockBloodGroups.map(group => {
                  const units = hospital.blood_inventory[group] || 0
                  const isCritical = units <= 3
                  return (
                    <motion.div
                      key={group}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        isCritical ? 'bg-red-500/5 border border-red-500/20' : 'bg-dark-700/30 border border-dark-600/30'
                      }`}
                      animate={isCritical ? { borderColor: ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.5)', 'rgba(239,68,68,0.2)'] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center gap-3">
                        <BloodIndicator group={group} units={units} compact />
                        <span className="text-sm text-white font-medium">{group}</span>
                        {isCritical && (
                          <motion.span
                            className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            CRITICAL
                          </motion.span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold flex items-center justify-center"
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleBloodChange(group, -1)}
                        >−</motion.button>
                        <span className="text-sm font-bold text-white w-8 text-center font-mono">{units}</span>
                        <motion.button
                          className="w-7 h-7 rounded-lg bg-neon/20 border border-neon/30 text-neon text-sm font-bold flex items-center justify-center"
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleBloodChange(group, 1)}
                        >+</motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Bed Usage Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="!p-6" hover={false}>
              <h3 className="font-heading text-lg font-bold text-white mb-5 flex items-center gap-2">
                📈 Bed Usage Trends
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={bedTrends}>
                  <defs>
                    <linearGradient id="icuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="generalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="icu" stroke="#00ff88" fill="url(#icuGrad)" strokeWidth={2} name="ICU" />
                  <Area type="monotone" dataKey="general" stroke="#3b82f6" fill="url(#generalGrad)" strokeWidth={2} name="General" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2 text-xs text-dark-300">
                  <div className="w-3 h-1 rounded-full bg-neon" /> ICU
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-300">
                  <div className="w-3 h-1 rounded-full bg-blue-500" /> General
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Blood Stock Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="!p-6" hover={false}>
              <h3 className="font-heading text-lg font-bold text-white mb-5 flex items-center gap-2">
                🩸 Blood Stock Analytics
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bloodTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="units" name="Units" radius={[6, 6, 0, 0]}>
                    {bloodTrends.map((entry, i) => (
                      <Cell key={i} fill={bloodBarColors[entry.group] || '#64748b'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                  <Bar dataKey="critical" name="Critical Level" radius={[6, 6, 0, 0]} fill="#ef4444" fillOpacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2 text-xs text-dark-300">
                  <div className="w-3 h-3 rounded bg-purple-500/60" /> Current Stock
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-300">
                  <div className="w-3 h-3 rounded bg-red-500/40" /> Critical Level
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
