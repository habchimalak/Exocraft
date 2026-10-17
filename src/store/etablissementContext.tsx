import React, { createContext, useContext, useEffect, useState } from 'react'
import type { EtablissementType } from '../data/etablissements'
import { promosApi, matieresApi, type ApiPromo, type ApiMatiere } from '../api/client'

// Shape compatible with existing pages (they use Promo/Matiere from mockData)
export interface EtabPromo {
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

export interface EtabMatiere {
  id: number
  nom: string
  enseignantsCount: number
  promoIds: number[]
  documents: {
    id: number; titre: string; type: string; format: string
    fileName: string; size: string; uploadedAt: string; promo: string
  }[]
}

interface EtabContextValue {
  type: EtablissementType
  label: string
  badge: string
  promos: EtabPromo[]
  matieres: EtabMatiere[]
  reload: () => void
}

const EtabContext = createContext<EtabContextValue>({
  type: 'cycle_ing',
  label: 'Cycle IngÃ©nieur',
  badge: 'Cycle IngÃ©nieur',
  promos: [],
  matieres: [],
  reload: () => {},
})

export function EtabProvider({
  type,
  children,
}: {
  type: EtablissementType
  children: React.ReactNode
}) {
  const [promos, setPromos] = useState<ApiPromo[]>([])
  const [matieres, setMatieres] = useState<ApiMatiere[]>([])

  async function fetchData() {
    try {
      const [p, m] = await Promise.all([promosApi.list(), matieresApi.list()])
      setPromos(p)
      setMatieres(m)
    } catch (err) {
      console.error('[EtabProvider] fetch error:', err)
    }
  }

  useEffect(() => { fetchData() }, [type])

  const label = type === 'licence'
    ? 'FacultÃ© â€” Licence / Master'
    : "Ã‰cole d'ingÃ©nieurs â€” Cycle IngÃ©nieur"
  const badge = type === 'licence' ? 'FAC Â· Licence/Master' : 'Cycle IngÃ©nieur'

  return (
    <EtabContext.Provider value={{ type, label, badge, promos, matieres, reload: fetchData }}>
      {children}
    </EtabContext.Provider>
  )
}

export function useEtab() {
  return useContext(EtabContext)
}

