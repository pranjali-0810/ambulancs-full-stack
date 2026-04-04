import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import Navbar from '../components/Navbar'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import { mockHospitals, mockAmbulances } from '../services/mockData'

const ambulanceIcon = L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 20px #3b82f680;display:flex;align-items:center;justify-content:center;font-size:16px;">🚑</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const hospitalMarker = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;background:#00ff88;border-radius:50%;border:2px solid white;box-shadow:0 0 12px #00ff8880;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function AmbulancePanel() {
  const [selectedAmbulance, setSelectedAmbulance] = useState(mockAmbulances[0])
  const [ambulances, setAmbulances] = useState(mockAmbulances)
  const [showRouteAccept, setShowRouteAccept] = useState(false)

  const assignedHospital = selectedAmbulance.assignedHospital
    ? mockHospitals.find(h => h.id === selectedAmbulance.assignedHospital)
    : null

  // Simulate ambulance movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(a => ({
        ...a,
        lat: a.lat + (Math.random() - 0.5) * 0.001,
        lng: a.lng + (Math.random() - 0.5) * 0.001,
      })))
      setSelectedAmbulance(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleAcceptRoute = () => {
    setSelectedAmbulance(prev => ({ ...prev, status: 'on_route' }))
    setShowRouteAccept(false)
  }

  const handleRejectRoute = () => {
    setSelectedAmbulance(prev => ({ ...prev, status: 'idle', assignedHospital: null }))
    setShowRouteAccept(false)
  }

  const handleEmergencyOverride = () => {
    setSelectedAmbulance(prev => ({ ...prev, status: 'emergency' }))
  }

  const statusColors = {
    idle: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: '#10b981' },
    on_route: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: '#f59e0b' },
    emergency: { bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400', glow: '#ef4444' },
  }

  const currentStatusStyle = statusColors[selectedAmbulance.status] || statusColors.idle

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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Ambulance <span className="text-neon">Control Panel</span>
          </h1>
          <p className="text-dark-300 text-sm">Monitor and manage ambulance fleet in real-time</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ambulance List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">Fleet Overview</h3>
            {ambulances.map((amb, i) => (
              <motion.div
                key={amb.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  className={`!p-4 cursor-pointer ${
                    selectedAmbulance.id === amb.id ? 'border-accent-blue/40 glow-neon' : ''
                  }`}
                  onClick={() => setSelectedAmbulance(amb)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center text-lg">
                        🚑
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-white text-sm">{amb.name}</h4>
                        <p className="text-xs text-dark-400">{amb.driver}</p>
                      </div>
                    </div>
                    <StatusBadge status={amb.status} size="sm" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className={`!p-6 bg-gradient-to-br ${currentStatusStyle.bg} ${currentStatusStyle.border}`} hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${currentStatusStyle.glow}20`, boxShadow: `0 0 20px ${currentStatusStyle.glow}30` }}
                        animate={selectedAmbulance.status === 'emergency' ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🚑
                      </motion.div>
                      <div>
                        <h2 className="font-heading text-2xl font-bold text-white">{selectedAmbulance.name}</h2>
                        <p className="text-sm text-dark-300">Driver: {selectedAmbulance.driver}</p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={selectedAmbulance.status} size="lg" />
                </div>

                {/* Location info */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-dark-800/50 rounded-xl p-3">
                    <span className="text-[10px] text-dark-400 uppercase tracking-wider">Latitude</span>
                    <p className="text-sm font-mono text-white mt-0.5">{selectedAmbulance.lat.toFixed(4)}</p>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-3">
                    <span className="text-[10px] text-dark-400 uppercase tracking-wider">Longitude</span>
                    <p className="text-sm font-mono text-white mt-0.5">{selectedAmbulance.lng.toFixed(4)}</p>
                  </div>
                </div>

                {/* Assignment info */}
                {assignedHospital && (
                  <motion.div
                    className="mt-4 p-4 rounded-xl bg-dark-800/50 border border-neon/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🏥</span>
                      <span className="text-xs text-dark-300">Assigned Hospital</span>
                    </div>
                    <p className="font-heading font-bold text-white">{assignedHospital.name}</p>
                    <p className="text-xs text-dark-400 mt-1">{assignedHospital.contact}</p>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>

            {/* Mini Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="!p-0 overflow-hidden !rounded-2xl" hover={false}>
                <div className="h-64 relative">
                  <MapContainer
                    center={[selectedAmbulance.lat, selectedAmbulance.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[selectedAmbulance.lat, selectedAmbulance.lng]} icon={ambulanceIcon}>
                      <Popup>{selectedAmbulance.name} — {selectedAmbulance.status}</Popup>
                    </Marker>
                    {assignedHospital && (
                      <>
                        <Marker position={[assignedHospital.lat, assignedHospital.lng]} icon={hospitalMarker}>
                          <Popup>{assignedHospital.name}</Popup>
                        </Marker>
                        <Polyline
                          positions={[
                            [selectedAmbulance.lat, selectedAmbulance.lng],
                            [assignedHospital.lat, assignedHospital.lng],
                          ]}
                          pathOptions={{ color: '#00ff88', weight: 3, dashArray: '8 4' }}
                        />
                      </>
                    )}
                  </MapContainer>
                </div>
              </GlassCard>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                className="glass-card !p-4 text-center hover:border-neon/30 transition-all group"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRouteAccept(true)}
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">✅</span>
                <span className="text-xs font-semibold text-neon">Accept Route</span>
              </motion.button>

              <motion.button
                className="glass-card !p-4 text-center hover:border-amber-500/30 transition-all group"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRejectRoute}
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">❌</span>
                <span className="text-xs font-semibold text-amber-400">Reject Route</span>
              </motion.button>

              <motion.button
                className="glass-card !p-4 text-center hover:border-blue-500/30 transition-all group"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAmbulance(prev => ({ ...prev, status: 'idle', assignedHospital: null }))}
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🔄</span>
                <span className="text-xs font-semibold text-blue-400">Mark Idle</span>
              </motion.button>

              <motion.button
                className="glass-card !p-4 text-center hover:border-red-500/30 transition-all animate-pulse-emergency group"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEmergencyOverride}
              >
                <motion.span
                  className="text-2xl mb-2 block"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🚨
                </motion.span>
                <span className="text-xs font-semibold text-red-400">Emergency</span>
              </motion.button>
            </motion.div>

            {/* Route Accept Dialog */}
            {showRouteAccept && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="!p-6 border-neon/20" hover={false}>
                  <h3 className="font-heading font-bold text-white mb-3">🗺️ New Route Assignment</h3>
                  <p className="text-sm text-dark-300 mb-4">
                    Assigned to <span className="text-neon font-semibold">{assignedHospital?.name || 'AIIMS Delhi'}</span>.
                    Accept this route?
                  </p>
                  <div className="flex gap-3">
                    <button onClick={handleAcceptRoute} className="btn-primary flex-1">Accept ✅</button>
                    <button onClick={handleRejectRoute} className="btn-outline flex-1">Reject ❌</button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
