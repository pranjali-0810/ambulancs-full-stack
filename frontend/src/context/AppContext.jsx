import { createContext, useContext, useReducer, useCallback } from 'react'

const AppContext = createContext(null)

const initialState = {
  hospitals: [],
  ambulances: [],
  activeRequest: null,
  alerts: [],
  user: null,
  token: localStorage.getItem('token') || null,
  wsConnected: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_HOSPITALS':
      return { ...state, hospitals: action.payload }
    case 'UPDATE_HOSPITAL': {
      const updated = state.hospitals.map(h =>
        h.id === action.payload.id ? { ...h, ...action.payload } : h
      )
      return { ...state, hospitals: updated }
    }
    case 'SET_AMBULANCES':
      return { ...state, ambulances: action.payload }
    case 'UPDATE_AMBULANCE': {
      const updated = state.ambulances.map(a =>
        a.id === action.payload.id ? { ...a, ...action.payload } : a
      )
      return { ...state, ambulances: updated }
    }
    case 'SET_ACTIVE_REQUEST':
      return { ...state, activeRequest: action.payload }
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 10) }
    case 'REMOVE_ALERT':
      return { ...state, alerts: state.alerts.filter(a => a.id !== action.payload) }
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_TOKEN':
      if (action.payload) localStorage.setItem('token', action.payload)
      else localStorage.removeItem('token')
      return { ...state, token: action.payload }
    case 'SET_WS_CONNECTED':
      return { ...state, wsConnected: action.payload }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return { ...state, user: null, token: null }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random()
    dispatch({ type: 'ADD_ALERT', payload: { ...alert, id } })
    if (alert.autoDismiss !== false) {
      setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: id }), 5000)
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, addAlert }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
