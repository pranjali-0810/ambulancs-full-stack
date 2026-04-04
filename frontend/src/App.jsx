import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AmbulancePanel from './pages/AmbulancePanel'
import HospitalAdmin from './pages/HospitalAdmin'
import Login from './pages/Login'
import FloatingEmergency from './components/FloatingEmergency'
import AlertOverlay from './components/AlertOverlay'
import { useLocation } from 'react-router-dom'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ambulance" element={<AmbulancePanel />} />
        <Route path="/hospital" element={<HospitalAdmin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-dark-900 relative">
        <AnimatedRoutes />
        <FloatingEmergency />
        <AlertOverlay />
      </div>
    </AppProvider>
  )
}
