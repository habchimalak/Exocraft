import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import path from 'path'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'
import { uploadAvatar, deleteFile } from '../utils/upload'

const router = Router()
router.use(authenticate, requireAdmin)

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? './uploads')

// Helper: shape profile response
function shapeProfile(user: {
  id: number; nom: string; prenom: string; email: string
  profile: {
    telephone: string; poste: string; departement: string
    etablissement: string; bio: string; avatarPath: string | null
  } | null
}) {
  const p = user.profile
  return {
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: p?.telephone ?? '',
    poste: p?.poste ?? '',
    departement: p?.departement ?? '',
    etablissement: p?.etablissement ?? '',
    bio: p?.bio ?? '',
    avatar: p?.avatarPath
      ? `/uploads/avatars/${p.avatarPath}`
      : null,
  }
}

// ── GET /api/profile ──────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    })
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }
    res.json(shapeProfile(user))
  } catch (err) {
    console.error('[Profile] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ── PUT /api/profile ──────────────────────────────────────────────────────────
router.put(
  '/',
  [
    body('nom').optional().notEmpty().trim(),
    body('prenom').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('telephone').optional().isString(),
    body('poste').optional().isString(),
    body('departement').optional().isString(),
    body('etablissement').optional().isString(),
    body('bio').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const {
      nom, prenom, email,
      telephone, poste, departement, etablissement, bio,
    } = req.body as Partial<{
      nom: string; prenom: string; email: string
      telephone: string; poste: string; departement: string
      etablissement: string; bio: string
    }>

    try {
      // Check email uniqueness if changed
      if (email) {
        const conflict = await prisma.user.findFirst({
          where: { email, NOT: { id: req.user!.userId } },
        })
        if (conflict) {
          res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte' })
          return
        }
      }

      await prisma.$transaction(async (tx) => {
        // Update user fields
        if (nom || prenom || email) {
          await tx.user.update({
            where: { id: req.user!.userId },
            data: {
              ...(nom ? { nom } : {}),
              ...(prenom ? { prenom } : {}),
              ...(email ? { email } : {}),
            },
          })
        }

        // Upsert profile fields
        const profileData: Record<string, string> = {}
        if (telephone !== undefined) profileData.telephone = telephone
        if (poste !== undefined) profileData.poste = poste
        if (departement !== undefined) profileData.departement = departement
        if (etablissement !== undefined) profileData.etablissement = etablissement
        if (bio !== undefined) profileData.bio = bio

        if (Object.keys(profileData).length > 0) {
          await tx.adminProfile.upsert({
            where: { userId: req.user!.userId },
            update: profileData,
            create: { userId: req.user!.userId, ...profileData },
          })
        }
      })

      const updated = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { profile: true },
      })

      res.json(shapeProfile(updated!))
    } catch (err) {
      console.error('[Profile] PUT error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// ── POST /api/profile/avatar ──────────────────────────────────────────────────
router.post(
  '/avatar',
  uploadAvatar.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'Aucune image fournie' })
      return
    }

    try {
      const existing = await prisma.adminProfile.findUnique({
        where: { userId: req.user!.userId },
      })

      // Delete old avatar if it exists
      if (existing?.avatarPath) {
        deleteFile(path.join(UPLOAD_DIR, 'avatars', existing.avatarPath))
      }

      await prisma.adminProfile.upsert({
        where: { userId: req.user!.userId },
        update: { avatarPath: req.file.filename },
        create: { userId: req.user!.userId, avatarPath: req.file.filename },
      })

      res.json({ avatar: `/uploads/avatars/${req.file.filename}` })
    } catch (err) {
      if (req.file) deleteFile(req.file.path)
      console.error('[Profile] Avatar error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

export default router
