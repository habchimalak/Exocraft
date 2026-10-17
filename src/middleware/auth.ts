import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../prisma/client'

export interface JwtPayload {
  userId: number
  email: string
  role: string
  etablissementType: string
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * Verifies JWT and attaches decoded payload to req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const secret = process.env.JWT_SECRET ?? 'fallback_secret'
    const payload = jwt.verify(token, secret) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide' })
  }
}

/**
 * Restricts access to admin role only
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Accès refusé — rôle admin requis' })
    return
  }
  next()
}

/**
 * Validates the user still exists and is active (used for sensitive operations)
 */
export async function validateActiveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Non authentifié' })
    return
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
  if (!user || user.status === 'inactif') {
    res.status(403).json({ error: 'Compte inactif ou supprimé' })
    return
  }
  next()
}
