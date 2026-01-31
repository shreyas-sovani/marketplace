import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'buyer' | 'seller'

export interface AuthUser {
  id: string
  email: string
  username: string
  walletAddress: string
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (user: AuthUser) => void
  logout: () => void
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to load user from localStorage:', error)
        localStorage.removeItem('authUser')
      }
    }
  }, [])

  const login = (newUser: AuthUser) => {
    setUser(newUser)
    localStorage.setItem('authUser', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authUser')
  }

  const value: AuthContextType = {
    user,
    isLoggedIn: user !== null,
    login,
    logout,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
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
