import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import EmergencyModal from '../components/EmergencyModal'

const stats = [
  { label: 'Ambulances Active', value: '50+', icon: '🚑' },
  { label: 'Hospitals Connected', value: '120+', icon: '🏥' },
  { label: 'Lives Saved', value: '10,000+', icon: '❤️' },
  { label: 'Avg. Response Time', value: '8 min', icon: '⚡' },
]

const features = [
  {
    icon: '🧠',
    title: 'AI Smart Routing',
    desc: 'Our algorithm finds the best hospital based on beds, blood availability & distance in real-time.',
  },
  {
    icon: '📡',
    title: 'Live Tracking',
    desc: 'Track your ambulance in real-time with precise GPS updates and ETA calculations.',
  },
  {
    icon: '🩸',
    title: 'Blood Bank Network',
    desc: 'Connected to live blood bank inventories across all partner hospitals.',
  },
  {
    icon: '🔒',
    title: 'Secure & Reliable',
    desc: 'HIPAA-compliant data handling with 99.9% uptime guaranteed.',
  },
]

// Animated ambulance path points
const pathPoints = [
  { x: -60, y: 300 },
  { x: 200, y: 280 },
  { x: 400, y: 240 },
  { x: 600, y: 260 },
  { x: 800, y: 200 },
  { x: 1000, y: 220 },
  { x: 1200, y: 180 },
  { x: 1500, y: 200 },
]

function ParticleField() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-neon/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  )
}

function AnimatedRoute() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg width="100%" height="100%" viewBox="0 0 1400 500" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Grid lines */}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 30} x2="1400" y2={i * 30} stroke="#1e293b" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 50 }, (_, i) => (
          <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="500" stroke="#1e293b" strokeWidth="0.5" />
        ))}

        {/* Route path */}
        <motion.path
          d="M 0,300 Q 200,270 400,240 T 800,200 Q 1000,220 1200,180 L 1400,200"
          stroke="#00ff88"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />

        {/* Hospital markers */}
        {[{ x: 400, y: 240 }, { x: 800, y: 200 }, { x: 1200, y: 180 }].map((p, i) => (
          <g key={i}>
            <motion.circle cx={p.x} cy={p.y} r="8" fill="#00ff88" opacity="0.3"
              animate={{ r: [8, 16, 8], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <circle cx={p.x} cy={p.y} r="4" fill="#00ff88" />
          </g>
        ))}

        {/* Moving ambulance */}
        <motion.g
          animate={{ x: [0, 200, 400, 600, 800, 1000, 1200, 1400], y: [300, 280, 240, 260, 200, 220, 180, 200] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <circle r="6" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite"/>
          </circle>
          <circle r="12" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
        </motion.g>
      </svg>
    </div>
  )
}

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentStat, setCurrentStat] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCurrentStat(s => (s + 1) % stats.length), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emergency/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/3 rounded-full blur-3xl" />
        </div>

        <ParticleField />
        <AnimatedRoute />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 glass-card !p-2 !px-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-neon"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-dark-300">Real-time Emergency Response System</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="text-white">Saving </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-emerald-400 animate-gradient">Time</span>
            <span className="text-white">.</span>
            <br />
            <span className="text-white">Saving </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emergency to-red-400 animate-gradient">Lives</span>
            <span className="text-white">.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            India's smartest emergency response platform. AI-powered routing sends the
            nearest ambulance to the best-equipped hospital — in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => setModalOpen(true)}
              className="btn-emergency text-lg !py-4 !px-10 flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🚑
              </motion.span>
              Request Ambulance
            </motion.button>
            <Link to="/login">
              <motion.button
                className="btn-outline text-lg !py-4 !px-10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏥 Hospital Login
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="glass-card !p-4 text-center"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <span className="text-2xl mb-1 block">{stat.icon}</span>
                <div className="text-xl sm:text-2xl font-bold font-heading text-white">{stat.value}</div>
                <div className="text-xs text-dark-400 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-dark-500 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-neon"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Why <span className="text-neon">AetherAid</span>?
            </h2>
            <p className="text-dark-300 max-w-xl mx-auto">
              Built for the moments that matter most. Every second counts in an emergency.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card !p-6 group cursor-default"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-neon/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-neon/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              How It <span className="text-neon">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📞', title: 'Request', desc: 'Hit the emergency button. Share your location and medical needs.' },
              { step: '02', icon: '🧠', title: 'AI Routes', desc: 'Our algorithm finds the best hospital and nearest ambulance instantly.' },
              { step: '03', icon: '🚑', title: 'Rescue', desc: 'Ambulance dispatched. Track in real-time until you reach the hospital.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="text-6xl font-heading font-extrabold text-dark-700 mb-4">{item.step}</div>
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center text-3xl mx-auto mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-dark-300">{item.desc}</p>

                {i < 2 && (
                  <div className="hidden md:block absolute top-16 -right-4 w-8 text-neon/30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-24 px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center glass-card !p-12 border-neon/10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Every Second <span className="text-emergency">Matters</span>
          </h2>
          <p className="text-dark-300 mb-8 max-w-lg mx-auto">
            Join the network. Help save lives. Register your hospital or explore the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <motion.button className="btn-primary text-lg !py-4 !px-8" whileHover={{ scale: 1.05 }}>
                Explore Dashboard
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button className="btn-outline text-lg !py-4 !px-8" whileHover={{ scale: 1.05 }}>
                Register Hospital
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚑</span>
            <span className="font-heading font-bold text-white">Aether<span className="text-neon">Aid</span></span>
          </div>
          <p className="text-xs text-dark-400">© 2026 AetherAid. Saving Time. Saving Lives.</p>
        </div>
      </footer>

      <EmergencyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
