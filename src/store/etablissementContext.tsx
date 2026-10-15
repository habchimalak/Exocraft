import React, { createContext, useContext } from 'react'
import type { EtablissementType } from '../data/etablissements'
import { PROMOS_LICENCE, MATIERES_LICENCE } from '../data/etablissements'
import { mockPromos, mockMatieres } from '../data/mockData'
import type { Promo, Matiere } from '../data/mockData'

interface EtabContextValue {
  type: EtablissementType
  label: string
  badge: string
  promos: Promo[]
  matieres: Matiere[]
}

const EtabContext = createContext<EtabContextValue>({
  type: 'cycle_ing',
  label: 'Cycle Ingénieur',
  badge: 'Cycle Ingénieur',
  promos: mockPromos,
  matieres: mockMatieres,
})

export function EtabProvider({
  type,
  children,
}: {
  type: EtablissementType
  children: React.ReactNode
}) {
  const value: EtabContextValue =
    type === 'licence'
      ? {
          type,
          label: 'Faculté — Licence / Master',
          badge: 'FAC · Licence/Master',
          promos: PROMOS_LICENCE,
          matieres: MATIERES_LICENCE,
        }
      : {
          type,
          label: 'École d\'ingénieurs — Cycle Ingénieur',
          badge: 'Cycle Ingénieur',
          promos: mockPromos,
          matieres: mockMatieres,
        }

  return <EtabContext.Provider value={value}>{children}</EtabContext.Provider>
}

export function useEtab() {
  return useContext(EtabContext)
}
