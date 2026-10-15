// ── Mock data for ExoCraft Admin — TEK-UP University ──

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: 'enseignant' | 'admin'
  created_at: string
  matieres: string[]
  promos: string[]
  contentsCount: number
  status: 'actif' | 'inactif'
}

export interface Matiere {
  id: number
  nom: string
  enseignantsCount: number
  documents: MatiereDocument[]
  promoIds: number[]
}

export interface MatiereDocument {
  id: number
  titre: string
  type: 'cours' | 'examen' | 'exercice' | 'resume'
  format: 'PDF' | 'Word'
  fileName: string
  size: string
  uploadedAt: string
  promo: string
  fileData?: string
}

export interface Promo {
  id: number
  niveau: '1ere' | '2eme' | '3eme' | '4eme' | '5eme'
  type: string
  specialite?: string
  semestre: 'S1' | 'S2' | 'S1-S2'
  nom: string
  code: string
  matieres: string[]
}

// ──────────────────────────────────────────────
// PROMOTIONS — Cycle Ingénieur
// ──────────────────────────────────────────────
export const mockPromos: Promo[] = [
  {
    id: 1, niveau: '1ere', type: 'prepa', semestre: 'S1-S2',
    nom: '1ère année Prépa', code: 'PREPA-1',
    matieres: ['Mathématiques 1','Physique 1','Algorithmique','Anglais technique','Français','Électronique de base','Chimie'],
  },
  {
    id: 2, niveau: '2eme', type: 'prepa', semestre: 'S1-S2',
    nom: '2ème année Prépa', code: 'PREPA-2',
    matieres: ['Mathématiques 2','Physique 2','Structures de données','Bases de données','Programmation orientée objet','Anglais technique 2','Probabilités & Statistiques'],
  },
  {
    id: 3, niveau: '3eme', type: 'branche_commune', semestre: 'S1-S2',
    nom: '3ème année — Branche commune', code: 'ING-3-BC',
    matieres: ['Réseaux informatiques','Systèmes d\'exploitation','Génie logiciel','Architecture des ordinateurs','Analyse numérique','Développement web','Gestion de projet','Soft skills'],
  },
  {
    id: 4, niveau: '4eme', type: 'specialite', specialite: 'Cloud Computing',
    semestre: 'S1', nom: '4ème année — Cloud Computing', code: 'ING-4-J-CIM',
    matieres: ['NextJS / NestJS','Administration des bases de données','Infrastructures Cloud natives','Boto3','Approches agiles','Architectures AWS','Ingénierie des protocoles réseaux','Conteneurisation','Projet Cloud'],
  },
  {
    id: 5, niveau: '4eme', type: 'specialite', specialite: 'Cybersécurité',
    semestre: 'S1', nom: '4ème année — Cybersécurité', code: 'ING-4-J-SSIRF',
    matieres: ['OWASP','Blockchain','Automatisation sous Linux','Développement des applications sécurisées','Droit d\'entreprise','Python pour la cybersécurité','Cryptographie','AWS Sécurité des réseaux'],
  },
  {
    id: 6, niveau: '4eme', type: 'specialite', specialite: 'Data Science',
    semestre: 'S1', nom: '4ème année — Data Science', code: 'ING-4-J-SDIAF',
    matieres: ['Business Intelligence Solutions','Droit d\'entreprise','Bases de données avancée','Analyse statistique','Machine Learning 1','Projet de Développement','Django','Méthodologies de gestion de projets','Architecture n-tiers avec .NET'],
  },
  {
    id: 7, niveau: '4eme', type: 'specialite', specialite: 'Génie Logiciel',
    semestre: 'S1', nom: '4ème année — Génie Logiciel', code: 'ING-4-J-GL',
    matieres: ['Conception orientée objet avancée','Patterns de conception','Tests logiciels','DevOps & CI/CD','Microservices','Spring Boot','Angular','Gestion de projet agile'],
  },
  {
    id: 8, niveau: '5eme', type: 'specialite', specialite: 'Cloud Computing',
    semestre: 'S1-S2', nom: '5ème année — Cloud Computing', code: 'ING-5-J-CIM',
    matieres: ['Cloud natif avancé','Kubernetes','Terraform','Sécurité Cloud','Big Data & Spark','Projet de fin d\'études','Stage PFE'],
  },
  {
    id: 9, niveau: '5eme', type: 'specialite', specialite: 'Cybersécurité',
    semestre: 'S1-S2', nom: '5ème année — Cybersécurité', code: 'ING-5-J-SSIRF',
    matieres: ['Pentest avancé','Forensique numérique','SOC & SIEM','Sécurité cloud avancée','Gestion des incidents','Projet de fin d\'études','Stage PFE'],
  },
  {
    id: 10, niveau: '5eme', type: 'specialite', specialite: 'Data Science',
    semestre: 'S1-S2', nom: '5ème année — Data Science', code: 'ING-5-J-SDIAF',
    matieres: ['Deep Learning','NLP','Big Data avancé','MLOps','Vision par ordinateur','Projet de fin d\'études','Stage PFE'],
  },
  {
    id: 11, niveau: '5eme', type: 'specialite', specialite: 'Génie Logiciel',
    semestre: 'S1-S2', nom: '5ème année — Génie Logiciel', code: 'ING-5-J-GL',
    matieres: ['Architecture distribuée','Qualité logicielle','Sécurité applicative','Cloud & déploiement','Projet de fin d\'études','Stage PFE'],
  },
]

// ──────────────────────────────────────────────
// MATIÈRES — Cycle Ingénieur (construites depuis les promos)
// ──────────────────────────────────────────────
function buildMatieres(): Matiere[] {
  const allNames = new Set<string>()
  mockPromos.forEach(p => p.matieres.forEach(m => allNames.add(m)))
  return Array.from(allNames).map((nom, i) => {
    const linked = mockPromos.filter(p => p.matieres.includes(nom))
    return { id: i + 1, nom, enseignantsCount: 0, documents: [], promoIds: linked.map(p => p.id) }
  })
}
export const mockMatieres: Matiere[] = buildMatieres()

// ──────────────────────────────────────────────
// UTILISATEURS — Un seul admin au départ, aucun enseignant
// (les enseignants arrivent via la partie user quand elle sera connectée)
// ──────────────────────────────────────────────
export const mockUsers: User[] = [
  {
    id: 1, nom: 'Administrateur', prenom: 'Système',
    email: 'admin@tekup.tn', role: 'admin',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'actif', matieres: [], promos: [], contentsCount: 0,
  },
]

// ──────────────────────────────────────────────
// ARCHIVES
// ──────────────────────────────────────────────
export interface Archive {
  id: number
  titre: string
  type: 'cours' | 'examen'
  fichier: string
  format: 'PDF' | 'Word'
  matiere: string
  promo: string
  uploadedBy: string
  created_at: string
  size: string
}

export const mockArchives: Archive[] = []

// ──────────────────────────────────────────────
// STATS — tout à 0
// ──────────────────────────────────────────────
export const mockStats = {
  totalUsers: 0,
  totalEnseignants: 0,
  totalMatieres: mockMatieres.length,
  totalPromos: mockPromos.length,
  totalArchives: 0,
  totalGenerations: 0,
  thisMonthGenerations: 0,
  contentsByType: [
    { type: 'Quiz',      count: 0, color: '#5b4fcf' },
    { type: 'Examen',    count: 0, color: '#e17055' },
    { type: 'Cours',     count: 0, color: '#00b894' },
    { type: 'Exercices', count: 0, color: '#f39c12' },
    { type: 'Résumé',    count: 0, color: '#4a90e2' },
  ],
  recentActivity: [],
}
