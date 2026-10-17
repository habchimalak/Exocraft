import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class GenerationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string, page = 1, limit = 20) {
    const [total, generations] = await Promise.all([
      this.prisma.aIGeneration.count({ where: { etablissementType } }),
      this.prisma.aIGeneration.findMany({
        where: { etablissementType },
        include: { enseignant: { select: { nom: true, prenom: true } } },
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return {
      total, page, limit,
      data: generations.map((g) => ({
        id: g.id, type: g.type, sujet: g.sujet,
        enseignant: `${g.enseignant.prenom} ${g.enseignant.nom}`,
        enseignantId: g.enseignantId, status: g.status,
        generatedAt: g.generatedAt.toISOString(),
      })),
    }
  }

  async getStats(etablissementType: string) {
    const types = ['Quiz', 'Examen', 'Cours', 'Exercices', 'Résumé']
    const colorMap: Record<string, string> = { Quiz: '#5b4fcf', Examen: '#e17055', Cours: '#00b894', Exercices: '#f39c12', 'Résumé': '#4a90e2' }
    const counts = await Promise.all(types.map((type) => this.prisma.aIGeneration.count({ where: { etablissementType, type } })))
    const contentsByType = types.map((type, i) => ({ type, count: counts[i], color: colorMap[type] }))
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthGenerations = await this.prisma.aIGeneration.count({ where: { etablissementType, generatedAt: { gte: startOfMonth } } })
    return { contentsByType, thisMonthGenerations }
  }

  async create(userId: number, etablissementType: string, type: string, sujet: string, status = 'success') {
    const gen = await this.prisma.aIGeneration.create({
      data: { type, sujet, status, enseignantId: userId, etablissementType },
      include: { enseignant: { select: { nom: true, prenom: true } } },
    })
    await this.prisma.user.update({ where: { id: userId }, data: { contentsCount: { increment: 1 } } })
    return {
      id: gen.id, type: gen.type, sujet: gen.sujet,
      enseignant: `${gen.enseignant.prenom} ${gen.enseignant.nom}`,
      enseignantId: gen.enseignantId, status: gen.status,
      generatedAt: gen.generatedAt.toISOString(),
    }
  }
}
