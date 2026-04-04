// Mock data for frontend development before backend is ready

export const mockHospitals = [
  {
    id: 1,
    name: 'AIIMS Delhi',
    lat: 28.5672,
    lng: 77.2100,
    total_beds_icu: 50,
    available_beds_icu: 12,
    total_beds_general: 200,
    available_beds_general: 45,
    blood_inventory: { 'A+': 15, 'A-': 5, 'B+': 20, 'B-': 3, 'O+': 25, 'O-': 8, 'AB+': 10, 'AB-': 2 },
    status: 'active',
    contact: '+91-11-2658-8500',
  },
  {
    id: 2,
    name: 'Safdarjung Hospital',
    lat: 28.5685,
    lng: 77.2066,
    total_beds_icu: 40,
    available_beds_icu: 5,
    total_beds_general: 150,
    available_beds_general: 30,
    blood_inventory: { 'A+': 8, 'A-': 2, 'B+': 12, 'B-': 1, 'O+': 18, 'O-': 4, 'AB+': 6, 'AB-': 1 },
    status: 'active',
    contact: '+91-11-2673-0000',
  },
  {
    id: 3,
    name: 'Max Super Specialty',
    lat: 28.5594,
    lng: 77.2588,
    total_beds_icu: 60,
    available_beds_icu: 20,
    total_beds_general: 250,
    available_beds_general: 80,
    blood_inventory: { 'A+': 22, 'A-': 8, 'B+': 28, 'B-': 5, 'O+': 35, 'O-': 12, 'AB+': 14, 'AB-': 4 },
    status: 'active',
    contact: '+91-11-2651-5050',
  },
  {
    id: 4,
    name: 'Fortis Hospital',
    lat: 28.5355,
    lng: 77.2510,
    total_beds_icu: 45,
    available_beds_icu: 2,
    total_beds_general: 180,
    available_beds_general: 15,
    blood_inventory: { 'A+': 5, 'A-': 1, 'B+': 8, 'B-': 0, 'O+': 10, 'O-': 2, 'AB+': 3, 'AB-': 0 },
    status: 'critical',
    contact: '+91-11-4277-6222',
  },
  {
    id: 5,
    name: 'Apollo Hospital',
    lat: 28.5440,
    lng: 77.2830,
    total_beds_icu: 55,
    available_beds_icu: 18,
    total_beds_general: 220,
    available_beds_general: 65,
    blood_inventory: { 'A+': 18, 'A-': 6, 'B+': 24, 'B-': 4, 'O+': 30, 'O-': 10, 'AB+': 12, 'AB-': 3 },
    status: 'active',
    contact: '+91-11-2987-1010',
  },
  {
    id: 6,
    name: 'Sir Ganga Ram Hospital',
    lat: 28.6358,
    lng: 77.1923,
    total_beds_icu: 35,
    available_beds_icu: 8,
    total_beds_general: 160,
    available_beds_general: 40,
    blood_inventory: { 'A+': 12, 'A-': 4, 'B+': 16, 'B-': 2, 'O+': 22, 'O-': 6, 'AB+': 8, 'AB-': 2 },
    status: 'active',
    contact: '+91-11-2586-1234',
  },
]

export const mockAmbulances = [
  { id: 1, name: 'AMB-001', lat: 28.5550, lng: 77.2200, status: 'idle', driver: 'Rajesh Kumar' },
  { id: 2, name: 'AMB-002', lat: 28.5700, lng: 77.2300, status: 'on_route', driver: 'Suresh Singh', assignedHospital: 1 },
  { id: 3, name: 'AMB-003', lat: 28.5400, lng: 77.2600, status: 'idle', driver: 'Amit Sharma' },
  { id: 4, name: 'AMB-004', lat: 28.5800, lng: 77.1900, status: 'emergency', driver: 'Vikram Patel', assignedHospital: 3 },
  { id: 5, name: 'AMB-005', lat: 28.6000, lng: 77.2100, status: 'idle', driver: 'Deepak Verma' },
]

export const mockBloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export const mockBedTrends = [
  { time: '00:00', icu: 35, general: 120 },
  { time: '04:00', icu: 30, general: 110 },
  { time: '08:00', icu: 25, general: 95 },
  { time: '12:00', icu: 20, general: 85 },
  { time: '16:00', icu: 28, general: 100 },
  { time: '20:00', icu: 32, general: 115 },
  { time: '23:59', icu: 34, general: 118 },
]

export const mockBloodTrends = [
  { group: 'A+', units: 15, critical: 5 },
  { group: 'A-', units: 5, critical: 3 },
  { group: 'B+', units: 20, critical: 5 },
  { group: 'B-', units: 3, critical: 3 },
  { group: 'O+', units: 25, critical: 8 },
  { group: 'O-', units: 8, critical: 5 },
  { group: 'AB+', units: 10, critical: 3 },
  { group: 'AB-', units: 2, critical: 2 },
]

// Haversine distance
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Smart hospital scoring
export function scoreHospital(hospital, patientLat, patientLng, bloodGroupNeeded) {
  const distance = calculateDistance(patientLat, patientLng, hospital.lat, hospital.lng)
  const bedScore = ((hospital.available_beds_icu + hospital.available_beds_general) / (hospital.total_beds_icu + hospital.total_beds_general)) * 40
  const bloodScore = bloodGroupNeeded && hospital.blood_inventory[bloodGroupNeeded] > 0
    ? (hospital.blood_inventory[bloodGroupNeeded] / 30) * 30
    : 15
  const distanceScore = Math.max(0, 30 - (distance * 3))
  return { ...hospital, score: bedScore + bloodScore + distanceScore, distance: distance.toFixed(1), eta: Math.ceil(distance * 3) }
}
