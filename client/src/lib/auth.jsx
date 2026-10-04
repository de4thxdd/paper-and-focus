import React, { createContext, useContext, useEffect, useState } from 'react'
import { request, api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('diary_token')) { setLoading(false); return }
    request(api.get('/auth/me')).then(d => setUser(d.user)).catch(() => localStorage.removeItem('diary_token')).finally(() => setLoading(false))
  }, [])

  const login = async payload => {
    const d = await request(api.post('/auth/login', payload))
    localStorage.setItem('diary_token', d.token); setUser(d.user); return d.user
  }
  const register = async payload => {
    const d = await request(api.post('/auth/register', payload))
    localStorage.setItem('diary_token', d.token); setUser(d.user); return d.user
  }
  const logout = () => { localStorage.removeItem('diary_token'); setUser(null) }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
