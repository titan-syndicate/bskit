import React, { createContext, useContext, useState, useEffect } from 'react'
import { EventsOn } from '../../wailsjs/runtime/runtime'

interface UserInfo {
  login: string
  avatar_url: string
  email: string
  name: string
}

interface AuthContextType {
  isAuthenticated: boolean
  userInfo: UserInfo | null
  login: (userInfo: UserInfo) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    EventsOn('github:auth:success', (userInfo: UserInfo) => {
      console.log('GitHub auth success in AuthProvider:', userInfo)
      setIsAuthenticated(true)
      setUserInfo(userInfo)
    })

    EventsOn('github:auth:error', (error) => {
      console.log('GitHub auth error in AuthProvider:', error)
      setIsAuthenticated(false)
      setUserInfo(null)
    })
  }, [])

  const login = (userInfo: UserInfo) => {
    setIsAuthenticated(true)
    setUserInfo(userInfo)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserInfo(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, login, logout }}>
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