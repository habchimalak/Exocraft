import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { body, query, validationResult } from 'express-validator'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

// All user routes require authentication + admin role
router.use(authenticate, requireAdmin)

// â”€â”€ GET /api/users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get(
  '/',
  [
    query('role').optional().isIn(['admin', 'enseignant']),
    query('status').optional().isIn(['actif', 'inactif']),
    query('search').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const { role, status, search } = req.query as Record<string, string>
    const etablissementType = req.user!.etablissementType

    try {
      const users = await prisma.user.findMany({
        where: {
          etablissementType,
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
          ...(search
            ? {
                OR: [
                  { nom: { contains: search } },
                  { prenom: { contains: search } },
                  { email: { contains: search } },
                ],
              }
            : {}),
        },
        include: {
          matiereAssoc: { include: { matiere: true } },
          promoAssoc: { include: { promo: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Shape response to match frontend User interface
      const shaped = users.map(({ password: _pw, ...u }) => ({
        ...u,
        matieres: u.matiereAssoc.map((a) => a.matiere.nom),
        promos: u.promoAssoc.map((a) => a.promo.nom),
        created_at: u.createdAt.toISOString(),
      }))

      res.json(shaped)
    } catch (err) {
      console.error('[Users] GET error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ POST /api/users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post(
  '/',
  [
    body('nom').notEmpty().trim(),
    body('prenom').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['admin', 'enseignant']),
    body('status').isIn(['actif', 'inactif']),
    body('password').optional().isLength({ min: 6 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { nom, prenom, email, role, status, password } = req.body as {
      nom: string; prenom: string; email: string
      role: string; status: string; password?: string
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        res.status(409).json({ error: 'Un utilisateur avec cet email existe dÃ©jÃ ' })
        return
      }

      const hashedPw = await bcrypt.hash(password ?? 'Exocraft@2024', 12)
      const user = await prisma.user.create({
        data: {
          nom,
          prenom,
          email,
          password: hashedPw,
          role,
          status,
          etablissementType: req.user!.etablissementType,
          profile: { create: {} }, // empty profile
        },
        include: {
          matiereAssoc: { include: { matiere: true } },
          promoAssoc: { include: { promo: true } },
        },
      })

      const { password: _pw, ...userSafe } = user
      res.status(201).json({
        ...userSafe,
        matieres: [],
        promos: [],
        created_at: user.createdAt.toISOString(),
      })
    } catch (err) {
      console.error('[Users] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ PUT /api/users/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put(
  '/:id',
  [
    body('nom').optional().notEmpty().trim(),
    body('prenom').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'enseignant']),
    body('status').optional().isIn(['actif', 'inactif']),
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
      const existing = await prisma.user.findFirst({ where: { id, etablissementType } })
      if (!existing) {
        res.status(404).json({ error: 'Utilisateur introuvable' })
        return
      }

      const { nom, prenom, email, role, status } = req.body as Partial<{
        nom: string; prenom: string; email: string; role: string; status: string
      }>

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(nom ? { nom } : {}),
          ...(prenom ? { prenom } : {}),
          ...(email ? { email } : {}),
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
        },
        include: {
          matiereAssoc: { include: { matiere: true } },
          promoAssoc: { include: { promo: true } },
        },
      })

      const { password: _pw, ...userSafe } = updated
      res.json({
        ...userSafe,
        matieres: updated.matiereAssoc.map((a) => a.matiere.nom),
        promos: updated.promoAssoc.map((a) => a.promo.nom),
        created_at: updated.createdAt.toISOString(),
      })
    } catch (err) {
      console.error('[Users] PUT error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// â”€â”€ DELETE /api/users/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const user = await prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }

    // Prevent deleting own account
    if (id === req.user!.userId) {
      res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
      return
    }

    // Prevent deleting last admin
    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { etablissementType, role: 'admin' },
      })
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' })
        return
      }
    }

    await prisma.user.delete({ where: { id } })
    res.json({ message: 'Utilisateur supprimÃ©' })
  } catch (err) {
    console.error('[Users] DELETE error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ PATCH /api/users/:id/status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const user = await prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }

    const newStatus = user.status === 'actif' ? 'inactif' : 'actif'
    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    })

    res.json({ id, status: updated.status })
  } catch (err) {
    console.error('[Users] PATCH status error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// â”€â”€ PATCH /api/users/:id/promote â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.patch('/:id/promote', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const etablissementType = req.user!.etablissementType

  try {
    const user = await prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }

    if (user.role === 'admin') {
      res.status(400).json({ error: 'Cet utilisateur est dÃ©jÃ  administrateur' })
      return
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: 'admin' },
    })

    res.json({ id, role: updated.role })
  } catch (err) {
    console.error('[Users] PATCH promote error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router

