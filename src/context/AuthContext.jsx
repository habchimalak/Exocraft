/**
 * AuthContext unifié — Solution A
 *
 * Login universel : email + mot de passe seulement.
 * Le backend retourne { token, user: { role, etablissementType, ... } }
 * Le frontend redirige automatiquement :
 *   role = "admin"      → /admin  (panneau admin)
 *   role = "enseignant" → /dashboard  (espace enseignant)
 *
 * Compatible avec les deux formats de réponse :
 *   - Admin backend (notre code) :  { token, user }
 *   - Enseignant (Rami) :           { access_token, user }
 */

import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = '/api'

// ── Token helpers ──────────────────────────────────────────────────────────
export function getToken()  { return localStorage.getItem('exocraft_token') }
export function setToken(t) { localStorage.setItem('exocraft_token', t) }
export function removeToken() {
  localStorage.removeItem('exocraft_token')
  localStorage.removeItem('exocraft_user')
}

// ── HTTP helper ────────────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  if (response.status === 401) {
    removeToken()
    window.location.href = '/login'
    throw new Error('Session expirée. Veuillez vous reconnecter.')
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message || err.error || 'Erreur'
    throw new Error(msg)
  }
  if (response.status === 204) return null
  return response.json()
}

// ── Classes/sections (compatibilité Rami) ─────────────────────────────────
export const CLASS_OPTIONS   = ['1ère ingénieur','2ème ingénieur','3ème ingénieur','4ème ingénieur','5ème ingénieur']
export const SECTION_OPTIONS = ['Cloud','Data Science','Cyber Security','Génie logiciel']
export const COMMON_SECTION  = 'Tronc commun'

export function buildAssociations(classes = CLASS_OPTIONS, sections = SECTION_OPTIONS) {
  return classes.flatMap((className) =>
    CLASS_OPTIONS.indexOf(className) < 3
      ? [{ className, section: COMMON_SECTION }]
      : sections.map((section) => ({ className, section }))
  )
}
export function defaultGroups() { return buildAssociations() }

function normalizeAssociations(associations) {
  if (!Array.isArray(associations)) return []
  return associations
    .filter((item) => item?.className && item?.section)
    .map((item) => ({ className: String(item.className), section: String(item.section) }))
}

// ── AuthContext ────────────────────────────────────────────────────────────
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('exocraft_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...parsed, associations: normalizeAssociations(parsed.associations) }
      }
    } catch {
      localStorage.removeItem('exocraft_user')
    }
    return null
  })

  const [isLoading, setIsLoading] = useState(false)

  // ── Login universel (Solution A) ──────────────────────────────────────
  // Accepte : login({ email, password }) ou login(email, password)
  const login = async (emailOrData, passwordArg) => {
    const email    = typeof emailOrData === 'object' ? emailOrData.email    : emailOrData
    const password = typeof emailOrData === 'object' ? (emailOrData.password ?? emailOrData.motDePasse) : passwordArg
    const motDePasse = password // alias pour notre backend

    setIsLoading(true)
    try {
      // Essaie d'abord le format admin (motDePasse + établissementType détecté auto)
      // Le backend accepte les deux formats
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, motDePasse, password }),
      })

      // Normaliser la réponse (notre backend: { token } / Rami: { access_token })
      const token = data.token ?? data.access_token
      if (token) setToken(token)

      const nextUser = {
        ...data.user,
        associations: normalizeAssociations(data.user?.associations),
      }

      setUser(nextUser)
      localStorage.setItem('exocraft_user', JSON.stringify(nextUser))
      return nextUser
    } finally {
      setIsLoading(false)
    }
  }

  // ── Register (enseignant Rami) ─────────────────────────────────────────
  const register = async ({ firstName, lastName, email, password, associations }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, associations }),
    })
    const token = data.token ?? data.access_token
    if (token) setToken(token)
    const nextUser = { ...data.user, associations: normalizeAssociations(data.user?.associations) }
    setUser(nextUser)
    localStorage.setItem('exocraft_user', JSON.stringify(nextUser))
    return nextUser
  }

  // ── Update profil local ────────────────────────────────────────────────
  const updateUser = (updates) => {
    const nextUser = {
      ...(user || {}),
      ...updates,
      associations: normalizeAssociations(updates.associations ?? user?.associations),
    }
    setUser(nextUser)
    localStorage.setItem('exocraft_user', JSON.stringify(nextUser))
  }

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = () => {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Export for Rami's api.js compatibility
export { apiRequest }
