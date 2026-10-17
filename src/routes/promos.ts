import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireAdmin)

// Helper: shape a Promo for the frontend
function shapePromo(p: {
  id: number; nom: string; code: string; niveau: string; type: string
  specialite: string | null; semestre: string; etablissementType: string
  createdAt: Date; updatedAt: Date; promoMatieres: string
  matierePromos?: Array<{ matiere: { nom: string } }>
}) {
  return {
    id: p.id,
    nom: p.nom,
    code: p.code,
    niveau: p.niveau,
    type: p.type,
    specialite: p.specialite,
    semestre: p.semestre,
    etablissementType: p.etablissementType,
    // Merge stored matiere-names array with live associations
    matieres: p.matierePromos
      ? p.matierePromos.map((mp) => mp.matiere.nom)
      : (JSON.parse(p.promoMatieres) as string[]),
  }
}

// â”€â”€ GET /api/promos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const etablissementType = req.user!.etablissementType
  try {
    const promos = await prisma.promo.findMany({
      where: { etablissementType },
      include: { matierePromos: { include: { matiere: true } } },
      orderBy: { id: 'asc' },
    })
    res.json(promos.map(shapePromo))
  } catch (err) {
    console.error('[Promos] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ GET /api/promos/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType
  try {
    const promo = await prisma.promo.findFirst({
      where: { id, etablissementType },
      include: { matierePromos: { include: { matiere: true } } },
    })
    if (!promo) {
      res.status(404).json({ error: 'Promotion introuvable' })
      return
    }
    res.json(shapePromo(promo))
  } catch (err) {
    console.error('[Promos] GET/:id error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ POST /api/promos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/',
  [
    body('nom').notEmpty().trim(),
    body('code').notEmpty().trim(),
    body('niveau').isIn(['1ere', '2eme', '3eme', '4eme', '5eme']),
    body('type').notEmpty(),
    body('semestre').isIn(['S1', 'S2', 'S1-S2']),
    body('specialite').optional().isString(),
    body('matieres').optional().isArray(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { nom, code, niveau, type, semestre, specialite, matieres = [] } = req.body as {
      nom: string; code: string; niveau: string; type: string
      semestre: string; specialite?: string; matieres?: string[]
    }
    const etablissementType = req.user!.etablissementType

    try {
      const existing = await prisma.promo.findFirst({ where: { code, etablissementType } })
      if (existing) {
        res.status(409).json({ error: `Une promotion avec le code "${code}" existe dÃ©jÃ ` })
        return
      }

      const promo = await prisma.promo.create({
        data: {
          nom, code, niveau, type, semestre,
          specialite: specialite ?? null,
          etablissementType,
          promoMatieres: JSON.stringify(matieres),
        },
      })

      res.status(201).json(shapePromo({ ...promo, matierePromos: [] }))
    } catch (err) {
      console.error('[Promos] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ PUT /api/promos/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put(
  '/:id',
  [
    body('nom').optional().notEmpty().trim(),
    body('code').optional().notEmpty().trim(),
    body('niveau').optional().isIn(['1ere', '2eme', '3eme', '4eme', '5eme']),
    body('type').optional().notEmpty(),
    body('semestre').optional().isIn(['S1', 'S2', 'S1-S2']),
    body('specialite').optional(),
    body('matieres').optional().isArray(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const id = parseInt(String(req.params.id))
    const etablissementType = req.user!.etablissementType

    try {
      const promo = await prisma.promo.findFirst({ where: { id, etablissementType } })
      if (!promo) {
        res.status(404).json({ error: 'Promotion introuvable' })
        return
      }

      const { nom, code, niveau, type, semestre, specialite, matieres } = req.body as Partial<{
        nom: string; code: string; niveau: string; type: string
        semestre: string; specialite: string; matieres: string[]
      }>

      const updated = await prisma.promo.update({
        where: { id },
        data: {
          ...(nom ? { nom } : {}),
          ...(code ? { code } : {}),
          ...(niveau ? { niveau } : {}),
          ...(type ? { type } : {}),
          ...(semestre ? { semestre } : {}),
          ...(specialite !== undefined ? { specialite } : {}),
          ...(matieres ? { promoMatieres: JSON.stringify(matieres) } : {}),
        },
        include: { matierePromos: { include: { matiere: true } } },
      })

      res.json(shapePromo(updated))
    } catch (err) {
      console.error('[Promos] PUT error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ DELETE /api/promos/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const promo = await prisma.promo.findFirst({ where: { id, etablissementType } })
    if (!promo) {
      res.status(404).json({ error: 'Promotion introuvable' })
      return
    }
    await prisma.promo.delete({ where: { id } })
    res.json({ message: 'Promotion supprimÃ©e' })
  } catch (err) {
    console.error('[Promos] DELETE error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

