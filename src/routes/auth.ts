import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'
import { validatePasswordStrength } from '../utils/password'

const router = Router()

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
    body('etablissementType')
      .isIn(['licence', 'cycle_ing'])
      .withMessage('Type d\'établissement invalide'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, password, etablissementType } = req.body as {
      email: string
      password: string
      etablissementType: string
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        return
      }

      if (user.etablissementType !== etablissementType) {
        res.status(401).json({ error: 'Cet utilisateur n\'appartient pas à cet établissement' })
        return
      }

      if (user.role !== 'admin') {
        res.status(403).json({ error: 'Accès refusé — seuls les administrateurs peuvent se connecter au panneau admin' })
        return
      }

      if (user.status === 'inactif') {
        res.status(403).json({ error: 'Compte désactivé. Contactez un autre administrateur.' })
        return
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        return
      }

      const secret = process.env.JWT_SECRET ?? 'fallback_secret'
      const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          etablissementType: user.etablissementType,
        },
        secret,
        { expiresIn } as jwt.SignOptions,
      )

      // Return user without password
      const { password: _pw, ...userSafe } = user
      res.json({ token, user: userSafe })
    } catch (err) {
      console.error('[Auth] Login error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    })
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }
    const { password: _pw, ...userSafe } = user
    res.json(userSafe)
  } catch (err) {
    console.error('[Auth] Me error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Stateless JWT — logout is handled client-side by discarding the token.
// This endpoint exists as a convenience for clearing server-side logs.
router.post('/logout', authenticate, (_req: Request, res: Response) => {
  res.json({ message: 'Déconnexion réussie' })
})

// ── PATCH /api/auth/password ──────────────────────────────────────────────────
router.patch(
  '/password',
  authenticate,
  requireAdmin,
  [
    body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
    body('newPassword').notEmpty().withMessage('Nouveau mot de passe requis'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword: string
      newPassword: string
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(newPassword)
    if (!strengthCheck.valid) {
      res.status(400).json({ error: 'Mot de passe trop faible', details: strengthCheck.errors })
      return
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
      if (!user) {
        res.status(404).json({ error: 'Utilisateur introuvable' })
        return
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
        res.status(401).json({ error: 'Mot de passe actuel incorrect' })
        return
      }

      const hashedNew = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNew },
      })

      res.json({ message: 'Mot de passe mis à jour avec succès' })
    } catch (err) {
      console.error('[Auth] Password change error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

export default router
