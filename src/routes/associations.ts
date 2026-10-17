import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireAdmin)

// â”€â”€ GET /api/associations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Returns all enseignants with their associated matieres and promos
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const etablissementType = req.user!.etablissementType

  try {
    const users = await prisma.user.findMany({
      where: { etablissementType, role: 'enseignant' },
      include: {
        matiereAssoc: { include: { matiere: true } },
        promoAssoc: { include: { promo: true } },
      },
      orderBy: { nom: 'asc' },
    })

    const shaped = users.map(({ password: _pw, ...u }) => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      role: u.role,
      status: u.status,
      matieres: u.matiereAssoc.map((a) => a.matiere.nom),
      promos: u.promoAssoc.map((a) => a.promo.nom),
      contentsCount: u.contentsCount,
      created_at: u.createdAt.toISOString(),
    }))

    res.json(shaped)
  } catch (err) {
    console.error('[Associations] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ PUT /api/associations/:userId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Replaces the full set of associations for a teacher
router.put(
  '/:userId',
  [
    body('matiereNoms').isArray().withMessage('matiereNoms doit Ãªtre un tableau'),
    body('promoNoms').isArray().withMessage('promoNoms doit Ãªtre un tableau'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const userId = parseInt(String(req.params.userId))
    const etablissementType = req.user!.etablissementType
    const { matiereNoms, promoNoms } = req.body as {
      matiereNoms: string[]
      promoNoms: string[]
    }

    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, etablissementType },
      })
      if (!user) {
        res.status(404).json({ error: 'Utilisateur introuvable' })
        return
      }

      // Resolve matiere names â†’ IDs (only from same Ã©tablissement)
      const matieres = await prisma.matiere.findMany({
        where: { etablissementType, nom: { in: matiereNoms } },
      })

      // Resolve promo names â†’ IDs
      const promos = await prisma.promo.findMany({
        where: { etablissementType, nom: { in: promoNoms } },
      })

      // Replace all associations atomically
      await prisma.$transaction([
        prisma.userMatiere.deleteMany({ where: { userId } }),
        prisma.userPromo.deleteMany({ where: { userId } }),
        ...(matieres.length > 0
          ? [prisma.userMatiere.createMany({
              data: matieres.map((m) => ({ userId, matiereId: m.id })),
            })]
          : []),
        ...(promos.length > 0
          ? [prisma.userPromo.createMany({
              data: promos.map((p) => ({ userId, promoId: p.id })),
            })]
          : []),
      ])

      // Update enseignantsCount on affected matieres
      for (const m of matieres) {
        const count = await prisma.userMatiere.count({ where: { matiereId: m.id } })
        await prisma.matiere.update({ where: { id: m.id }, data: {} }) // trigger updatedAt
        // Note: enseignantsCount is a virtual count â€” we return it live from _count
        void count
      }

      res.json({
        userId,
        matieres: matieres.map((m) => m.nom),
        promos: promos.map((p) => p.nom),
      })
    } catch (err) {
      console.error('[Associations] PUT error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

export default router

