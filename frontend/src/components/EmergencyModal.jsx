import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { requestEmergency } from '../services/api'
import { mockHospitals, scoreHospital, mockBloodGroups } from '../services/mockData'

export default function EmergencyModal({ isOpen, onClose }) {
  const { addAlert } = useApp()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    bloodGroup: 'O+',
    severity: 'high',
    lat: 28.5550,
    lng: 77.2200,
  })
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const res = await requestEmergency({
        patient_name: formData.patientName,
        patient_phone: formData.phone,
        patient_lat: formData.lat,
        patient_lng: formData.lng,
        blood_group_needed: formData.bloodGroup,
        severity: formData.severity,
      })
      const data = res.data
      setResult({
        hospital: { name: data.hospital.name, distance: data.hospital.distance_km, eta: data.eta_minutes },
        ambulance: { name: data.ambulance.name, driver: data.ambulance.driver },
      })
      addAlert({ type: 'success', title: 'Ambulance Dispatched!', message: `${data.hospital.name} selected. ETA: ${data.eta_minutes} min` })
    } catch {
      // Fallback to mock
      const scored = mockHospitals
        .map(h => scoreHospital(h, formData.lat, formData.lng, formData.bloodGroup))
        .sort((a, b) => b.score - a.score)
      setResult({
        hospital: scored[0],
        ambulance: { name: 'AMB-001', eta: scored[0].eta, driver: 'Rajesh Kumar' },
      })
      addAlert({ type: 'success', title: 'Ambulance Dispatched!', message: `${scored[0].name} selected. ETA: ${scored[0].eta} min` })
    }

    setIsLoading(false)
    setStep(3)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative glass-card p-8 w-full max-w-lg border border-neon/20 overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Glow top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon to-transparent" />

          {/* Emergency pulse bg */}
          <motion.div
            className="absolute inset-0 bg-emergency/3 rounded-2xl"
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emergency/20 flex items-center justify-center">
                  <motion.span
                    className="text-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🚨
                  </motion.span>
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">Emergency Request</h2>
                  <p className="text-xs text-dark-300">Step {step} of 3</p>
                </div>
              </div>
              <button onClick={onClose} className="text-dark-400 hover:text-white text-2xl transition-colors">×</button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-neon' : 'bg-dark-600'}`} />
              ))}
            </div>

            {/* Step 1: Patient Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-dark-300 font-medium mb-1 block">Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={e => setFormData(f => ({ ...f, patientName: e.target.value }))}
                    className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="text-xs text-dark-300 font-medium mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-dark-700/50 border border-dark-500/50 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full mt-2">
                  Continue →
                </button>
              </motion.div>
            )}

            {/* Step 2: Medical Info */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-dark-300 font-medium mb-2 block">Blood Group Required</label>
                  <div className="grid grid-cols-4 gap-2">
                    {mockBloodGroups.map(bg => (
                      <button
                        key={bg}
                        onClick={() => setFormData(f => ({ ...f, bloodGroup: bg }))}
                        className={`py-2 rounded-xl text-sm font-bold transition-all ${
                          formData.bloodGroup === bg
                            ? 'bg-neon/20 border-neon/50 text-neon border'
                            : 'bg-dark-700/50 border-dark-500/30 text-dark-300 border hover:border-dark-400'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-dark-300 font-medium mb-2 block">Severity Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData(f => ({ ...f, severity: s }))}
                        className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                          formData.severity === s
                            ? s === 'high' ? 'bg-red-500/20 border-red-500/50 text-red-400 border' :
                              s === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 border' :
                              'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 border'
                            : 'bg-dark-700/50 border-dark-500/30 text-dark-300 border hover:border-dark-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 !py-3">← Back</button>
                  <button onClick={handleSubmit} className="btn-emergency flex-1 !py-3">
                    {isLoading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >⏳</motion.span>
                    ) : '🚑 Dispatch Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Result */}
            {step === 3 && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-neon/20 flex items-center justify-center mx-auto"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-3xl">✅</span>
                </motion.div>
                <h3 className="font-heading text-lg font-bold text-neon">Ambulance Dispatched!</h3>
                <div className="glass-light rounded-xl p-4 text-left space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-dark-300">Hospital</span>
                    <span className="text-sm font-semibold text-white">{result.hospital.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dark-300">Distance</span>
                    <span className="text-sm font-semibold text-neon">{result.hospital.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dark-300">ETA</span>
                    <span className="text-sm font-semibold text-amber-400">{result.hospital.eta} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dark-300">Ambulance</span>
                    <span className="text-sm font-semibold text-white">{result.ambulance.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dark-300">Driver</span>
                    <span className="text-sm font-semibold text-white">{result.ambulance.driver}</span>
                  </div>
                </div>
                <button onClick={onClose} className="btn-primary w-full mt-2">Done</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
