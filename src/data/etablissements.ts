import type { Promo, Matiere } from './mockData'

export type EtablissementType = 'licence' | 'cycle_ing'

// ──────────────────────────────────────────────
// PROMOTIONS — Faculté Licence/Master (matières vides, à remplir par l'admin)
// ──────────────────────────────────────────────
export const PROMOS_LICENCE: Promo[] = [
  { id: 101, niveau: '1ere', type: 'licence', semestre: 'S1-S2', nom: '1ère Licence', code: 'L1', matieres: [] },
  { id: 102, niveau: '2eme', type: 'licence', semestre: 'S1-S2', nom: '2ème Licence', code: 'L2', matieres: [] },
  { id: 103, niveau: '3eme', type: 'licence', semestre: 'S1-S2', nom: '3ème Licence', code: 'L3', matieres: [] },
  { id: 104, niveau: '4eme', type: 'master',  semestre: 'S1-S2', nom: 'Master 1',     code: 'M1', matieres: [] },
  { id: 105, niveau: '5eme', type: 'master',  semestre: 'S1-S2', nom: 'Master 2',     code: 'M2', matieres: [] },
]

// Matières Licence : vides au départ, l'admin les crée
export const MATIERES_LICENCE: Matiere[] = []

// ──────────────────────────────────────────────
// UTILISATEUR ADMIN — identique pour les deux types de fac
// Sera remplacé par les vraies données de session quand le backend sera connecté
// ──────────────────────────────────────────────
export const ADMIN_USER = {
  id: 1, nom: 'Administrateur', prenom: 'Système',
  email: 'admin@tekup.tn', role: 'admin' as const,
  created_at: new Date().toISOString(),
  status: 'actif' as const,
  matieres: [], promos: [], contentsCount: 0,
}
