import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import Navbar from '../components/Navbar'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import BloodIndicator from '../components/BloodIndicator'
import EmergencyModal from '../components/EmergencyModal'
import { getHospitals, getAmbulances, fetchWithFallback } from '../services/api'
import { mockHospitals, mockAmbulances, scoreHospital } from '../services/mockData'

// Custom map icons
const createIcon = (color, size = 28) => L.divIcon({
  className: '',
  html: `<div style="
    width: ${size}px; height: ${size}px; 
    background: ${color}; 
    border-radius: 50%; 
    border: 3px solid rgba(255,255,255,0.9);
    box-shadow: 0 0 15px ${color}80, 0 0 30px ${color}40;
    display: flex; align-items: center; justify-content: center;
  "></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
})

const hospitalIcon = createIcon('#00ff88', 24)
const ambulanceIdleIcon = createIcon('#3b82f6', 22)
const ambulanceActiveIcon = createIcon('#f59e0b', 26)
const ambulanceEmergencyIcon = createIcon('#ef4444', 28)
const patientIcon = createIcon('#8b5cf6', 20)

function getAmbulanceIcon(status) {
  if (status === 'emergency') return ambulanceEmergencyIcon
  if (status === 'on_route' || status === 'assigned') return ambulanceActiveIcon
  return ambulanceIdleIcon
}

// Component to animate map view
function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function Dashboard() {
  const [hospitals, setHospitals] = useState(mockHospitals)
  const [ambulances, setAmbulances] = useState(mockAmbulances)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [mapCenter, setMapCenter] = useState([28.5672, 77.2100])
  const [modalOpen, setModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filterBlood, setFilterBlood] = useState('')
  const [patientLocation] = useState({ lat: 28.5550, lng: 77.2200 })

  // Fetch real data from backend
  useEffect(() => {
    fetchWithFallback(getHospitals, mockHospitals).then(setHospitals)
    fetchWithFallback(getAmbulances, mockAmbulances).then(setAmbulances)
  }, [])

  // Score and sort hospitals
  const scoredHospitals = useMemo(() => {
    return hospitals
      .map(h => scoreHospital(h, patientLocation.lat, patientLocation.lng, filterBlood || 'O+'))
      .sort((a, b) => b.score - a.score)
  }, [hospitals, patientLocation, filterBlood])

  const bestMatch = scoredHospitals[0]

  // Simulate real-time ambulance movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(a => ({
        ...a,
        lat: a.lat + (Math.random() - 0.5) * 0.002,
        lng: a.lng + (Math.random() - 0.5) * 0.002,
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const routeLine = bestMatch ? [
    [patientLocation.lat, patientLocation.lng],
    [bestMatch.lat, bestMatch.lng],
  ] : []

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

      <div className="pt-16 md:pt-20 flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <MapController center={mapCenter} />

            {/* Hospital markers */}
            {scoredHospitals.map(h => (
              <Marker
                key={`h-${h.id}`}
                position={[h.lat, h.lng]}
                icon={hospitalIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedHospital(h)
                    setMapCenter([h.lat, h.lng])
                  }
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong className="text-neon">{h.name}</strong>
                    <br />ICU: {h.available_beds_icu}/{h.total_beds_icu}
                    <br />General: {h.available_beds_general}/{h.total_beds_general}
                    <br />Distance: {h.distance} km | ETA: {h.eta} min
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Ambulance markers */}
            {ambulances.map(a => (
              <Marker
                key={`a-${a.id}`}
                position={[a.lat, a.lng]}
                icon={getAmbulanceIcon(a.status)}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{a.name}</strong> — {a.status}
                    <br />Driver: {a.driver}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Patient location */}
            <Marker position={[patientLocation.lat, patientLocation.lng]} icon={patientIcon}>
              <Popup><strong>📍 Patient Location</strong></Popup>
            </Marker>

            {/* Route line */}
            {routeLine.length > 0 && (
              <Polyline
                positions={routeLine}
                pathOptions={{
                  color: '#00ff88',
                  weight: 3,
                  dashArray: '10 6',
                  opacity: 0.8,
                }}
              />
            )}
          </MapContainer>

          {/* Map overlay controls */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="glass-card !p-3 !rounded-xl hover:border-neon/30 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                {sidebarOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                )}
              </svg>
            </motion.button>
          </div>

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-[400]">
            <div className="glass-card !p-3 !rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-dark-300">
                <div className="w-3 h-3 rounded-full bg-neon" style={{ boxShadow: '0 0 6px #00ff8880' }} />
                Hospital
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-300">
                <div className="w-3 h-3 rounded-full bg-blue-500" style={{ boxShadow: '0 0 6px #3b82f680' }} />
                Ambulance (Idle)
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-300">
                <div className="w-3 h-3 rounded-full bg-amber-500" style={{ boxShadow: '0 0 6px #f59e0b80' }} />
                Ambulance (Active)
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-300">
                <div className="w-3 h-3 rounded-full bg-red-500" style={{ boxShadow: '0 0 6px #ef444480' }} />
                Emergency
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-300">
                <div className="w-3 h-3 rounded-full bg-purple-500" style={{ boxShadow: '0 0 6px #8b5cf680' }} />
                Patient
              </div>
            </div>
          </div>

          {/* Request Emergency overlay button */}
          <motion.button
            onClick={() => setModalOpen(true)}
            className="absolute bottom-4 right-4 z-[400] btn-emergency !py-3 !px-6 flex items-center gap-2 !rounded-xl animate-glow-emergency"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">🚨</span>
            Request Emergency
          </motion.button>
        </div>

        {/* Sidebar */}
        <motion.div
          className={`${sidebarOpen ? 'w-[400px]' : 'w-0'} transition-all duration-300 overflow-hidden border-l border-white/5 bg-dark-800/90 backdrop-blur-xl flex-shrink-0`}
          initial={false}
          animate={{ width: sidebarOpen ? 400 : 0 }}
        >
          <div className="w-[400px] h-full overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-white">Nearby Hospitals</h2>
              <select
                value={filterBlood}
                onChange={e => setFilterBlood(e.target.value)}
                className="bg-dark-700 border border-dark-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon/50"
              >
                <option value="">All Blood</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="glass-card !p-3 text-center !rounded-xl">
                <div className="text-lg font-bold text-neon">{hospitals.length}</div>
                <div className="text-[10px] text-dark-400">Hospitals</div>
              </div>
              <div className="glass-card !p-3 text-center !rounded-xl">
                <div className="text-lg font-bold text-blue-400">{ambulances.filter(a => a.status === 'idle').length}</div>
                <div className="text-[10px] text-dark-400">Available</div>
              </div>
              <div className="glass-card !p-3 text-center !rounded-xl">
                <div className="text-lg font-bold text-emergency">{ambulances.filter(a => a.status === 'emergency').length}</div>
                <div className="text-[10px] text-dark-400">Emergency</div>
              </div>
            </div>

            {/* Hospital Cards */}
            {scoredHospitals.map((hospital, i) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  className={`cursor-pointer !p-4 ${
                    bestMatch?.id === hospital.id ? 'border-neon/40 glow-neon' : ''
                  } ${selectedHospital?.id === hospital.id ? 'border-accent-blue/40' : ''}`}
                  onClick={() => {
                    setSelectedHospital(hospital)
                    setMapCenter([hospital.lat, hospital.lng])
                  }}
                >
                  {/* Best match badge */}
                  {bestMatch?.id === hospital.id && (
                    <motion.div
                      className="flex items-center gap-1.5 mb-3 px-2 py-1 rounded-full bg-neon/10 border border-neon/20 w-fit animate-glow-neon"
                    >
                      <span className="text-xs">⭐</span>
                      <span className="text-[10px] font-bold text-neon">BEST MATCH</span>
                    </motion.div>
                  )}

                  {/* Hospital Name + Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-white text-sm">{hospital.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-dark-300">{hospital.distance} km</span>
                        <span className="text-dark-500">•</span>
                        <span className="text-xs text-amber-400">ETA {hospital.eta} min</span>
                      </div>
                    </div>
                    <StatusBadge status={hospital.status} size="sm" />
                  </div>

                  {/* Bed availability */}
                  <div className="space-y-2 mb-3">
                    <ProgressBar
                      value={hospital.available_beds_icu}
                      max={hospital.total_beds_icu}
                      label="ICU Beds"
                      color="auto"
                    />
                    <ProgressBar
                      value={hospital.available_beds_general}
                      max={hospital.total_beds_general}
                      label="General Beds"
                      color="auto"
                    />
                  </div>

                  {/* Blood inventory */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.entries(hospital.blood_inventory).map(([group, units]) => (
                      <BloodIndicator key={group} group={group} units={units} compact />
                    ))}
                  </div>

                  {/* Score bar */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-dark-400">Match Score</span>
                      <span className="text-xs font-bold text-neon">{hospital.score.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar-bg h-1.5 mt-1">
                      <motion.div
                        className="progress-bar-fill bg-gradient-to-r from-neon to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, hospital.score)}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <EmergencyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.div>
  )
}
