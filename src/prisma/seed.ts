import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const CYCLE_ING_PROMOS = [
  { niveau: '1ere', type: 'prepa', semestre: 'S1-S2', nom: '1ère année Prépa', code: 'PREPA-1', specialite: null, matieres: ['Mathématiques 1','Physique 1','Algorithmique','Anglais technique','Français','Électronique de base','Chimie'] },
  { niveau: '2eme', type: 'prepa', semestre: 'S1-S2', nom: '2ème année Prépa', code: 'PREPA-2', specialite: null, matieres: ['Mathématiques 2','Physique 2','Structures de données','Bases de données','Programmation orientée objet','Anglais technique 2','Probabilités & Statistiques'] },
  { niveau: '3eme', type: 'branche_commune', semestre: 'S1-S2', nom: '3ème année — Branche commune', code: 'ING-3-BC', specialite: null, matieres: ['Réseaux informatiques','Systèmes d\'exploitation','Génie logiciel','Architecture des ordinateurs','Analyse numérique','Développement web','Gestion de projet','Soft skills'] },
  { niveau: '4eme', type: 'specialite', semestre: 'S1', nom: '4ème année — Cloud Computing', code: 'ING-4-J-CIM', specialite: 'Cloud Computing', matieres: ['NextJS / NestJS','Administration des bases de données','Infrastructures Cloud natives','Boto3','Approches agiles','Architectures AWS','Ingénierie des protocoles réseaux','Conteneurisation','Projet Cloud'] },
  { niveau: '4eme', type: 'specialite', semestre: 'S1', nom: '4ème année — Cybersécurité', code: 'ING-4-J-SSIRF', specialite: 'Cybersécurité', matieres: ['OWASP','Blockchain','Automatisation sous Linux','Développement des applications sécurisées','Droit d\'entreprise','Python pour la cybersécurité','Cryptographie','AWS Sécurité des réseaux'] },
  { niveau: '4eme', type: 'specialite', semestre: 'S1', nom: '4ème année — Data Science', code: 'ING-4-J-SDIAF', specialite: 'Data Science', matieres: ['Business Intelligence Solutions','Droit d\'entreprise','Bases de données avancée','Analyse statistique','Machine Learning 1','Projet de Développement','Django','Méthodologies de gestion de projets','Architecture n-tiers avec .NET'] },
  { niveau: '4eme', type: 'specialite', semestre: 'S1', nom: '4ème année — Génie Logiciel', code: 'ING-4-J-GL', specialite: 'Génie Logiciel', matieres: ['Conception orientée objet avancée','Patterns de conception','Tests logiciels','DevOps & CI/CD','Microservices','Spring Boot','Angular','Gestion de projet agile'] },
  { niveau: '5eme', type: 'specialite', semestre: 'S1-S2', nom: '5ème année — Cloud Computing', code: 'ING-5-J-CIM', specialite: 'Cloud Computing', matieres: ['Cloud natif avancé','Kubernetes','Terraform','Sécurité Cloud','Big Data & Spark','Projet de fin d\'études','Stage PFE'] },
  { niveau: '5eme', type: 'specialite', semestre: 'S1-S2', nom: '5ème année — Cybersécurité', code: 'ING-5-J-SSIRF', specialite: 'Cybersécurité', matieres: ['Pentest avancé','Forensique numérique','SOC & SIEM','Sécurité cloud avancée','Gestion des incidents','Projet de fin d\'études','Stage PFE'] },
  { niveau: '5eme', type: 'specialite', semestre: 'S1-S2', nom: '5ème année — Data Science', code: 'ING-5-J-SDIAF', specialite: 'Data Science', matieres: ['Deep Learning','NLP','Big Data avancé','MLOps','Vision par ordinateur','Projet de fin d\'études','Stage PFE'] },
  { niveau: '5eme', type: 'specialite', semestre: 'S1-S2', nom: '5ème année — Génie Logiciel', code: 'ING-5-J-GL', specialite: 'Génie Logiciel', matieres: ['Architecture distribuée','Qualité logicielle','Sécurité applicative','Cloud & déploiement','Projet de fin d\'études','Stage PFE'] },
]

const LICENCE_PROMOS = [
  { niveau: '1ere', type: 'licence', semestre: 'S1-S2', nom: '1ère Licence', code: 'L1', specialite: null, matieres: [] as string[] },
  { niveau: '2eme', type: 'licence', semestre: 'S1-S2', nom: '2ème Licence', code: 'L2', specialite: null, matieres: [] as string[] },
  { niveau: '3eme', type: 'licence', semestre: 'S1-S2', nom: '3ème Licence', code: 'L3', specialite: null, matieres: [] as string[] },
  { niveau: '4eme', type: 'master', semestre: 'S1-S2', nom: 'Master 1', code: 'M1', specialite: null, matieres: [] as string[] },
  { niveau: '5eme', type: 'master', semestre: 'S1-S2', nom: 'Master 2', code: 'M2', specialite: null, matieres: [] as string[] },
]

async function main() {
  console.log('🌱 Seeding ExoCraft database...')
  const password = await bcrypt.hash('Admin@1234', 10)

  await prisma.user.upsert({
    where: { email: 'admin@tekup.tn' },
    update: {},
    create: {
      nom: 'Administrateur', prenom: 'Système', email: 'admin@tekup.tn',
      password, role: 'admin', status: 'actif', etablissementType: 'cycle_ing',
      profile: { create: { telephone: '+216 71 000 000', poste: 'Administrateur Plateforme', departement: 'Direction Pédagogique', etablissement: 'TEK-UP University', bio: 'Responsable de la gestion de la plateforme ExoCraft — Cycle Ingénieur.' } },
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@faculte.tn' },
    update: {},
    create: {
      nom: 'Administrateur', prenom: 'Faculté', email: 'admin@faculte.tn',
      password, role: 'admin', status: 'actif', etablissementType: 'licence',
      profile: { create: { telephone: '+216 71 000 001', poste: 'Administrateur Faculté', departement: 'Direction Pédagogique', etablissement: 'Faculté des Sciences', bio: 'Responsable de la gestion de la plateforme ExoCraft — Faculté.' } },
    },
  })

  console.log('✅ Admin users created')

  for (const etab of ['cycle_ing', 'licence']) {
    const promos = etab === 'cycle_ing' ? CYCLE_ING_PROMOS : LICENCE_PROMOS
    for (const p of promos) {
      const existing = await prisma.promo.findFirst({ where: { code: p.code, etablissementType: etab } })
      const promo = existing ?? await prisma.promo.create({ data: { nom: p.nom, code: p.code, niveau: p.niveau, type: p.type, specialite: p.specialite ?? undefined, semestre: p.semestre, etablissementType: etab, promoMatieres: JSON.stringify(p.matieres) } })
      for (const nom of p.matieres) {
        let matiere = await prisma.matiere.findFirst({ where: { nom, etablissementType: etab } })
        if (!matiere) matiere = await prisma.matiere.create({ data: { nom, etablissementType: etab } })
        const link = await prisma.matierePromo.findUnique({ where: { matiereId_promoId: { matiereId: matiere.id, promoId: promo.id } } })
        if (!link) await prisma.matierePromo.create({ data: { matiereId: matiere.id, promoId: promo.id } })
      }
    }
  }

  console.log('✅ Promos and matieres seeded')
  console.log('\nLogin credentials:')
  console.log('  cycle_ing → admin@tekup.tn   / Admin@1234')
  console.log('  licence   → admin@faculte.tn / Admin@1234')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
