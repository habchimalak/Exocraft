/**
 * Seed script — populates the database with:
 *  - Default admin users (one per établissement)
 *  - Predefined promos for cycle_ing (11 promos)
 *  - Predefined promos for licence (5 promos: L1–L3, M1, M2)
 *
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CYCLE_ING_PROMOS = [
  { id: 1,  niveau: '1ere', type: 'prepa',           semestre: 'S1-S2', nom: '1ère année Prépa',             code: 'PREPA-1',       specialite: null,
    matieres: ['Mathématiques 1','Physique 1','Algorithmique','Anglais technique','Français','Électronique de base','Chimie'] },
  { id: 2,  niveau: '2eme', type: 'prepa',           semestre: 'S1-S2', nom: '2ème année Prépa',             code: 'PREPA-2',       specialite: null,
    matieres: ['Mathématiques 2','Physique 2','Structures de données','Bases de données','Programmation orientée objet','Anglais technique 2','Probabilités & Statistiques'] },
  { id: 3,  niveau: '3eme', type: 'branche_commune', semestre: 'S1-S2', nom: '3ème année — Branche commune', code: 'ING-3-BC',      specialite: null,
    matieres: ['Réseaux informatiques','Systèmes d\'exploitation','Génie logiciel','Architecture des ordinateurs','Analyse numérique','Développement web','Gestion de projet','Soft skills'] },
  { id: 4,  niveau: '4eme', type: 'specialite',      semestre: 'S1',    nom: '4ème année — Cloud Computing', code: 'ING-4-J-CIM',   specialite: 'Cloud Computing',
    matieres: ['NextJS / NestJS','Administration des bases de données','Infrastructures Cloud natives','Boto3','Approches agiles','Architectures AWS','Ingénierie des protocoles réseaux','Conteneurisation','Projet Cloud'] },
  { id: 5,  niveau: '4eme', type: 'specialite',      semestre: 'S1',    nom: '4ème année — Cybersécurité',  code: 'ING-4-J-SSIRF', specialite: 'Cybersécurité',
    matieres: ['OWASP','Blockchain','Automatisation sous Linux','Développement des applications sécurisées','Droit d\'entreprise','Python pour la cybersécurité','Cryptographie','AWS Sécurité des réseaux'] },
  { id: 6,  niveau: '4eme', type: 'specialite',      semestre: 'S1',    nom: '4ème année — Data Science',   code: 'ING-4-J-SDIAF', specialite: 'Data Science',
    matieres: ['Business Intelligence Solutions','Droit d\'entreprise','Bases de données avancée','Analyse statistique','Machine Learning 1','Projet de Développement','Django','Méthodologies de gestion de projets','Architecture n-tiers avec .NET'] },
  { id: 7,  niveau: '4eme', type: 'specialite',      semestre: 'S1',    nom: '4ème année — Génie Logiciel',  code: 'ING-4-J-GL',    specialite: 'Génie Logiciel',
    matieres: ['Conception orientée objet avancée','Patterns de conception','Tests logiciels','DevOps & CI/CD','Microservices','Spring Boot','Angular','Gestion de projet agile'] },
  { id: 8,  niveau: '5eme', type: 'specialite',      semestre: 'S1-S2', nom: '5ème année — Cloud Computing', code: 'ING-5-J-CIM',   specialite: 'Cloud Computing',
    matieres: ['Cloud natif avancé','Kubernetes','Terraform','Sécurité Cloud','Big Data & Spark','Projet de fin d\'études','Stage PFE'] },
  { id: 9,  niveau: '5eme', type: 'specialite',      semestre: 'S1-S2', nom: '5ème année — Cybersécurité',  code: 'ING-5-J-SSIRF', specialite: 'Cybersécurité',
    matieres: ['Pentest avancé','Forensique numérique','SOC & SIEM','Sécurité cloud avancée','Gestion des incidents','Projet de fin d\'études','Stage PFE'] },
  { id: 10, niveau: '5eme', type: 'specialite',      semestre: 'S1-S2', nom: '5ème année — Data Science',   code: 'ING-5-J-SDIAF', specialite: 'Data Science',
    matieres: ['Deep Learning','NLP','Big Data avancé','MLOps','Vision par ordinateur','Projet de fin d\'études','Stage PFE'] },
  { id: 11, niveau: '5eme', type: 'specialite',      semestre: 'S1-S2', nom: '5ème année — Génie Logiciel',  code: 'ING-5-J-GL',    specialite: 'Génie Logiciel',
    matieres: ['Architecture distribuée','Qualité logicielle','Sécurité applicative','Cloud & déploiement','Projet de fin d\'études','Stage PFE'] },
]

const LICENCE_PROMOS = [
  { niveau: '1ere', type: 'licence', semestre: 'S1-S2', nom: '1ère Licence', code: 'L1', specialite: null, matieres: [] as string[] },
  { niveau: '2eme', type: 'licence', semestre: 'S1-S2', nom: '2ème Licence', code: 'L2', specialite: null, matieres: [] as string[] },
  { niveau: '3eme', type: 'licence', semestre: 'S1-S2', nom: '3ème Licence', code: 'L3', specialite: null, matieres: [] as string[] },
  { niveau: '4eme', type: 'master',  semestre: 'S1-S2', nom: 'Master 1',     code: 'M1', specialite: null, matieres: [] as string[] },
  { niveau: '5eme', type: 'master',  semestre: 'S1-S2', nom: 'Master 2',     code: 'M2', specialite: null, matieres: [] as string[] },
]

async function seedAdmins() {
  const password = await bcrypt.hash('Admin@1234', 12)

  // Cycle Ingénieur admin
  const adminCycleIng = await prisma.user.upsert({
    where: { email: 'admin@tekup.tn' },
    update: {},
    create: {
      nom: 'Administrateur',
      prenom: 'Système',
      email: 'admin@tekup.tn',
      password,
      role: 'admin',
      status: 'actif',
      etablissementType: 'cycle_ing',
      profile: {
        create: {
          telephone: '+216 71 000 000',
          poste: 'Administrateur Plateforme',
          departement: 'Direction Pédagogique',
          etablissement: 'TEK-UP University',
          bio: 'Responsable de la gestion de la plateforme ExoCraft — Cycle Ingénieur.',
        },
      },
    },
  })

  // Licence admin
  const adminLicence = await prisma.user.upsert({
    where: { email: 'admin@faculte.tn' },
    update: {},
    create: {
      nom: 'Administrateur',
      prenom: 'Faculté',
      email: 'admin@faculte.tn',
      password,
      role: 'admin',
      status: 'actif',
      etablissementType: 'licence',
      profile: {
        create: {
          telephone: '+216 71 000 001',
          poste: 'Administrateur Faculté',
          departement: 'Direction Pédagogique',
          etablissement: 'Faculté des Sciences',
          bio: 'Responsable de la gestion de la plateforme ExoCraft — Faculté.',
        },
      },
    },
  })

  console.log(`✅ Admin cycle_ing: ${adminCycleIng.email}`)
  console.log(`✅ Admin licence:   ${adminLicence.email}`)
}

async function seedPromos(
  promos: Array<{ niveau: string; type: string; semestre: string; nom: string; code: string; specialite: string | null; matieres: string[] }>,
  etablissementType: string,
) {
  for (const p of promos) {
    // Create or skip promo
    const existing = await prisma.promo.findFirst({
      where: { code: p.code, etablissementType },
    })

    let promo
    if (!existing) {
      promo = await prisma.promo.create({
        data: {
          nom: p.nom,
          code: p.code,
          niveau: p.niveau,
          type: p.type,
          specialite: p.specialite ?? undefined,
          semestre: p.semestre,
          etablissementType,
          promoMatieres: JSON.stringify(p.matieres),
        },
      })
      console.log(`  📚 Promo created: ${p.code}`)
    } else {
      promo = existing
      console.log(`  ⏭  Promo exists:  ${p.code}`)
    }

    // Seed matieres for this promo
    for (const nom of p.matieres) {
      let matiere = await prisma.matiere.findFirst({
        where: { nom, etablissementType },
      })
      if (!matiere) {
        matiere = await prisma.matiere.create({
          data: { nom, etablissementType },
        })
      }
      // Link matiere ↔ promo if not already linked
      const link = await prisma.matierePromo.findUnique({
        where: { matiereId_promoId: { matiereId: matiere.id, promoId: promo.id } },
      })
      if (!link) {
        await prisma.matierePromo.create({
          data: { matiereId: matiere.id, promoId: promo.id },
        })
      }
    }
  }
}

async function main() {
  console.log('🌱 Seeding ExoCraft database...')

  await seedAdmins()

  console.log('\n📖 Seeding Cycle Ingénieur promos...')
  await seedPromos(CYCLE_ING_PROMOS, 'cycle_ing')

  console.log('\n📖 Seeding Licence promos...')
  await seedPromos(LICENCE_PROMOS, 'licence')

  console.log('\n✅ Seed complete!')
  console.log('   Login credentials:')
  console.log('   cycle_ing → admin@tekup.tn   / Admin@1234')
  console.log('   licence   → admin@faculte.tn / Admin@1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
