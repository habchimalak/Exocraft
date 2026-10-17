/**
 * API client centralisé — toutes les requêtes vers le backend ExoCraft
 * Le token JWT est stocké dans localStorage et envoyé automatiquement.
 */

export const API_BASE = 'http://localhost:3001/api'

// ── Gestion du token ──────────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('exocraft_token')
}

export function setToken(token: string): void {
  localStorage.setItem('exocraft_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('exocraft_token')
  localStorage.removeItem('exocraft_user')
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('exocraft_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem('exocraft_user', JSON.stringify(user))
}

// ── Types Auth ────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  status: string
  etablissementType: string
  createdAt: string
}

// ── Requête générique ──────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  // Ne pas forcer Content-Type pour FormData (le browser le met automatiquement)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    clearToken()
    window.location.reload()
    throw new Error('Session expirée')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      data?.error ?? data?.message ?? `Erreur ${res.status}`,
    )
  }

  return data as T
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login(email: string, password: string, etablissementType: string) {
    return request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse: password, etablissementType }),
    })
  },

  logout() {
    return request('/auth/logout', { method: 'POST' }).catch(() => {})
  },

  me() {
    return request<AuthUser & { profile?: object }>('/auth/me')
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export interface StatsResponse {
  totalUsers: number
  totalEnseignants: number
  activeEnseignants: number
  totalMatieres: number
  totalDocs: number
  totalArchives: number
  totalGenerations: number
  thisMonthGenerations: number
  contentsByType: { type: string; count: number; color: string }[]
  recentActivity: AIGeneration[]
}

export const statsApi = {
  get() { return request<StatsResponse>('/stats') },
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  status: string
  etablissementType: string
  contentsCount: number
  matieres: string[]
  promos: string[]
  created_at: string
}

export const usersApi = {
  list(params?: { role?: string; status?: string; search?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return request<ApiUser[]>(`/users${q ? `?${q}` : ''}`)
  },

  create(data: {
    nom: string; prenom: string; email: string
    role: string; status: string; password?: string
  }) {
    return request<ApiUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: Partial<ApiUser>) {
    return request<ApiUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(id: number) {
    return request<{ message: string }>(`/users/${id}`, { method: 'DELETE' })
  },

  toggleStatus(id: number) {
    return request<{ id: number; status: string }>(`/users/${id}/status`, { method: 'PATCH' })
  },

  promote(id: number) {
    return request<{ id: number; role: string }>(`/users/${id}/promote`, { method: 'PATCH' })
  },
}

// ── Promos ────────────────────────────────────────────────────────────────────
export interface ApiPromo {
  id: number
  nom: string
  code: string
  niveau: string
  type: string
  specialite?: string | null
  semestre: string
  matieres: string[]
  etablissementType: string
}

export const promosApi = {
  list() { return request<ApiPromo[]>('/promos') },
  get(id: number) { return request<ApiPromo>(`/promos/${id}`) },
  create(data: Partial<ApiPromo>) {
    return request<ApiPromo>('/promos', { method: 'POST', body: JSON.stringify(data) })
  },
  update(id: number, data: Partial<ApiPromo>) {
    return request<ApiPromo>(`/promos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete(id: number) {
    return request<{ message: string }>(`/promos/${id}`, { method: 'DELETE' })
  },
}

// ── Matieres ──────────────────────────────────────────────────────────────────
export interface ApiDocument {
  id: number
  titre: string
  type: string
  format: string
  fileName: string
  size: string
  uploadedAt: string
  promo: string
}

export interface ApiMatiere {
  id: number
  nom: string
  enseignantsCount: number
  promoIds: number[]
  documents: ApiDocument[]
}

export const matieresApi = {
  list(params?: { promoId?: number; search?: string }) {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString()
    return request<ApiMatiere[]>(`/matieres${q ? `?${q}` : ''}`)
  },

  create(data: { nom: string; promoIds?: number[] }) {
    return request<ApiMatiere>('/matieres', { method: 'POST', body: JSON.stringify(data) })
  },

  update(id: number, data: { nom?: string; promoIds?: number[] }) {
    return request<ApiMatiere>(`/matieres/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  delete(id: number) {
    return request<{ message: string }>(`/matieres/${id}`, { method: 'DELETE' })
  },

  uploadDocument(matiereId: number, file: File, meta: {
    titre: string; type: string; format: string; promo: string
  }) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('titre', meta.titre)
    fd.append('type', meta.type)
    fd.append('format', meta.format)
    fd.append('promo', meta.promo)
    return request<ApiDocument>(`/matieres/${matiereId}/documents`, {
      method: 'POST',
      body: fd,
    })
  },

  updateDocument(matiereId: number, docId: number, data: Partial<ApiDocument>, file?: File) {
    const fd = new FormData()
    if (file) fd.append('file', file)
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)) })
    return request<ApiDocument>(`/matieres/${matiereId}/documents/${docId}`, {
      method: 'PUT',
      body: fd,
    })
  },

  deleteDocument(matiereId: number, docId: number) {
    return request<{ message: string }>(
      `/matieres/${matiereId}/documents/${docId}`,
      { method: 'DELETE' },
    )
  },

  downloadUrl(matiereId: number, docId: number) {
    return `${API_BASE}/matieres/${matiereId}/documents/${docId}/download?token=${getToken()}`
  },
}

// ── Archives ──────────────────────────────────────────────────────────────────
export interface ApiArchive {
  id: number
  titre: string
  type: string
  format: string
  fichier: string
  size: string
  matiere: string
  promo: string
  uploadedBy: string
  created_at: string
}

export const archivesApi = {
  list(params?: { type?: string; matiere?: string; search?: string }) {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString()
    return request<ApiArchive[]>(`/archives${q ? `?${q}` : ''}`)
  },

  upload(file: File, meta: {
    titre: string; type: string; format: string; matiere: string; promo: string
  }) {
    const fd = new FormData()
    fd.append('file', file)
    Object.entries(meta).forEach(([k, v]) => fd.append(k, v))
    return request<ApiArchive>('/archives', { method: 'POST', body: fd })
  },

  delete(id: number) {
    return request<{ message: string }>(`/archives/${id}`, { method: 'DELETE' })
  },

  downloadUrl(id: number) {
    return `${API_BASE}/archives/${id}/download?token=${getToken()}`
  },
}

// ── Associations ──────────────────────────────────────────────────────────────
export interface ApiAssociation {
  id: number
  nom: string
  prenom: string
  email: string
  matieres: string[]
  promos: string[]
}

export const associationsApi = {
  list() { return request<ApiAssociation[]>('/associations') },
  save(userId: number, matiereNoms: string[], promoNoms: string[]) {
    return request<{ userId: number; matieres: string[]; promos: string[] }>(
      `/associations/${userId}`,
      { method: 'PUT', body: JSON.stringify({ matiereNoms, promoNoms }) },
    )
  },
}

// ── AI Generations ────────────────────────────────────────────────────────────
export interface AIGeneration {
  id: number
  type: string
  sujet: string
  enseignant: string
  enseignantId: number
  status: string
  generatedAt: string
}

export const generationsApi = {
  list(page = 1, limit = 20) {
    return request<{ total: number; data: AIGeneration[] }>(
      `/generations?page=${page}&limit=${limit}`,
    )
  },
  stats() {
    return request<{
      contentsByType: { type: string; count: number; color: string }[]
      thisMonthGenerations: number
    }>('/generations/stats')
  },
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface ApiProfile {
  nom: string
  prenom: string
  email: string
  telephone: string
  poste: string
  departement: string
  etablissement: string
  bio: string
  avatar: string | null
}

export const profileApi = {
  get() { return request<ApiProfile>('/profile') },
  update(data: Partial<ApiProfile>) {
    return request<ApiProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) })
  },
  uploadAvatar(file: File) {
    const fd = new FormData()
    fd.append('avatar', file)
    return request<{ avatar: string }>('/profile/avatar', { method: 'POST', body: fd })
  },
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export interface ApiNote {
  id: number
  content: string
  pinned: boolean
  tag: string
  author: string
  authorId: number
  createdAt: string
  updatedAt: string
}

export const notesApi = {
  list() { return request<ApiNote[]>('/notes') },
  create(content: string, tag: string) {
    return request<ApiNote>('/notes', {
      method: 'POST',
      body: JSON.stringify({ content, tag }),
    })
  },
  togglePin(id: number) {
    return request<ApiNote>(`/notes/${id}/pin`, { method: 'PATCH' })
  },
  delete(id: number) {
    return request<{ message: string }>(`/notes/${id}`, { method: 'DELETE' })
  },
}
