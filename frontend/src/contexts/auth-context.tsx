import React, { createContext, useContext, useState, useEffect } from 'react'
import { EventsOn } from '../../wailsjs/runtime/runtime'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    EventsOn('github:auth:success', () => {
      console.log('GitHub auth success in AuthProvider')
      setIsAuthenticated(true)
    })

    EventsOn('github:auth:error', (error) => {
      console.log('GitHub auth error in AuthProvider:', error)
      setIsAuthenticated(false)
    })
  }, [])

  const login = () => setIsAuthenticated(true)
  const logout = () => setIsAuthenticated(false)

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}