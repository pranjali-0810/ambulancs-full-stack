import axios from 'axios'

const API_BASE = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Hospital APIs
export const getHospitals = () => api.get('/hospitals')
export const registerHospital = (data) => api.post('/hospital/register', data)
export const updateAvailability = (data) => api.put('/hospital/update-availability', data)

// Ambulance APIs
export const getAmbulances = () => api.get('/ambulances')
export const assignAmbulance = (data) => api.post('/assign-ambulance', data)

// Emergency API
export const requestEmergency = (data) => api.post('/request-emergency', data)

// Auth APIs
export const login = (data) => api.post('/auth/login', data)

// WebSocket
export function connectWebSocket(onMessage) {
  const ws = new WebSocket(`ws://localhost:8000/ws`)
  ws.onopen = () => console.log('WebSocket connected')
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (e) {
      console.error('WS parse error:', e)
    }
  }
  ws.onerror = () => {} // Silent
  ws.onclose = () => {}
  return ws
}

// Helper: try API first, fallback to mock
export async function fetchWithFallback(apiCall, mockData) {
  try {
    const res = await apiCall()
    return res.data
  } catch {
    return mockData
  }
}

export default api
