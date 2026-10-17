import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

// ── GET /api/generations ──────────────────────────────────────────────────────
// Read-only for admin panel — paginated list
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const etablissementType = req.user!.etablissementType
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10))
  const limit = Math.min(100, parseInt((req.query.limit as string) ?? '20', 10))

  try {
    const [total, generations] = await Promise.all([
      prisma.aIGeneration.count({ where: { etablissementType } }),
      prisma.aIGeneration.findMany({
        where: { etablissementType },
        include: { enseignant: { select: { nom: true, prenom: true } } },
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      total,
      page,
      limit,
      data: generations.map((g) => ({
        id: g.id,
        type: g.type,
        sujet: g.sujet,
        enseignant: `${g.enseignant.prenom} ${g.enseignant.nom}`,
        enseignantId: g.enseignantId,
        status: g.status,
        generatedAt: g.generatedAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[Generations] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ── GET /api/generations/stats ────────────────────────────────────────────────
// Aggregated stats per type (used by Dashboard)
router.get('/stats', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const etablissementType = req.user!.etablissementType

  try {
    const types = ['Quiz', 'Examen', 'Cours', 'Exercices', 'Résumé']
    const colorMap: Record<string, string> = {
      'Quiz': '#5b4fcf',
      'Examen': '#e17055',
      'Cours': '#00b894',
      'Exercices': '#f39c12',
      'Résumé': '#4a90e2',
    }

    const counts = await Promise.all(
      types.map((type) =>
        prisma.aIGeneration.count({ where: { etablissementType, type } }),
      ),
    )

    const contentsByType = types.map((type, i) => ({
      type,
      count: counts[i],
      color: colorMap[type],
    }))

    // This month count
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthGenerations = await prisma.aIGeneration.count({
      where: {
        etablissementType,
        generatedAt: { gte: startOfMonth },
      },
    })

    res.json({ contentsByType, thisMonthGenerations })
  } catch (err) {
    console.error('[Generations] Stats error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ── POST /api/generations ─────────────────────────────────────────────────────
// Called by the teacher-facing app to record a new AI generation
// Does NOT require admin role — enseignants post here
router.post(
  '/',
  authenticate,
  [
    body('type').isIn(['Quiz', 'Examen', 'Cours', 'Exercices', 'Résumé']),
    body('sujet').notEmpty().trim(),
    body('status').optional().isIn(['success', 'pending']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { type, sujet, status = 'success' } = req.body as {
      type: string; sujet: string; status?: string
    }

    try {
      const gen = await prisma.aIGeneration.create({
        data: {
          type,
          sujet,
          status,
          enseignantId: req.user!.userId,
          etablissementType: req.user!.etablissementType,
        },
        include: { enseignant: { select: { nom: true, prenom: true } } },
      })

      // Increment the teacher's content count
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { contentsCount: { increment: 1 } },
      })

      res.status(201).json({
        id: gen.id,
        type: gen.type,
        sujet: gen.sujet,
        enseignant: `${gen.enseignant.prenom} ${gen.enseignant.nom}`,
        enseignantId: gen.enseignantId,
        status: gen.status,
        generatedAt: gen.generatedAt.toISOString(),
      })
    } catch (err) {
      console.error('[Generations] POST error:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// ── GET /api/generations/stream ───────────────────────────────────────────────
// Server-Sent Events for real-time generation feed
router.get('/stream', authenticate, requireAdmin, (req: Request, res: Response) => {
  const etablissementType = req.user!.etablissementType

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Send a heartbeat every 30 seconds to keep the connection alive
  const interval = setInterval(async () => {
    try {
      const latest = await prisma.aIGeneration.findFirst({
        where: { etablissementType },
        include: { enseignant: { select: { nom: true, prenom: true } } },
        orderBy: { generatedAt: 'desc' },
      })

      if (latest) {
        const data = JSON.stringify({
          id: latest.id,
          type: latest.type,
          sujet: latest.sujet,
          enseignant: `${latest.enseignant.prenom} ${latest.enseignant.nom}`,
          enseignantId: latest.enseignantId,
          status: latest.status,
          generatedAt: latest.generatedAt.toISOString(),
        })
        res.write(`data: ${data}\n\n`)
      } else {
        res.write(': heartbeat\n\n')
      }
    } catch {
      res.write(': heartbeat\n\n')
    }
  }, 30000)

  req.on('close', () => {
    clearInterval(interval)
    res.end()
  })
})

export default router
