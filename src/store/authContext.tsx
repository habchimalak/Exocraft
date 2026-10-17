/**
 * AuthContext — gère la session JWT globale.
 * Remplace l'état local de App.tsx (session.logged + session.type).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  authApi,
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  type AuthUser,
} from '../api/client'
import type { EtablissementType } from '../data/etablissements'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string, etablissementType: EtablissementType) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaurer la session depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = getToken()
    const storedUser = getStoredUser()
    if (storedToken && storedUser) {
      setTokenState(storedToken)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (
    email: string,
    password: string,
    etablissementType: EtablissementType,
  ) => {
    const { token: newToken, user: newUser } = await authApi.login(email, password, etablissementType)
    setToken(newToken)
    setStoredUser(newUser)
    setTokenState(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
