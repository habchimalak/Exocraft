import { Router, Request, Response } from 'express'
import prisma from '../prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()
router.use(authenticate, requireAdmin)

// ── GET /api/stats ────────────────────────────────────────────────────────────
// Dashboard statistics for the current établissement
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const etablissementType = req.user!.etablissementType

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      totalEnseignants,
      activeEnseignants,
      totalMatieres,
      totalDocs,
      totalArchives,
      totalGenerations,
      thisMonthGenerations,
      contentsByTypeRaw,
      recentGenerations,
    ] = await Promise.all([
      prisma.user.count({ where: { etablissementType } }),

      prisma.user.count({ where: { etablissementType, role: 'enseignant' } }),

      prisma.user.count({
        where: { etablissementType, role: 'enseignant', status: 'actif' },
      }),

      prisma.matiere.count({ where: { etablissementType } }),

      prisma.document.count({
        where: { matiere: { etablissementType } },
      }),

      prisma.archive.count({ where: { etablissementType } }),

      prisma.aIGeneration.count({ where: { etablissementType } }),

      prisma.aIGeneration.count({
        where: { etablissementType, generatedAt: { gte: startOfMonth } },
      }),

      // Group by type for chart
      prisma.aIGeneration.groupBy({
        by: ['type'],
        where: { etablissementType },
        _count: { type: true },
      }),

      // Recent AI generations for activity feed
      prisma.aIGeneration.findMany({
        where: { etablissementType },
        include: { enseignant: { select: { nom: true, prenom: true } } },
        orderBy: { generatedAt: 'desc' },
        take: 10,
      }),
    ])

    const colorMap: Record<string, string> = {
      'Quiz':      '#5b4fcf',
      'Examen':    '#e17055',
      'Cours':     '#00b894',
      'Exercices': '#f39c12',
      'Résumé':    '#4a90e2',
    }

    const allTypes = ['Quiz', 'Examen', 'Cours', 'Exercices', 'Résumé']
    const countMap = Object.fromEntries(
      contentsByTypeRaw.map((r) => [r.type, r._count.type]),
    )
    const contentsByType = allTypes.map((type) => ({
      type,
      count: countMap[type] ?? 0,
      color: colorMap[type],
    }))

    const recentActivity = recentGenerations.map((g) => ({
      id: g.id,
      type: g.type,
      sujet: g.sujet,
      enseignant: `${g.enseignant.prenom} ${g.enseignant.nom}`,
      enseignantId: g.enseignantId,
      status: g.status,
      generatedAt: g.generatedAt.toISOString(),
    }))

    res.json({
      totalUsers,
      totalEnseignants,
      activeEnseignants,
      totalMatieres,
      totalDocs,
      totalArchives,
      totalGenerations,
      thisMonthGenerations,
      contentsByType,
      recentActivity,
    })
  } catch (err) {
    console.error('[Stats] GET error:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
