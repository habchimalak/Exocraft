import { useState, useEffect } from 'react'
import type { User, Matiere, MatiereDocument } from '../data/mockData'
import type { EtablissementType } from '../data/etablissements'

// â”€â”€ Types â”€â”€
export interface AIGeneration {
  id: number
  type: 'Quiz' | 'Examen' | 'Cours' | 'Exercices' | 'RÃ©sumÃ©'
  sujet: string
  enseignant: string
  enseignantId: number
  generatedAt: string
  status: 'success' | 'pending'
}

// â”€â”€ Helpers â”€â”€
export function formatDateTime(iso: string): string {
  if (!iso) return 'â€”'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' Ã  ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function timeAgo(iso: string): string {
  if (!iso) return 'â€”'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 5)    return 'Ã€ l\'instant'
  if (diff < 60)   return `Il y a ${diff}s`
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return `Il y a ${Math.floor(diff / 86400)}j`
}

// â”€â”€ Espace isolÃ© par Ã©tablissement â”€â”€
interface EtabState {
  users: User[]
  matieres: Matiere[]
  aiGenerations: AIGeneration[]
  totalGenerations: number
}

function makeAdminUser(): User {
  return {
    id: 1, nom: 'Administrateur', prenom: 'SystÃ¨me',
    email: 'admin@tekup.tn', role: 'admin',
    created_at: new Date().toISOString(),
    status: 'actif', matieres: [], promos: [], contentsCount: 0,
  }
}

// Deux espaces totalement sÃ©parÃ©s
const spaces: Record<EtablissementType, EtabState> = {
  licence: {
    users: [makeAdminUser()],
    matieres: [],
    aiGenerations: [],
    totalGenerations: 0,
  },
  cycle_ing: {
    users: [makeAdminUser()],
    matieres: [],          // sera initialisÃ© depuis mockMatieres via initSpace
    aiGenerations: [],
    totalGenerations: 0,
  },
}

// Listeners par espace
const listeners: Record<EtablissementType, Set<() => void>> = {
  licence:   new Set(),
  cycle_ing: new Set(),
}

function notify(type: EtablissementType) {
  listeners[type].forEach(fn => fn())
}

// â”€â”€ Initialiser les matiÃ¨res depuis les donnÃ©es mock â”€â”€
// AppelÃ© une fois au dÃ©marrage de chaque espace
export function initSpaceFromMock(
  type: EtablissementType,
  matieres: Matiere[],
) {
  if (spaces[type].matieres.length === 0 && matieres.length > 0) {
    spaces[type].matieres = [...matieres]
    notify(type)
  }
}

// â”€â”€ Factory : crÃ©e un store liÃ© Ã  un type d'Ã©tablissement â”€â”€
export function makeStore(etabType: EtablissementType) {
  const s = () => spaces[etabType]

  return {
    getUsers:      () => s().users,
    getMatieres:   () => s().matieres,
    getGenerations:() => s().aiGenerations,
    getTotalGenerations: () => s().totalGenerations,

    // â”€â”€ Users â”€â”€
    addUser(u: Omit<User, 'id' | 'created_at' | 'matieres' | 'promos' | 'contentsCount'>) {
      const newUser: User = {
        ...u, id: Date.now(),
        created_at: new Date().toISOString(),
        matieres: [], promos: [], contentsCount: 0,
      }
      spaces[etabType].users = [newUser, ...s().users]
      notify(etabType)
      return newUser
    },

    updateUser(id: number, data: Partial<User>) {
      spaces[etabType].users = s().users.map(u => u.id === id ? { ...u, ...data } : u)
      notify(etabType)
    },

    deleteUser(id: number) {
      const admins = s().users.filter(u => u.role === 'admin')
      const target = s().users.find(u => u.id === id)
      if (target?.role === 'admin' && admins.length <= 1) return // garder au moins 1 admin
      spaces[etabType].users = s().users.filter(u => u.id !== id)
      notify(etabType)
    },

    promoteToAdmin(id: number) {
      spaces[etabType].users = s().users.map(u =>
        u.id === id ? { ...u, role: 'admin' as const } : u
      )
      notify(etabType)
    },

    // â”€â”€ Matieres â”€â”€
    addMatiere(nom: string, promoIds: number[] = []) {
      const m: Matiere = { id: Date.now(), nom, enseignantsCount: 0, documents: [], promoIds }
      spaces[etabType].matieres = [...s().matieres, m]
      notify(etabType)
      return m
    },

    updateMatiere(id: number, data: Partial<Matiere>) {
      spaces[etabType].matieres = s().matieres.map(m => m.id === id ? { ...m, ...data } : m)
      notify(etabType)
    },

    deleteMatiere(id: number) {
      spaces[etabType].matieres = s().matieres.filter(m => m.id !== id)
      notify(etabType)
    },

    addDocument(matiereId: number, doc: Omit<MatiereDocument, 'id' | 'uploadedAt'>) {
      const newDoc: MatiereDocument = { ...doc, id: Date.now(), uploadedAt: new Date().toISOString() }
      spaces[etabType].matieres = s().matieres.map(m =>
        m.id === matiereId ? { ...m, documents: [...m.documents, newDoc] } : m
      )
      notify(etabType)
      return newDoc
    },

    updateDocument(matiereId: number, docId: number, data: Partial<MatiereDocument>) {
      spaces[etabType].matieres = s().matieres.map(m =>
        m.id === matiereId
          ? { ...m, documents: m.documents.map(d => d.id === docId ? { ...d, ...data } : d) }
          : m
      )
      notify(etabType)
    },

    deleteDocument(matiereId: number, docId: number) {
      spaces[etabType].matieres = s().matieres.map(m =>
        m.id === matiereId
          ? { ...m, documents: m.documents.filter(d => d.id !== docId) }
          : m
      )
      notify(etabType)
    },

    // â”€â”€ GÃ©nÃ©rations IA (lecture seule admin, viendront du backend) â”€â”€
    _receiveGeneration(g: Omit<AIGeneration, 'id' | 'generatedAt'>) {
      const newG: AIGeneration = { ...g, id: Date.now(), generatedAt: new Date().toISOString() }
      spaces[etabType].aiGenerations = [newG, ...s().aiGenerations.slice(0, 99)]
      spaces[etabType].totalGenerations += 1
      notify(etabType)
    },

    subscribe(fn: () => void) {
      listeners[etabType].add(fn)
      return () => listeners[etabType].delete(fn)
    },
  }
}

// â”€â”€ Contexte React pour le store courant â”€â”€
import React, { createContext, useContext } from 'react'

type StoreType = ReturnType<typeof makeStore>
const StoreContext = createContext<StoreType | null>(null)

export function StoreProvider({
  etabType, children,
}: { etabType: EtablissementType; children: React.ReactNode }) {
  const store = React.useMemo(() => makeStore(etabType), [etabType])
  return React.createElement(StoreContext.Provider, { value: store }, children)
}

export function useStoreContext() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStoreContext doit Ãªtre utilisÃ© dans StoreProvider')
  return ctx
}

// â”€â”€ Hook principal â”€â”€
export function useStore() {
  const store = useStoreContext()
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const unsub = store.subscribe(() => forceUpdate(n => n + 1))
    return unsub
  }, [store])

  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  return {
    users:            store.getUsers(),
    matieres:         store.getMatieres(),
    aiGenerations:    store.getGenerations(),
    totalGenerations: store.getTotalGenerations(),
    store,
  }
}

