import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(etablissementType: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers, totalEnseignants, activeEnseignants, totalMatieres, totalDocs,
      totalArchives, totalGenerations, thisMonthGenerations,
      contentsByTypeRaw, recentGenerations,
    ] = await Promise.all([
      this.prisma.user.count({ where: { etablissementType } }),
      this.prisma.user.count({ where: { etablissementType, role: 'enseignant' } }),
      this.prisma.user.count({ where: { etablissementType, role: 'enseignant', status: 'actif' } }),
      this.prisma.matiere.count({ where: { etablissementType } }),
      this.prisma.document.count({ where: { matiere: { etablissementType } } }),
      this.prisma.archive.count({ where: { etablissementType } }),
      this.prisma.aIGeneration.count({ where: { etablissementType } }),
      this.prisma.aIGeneration.count({ where: { etablissementType, generatedAt: { gte: startOfMonth } } }),
      this.prisma.aIGeneration.groupBy({ by: ['type'], where: { etablissementType }, _count: { type: true } }),
      this.prisma.aIGeneration.findMany({ where: { etablissementType }, include: { enseignant: { select: { nom: true, prenom: true } } }, orderBy: { generatedAt: 'desc' }, take: 10 }),
    ])

    const colorMap: Record<string, string> = { Quiz: '#5b4fcf', Examen: '#e17055', Cours: '#00b894', Exercices: '#f39c12', 'Résumé': '#4a90e2' }
    const allTypes = ['Quiz', 'Examen', 'Cours', 'Exercices', 'Résumé']
    const countMap = Object.fromEntries(contentsByTypeRaw.map((r) => [r.type, r._count.type]))
    const contentsByType = allTypes.map((type) => ({ type, count: countMap[type] ?? 0, color: colorMap[type] }))
    const recentActivity = recentGenerations.map((g) => ({
      id: g.id, type: g.type, sujet: g.sujet,
      enseignant: `${g.enseignant.prenom} ${g.enseignant.nom}`,
      enseignantId: g.enseignantId, status: g.status,
      generatedAt: g.generatedAt.toISOString(),
    }))

    return {
      totalUsers, totalEnseignants, activeEnseignants, totalMatieres,
      totalDocs, totalArchives, totalGenerations, thisMonthGenerations,
      contentsByType, recentActivity,
    }
  }
}
