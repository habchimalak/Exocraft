import { useState, useEffect, createContext, useContext } from 'react'
import React from 'react'
import type { EtablissementType } from '../data/etablissements'

export interface AdminProfile {
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

// â”€â”€ Profil par dÃ©faut selon le type d'Ã©tablissement â”€â”€
function defaultProfile(type: EtablissementType): AdminProfile {
  if (type === 'licence') {
    return {
      nom: 'Administrateur', prenom: 'FacultÃ©',
      email: 'admin@faculte.tn',
      telephone: '+216 71 000 001',
      poste: 'Administrateur FacultÃ©',
      departement: 'Direction PÃ©dagogique',
      etablissement: 'FacultÃ© des Sciences',
      bio: 'Responsable de la gestion de la plateforme ExoCraft â€” FacultÃ©.',
      avatar: null,
    }
  }
  return {
    nom: 'Administrateur', prenom: 'SystÃ¨me',
    email: 'admin@tekup.tn',
    telephone: '+216 71 000 000',
    poste: 'Administrateur Plateforme',
    departement: 'Direction PÃ©dagogique',
    etablissement: 'TEK-UP University',
    bio: 'Responsable de la gestion de la plateforme ExoCraft â€” Cycle IngÃ©nieur.',
    avatar: null,
  }
}

// â”€â”€ Deux profils totalement sÃ©parÃ©s â”€â”€
type Listener = () => void

const profiles: Record<EtablissementType, AdminProfile> = {
  licence:   defaultProfile('licence'),
  cycle_ing: defaultProfile('cycle_ing'),
}

const profileListeners: Record<EtablissementType, Set<Listener>> = {
  licence:   new Set(),
  cycle_ing: new Set(),
}

function notifyProfile(type: EtablissementType) {
  profileListeners[type].forEach(fn => fn())
}

// â”€â”€ Store factory par espace â”€â”€
export function makeProfileStore(type: EtablissementType) {
  return {
    get: () => profiles[type],
    update(data: Partial<AdminProfile>) {
      profiles[type] = { ...profiles[type], ...data }
      notifyProfile(type)
    },
    subscribe(fn: Listener) {
      profileListeners[type].add(fn)
      return () => profileListeners[type].delete(fn)
    },
  }
}

// â”€â”€ Contexte React â”€â”€
type ProfileStoreType = ReturnType<typeof makeProfileStore>
const ProfileContext = createContext<ProfileStoreType | null>(null)

export function ProfileProvider({
  type,
  children,
}: {
  type: EtablissementType
  children: React.ReactNode
}) {
  const store = React.useMemo(() => makeProfileStore(type), [type])
  return React.createElement(ProfileContext.Provider, { value: store }, children)
}

export function useProfileStore() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfileStore doit Ãªtre dans ProfileProvider')
  return ctx
}

// â”€â”€ Hook React â”€â”€
export function useProfile() {
  const store = useProfileStore()
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const unsub = store.subscribe(() => forceUpdate(n => n + 1))
    return unsub
  }, [store])

  return store.get()
}

// Garder profileStore pour la compatibilitÃ© (utilisÃ© dans Profile.tsx)
export const profileStore = {
  update: (_data: Partial<AdminProfile>) => {},  // no-op, remplacÃ© par le contexte
  get: () => profiles['cycle_ing'],
  subscribe: (_fn: Listener) => () => {},
}

