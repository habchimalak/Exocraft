import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string) {
    const promos = await this.prisma.promo.findMany({
      where: { etablissementType },
      include: { matierePromos: { include: { matiere: true } } },
      orderBy: { id: 'asc' },
    })
    return promos.map((p) => ({
      id: p.id, nom: p.nom, code: p.code, niveau: p.niveau, type: p.type,
      specialite: p.specialite, semestre: p.semestre, etablissementType: p.etablissementType,
      matieres: p.matierePromos.map((mp) => mp.matiere.nom),
    }))
  }

  async create(etablissementType: string, data: { nom: string; code: string; niveau: string; type: string; semestre: string; specialite?: string | null; matieres?: string[] }) {
    const existing = await this.prisma.promo.findFirst({ where: { code: data.code, etablissementType } })
    if (existing) throw new BadRequestException(`Une promotion avec le code "${data.code}" existe déjà`)
    return this.prisma.promo.create({
      data: { nom: data.nom, code: data.code, niveau: data.niveau, type: data.type, semestre: data.semestre, specialite: data.specialite ?? null, etablissementType, promoMatieres: JSON.stringify(data.matieres ?? []) },
    })
  }

  async update(id: number, etablissementType: string, data: Partial<{ nom: string; code: string; niveau: string; type: string; semestre: string; specialite: string | null; matieres: string[] }>) {
    const promo = await this.prisma.promo.findFirst({ where: { id, etablissementType } })
    if (!promo) throw new NotFoundException('Promotion introuvable')
    return this.prisma.promo.update({
      where: { id },
      data: {
        ...(data.nom ? { nom: data.nom } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.niveau ? { niveau: data.niveau } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.semestre ? { semestre: data.semestre } : {}),
        ...(data.specialite !== undefined ? { specialite: data.specialite } : {}),
        ...(data.matieres ? { promoMatieres: JSON.stringify(data.matieres) } : {}),
      },
      include: { matierePromos: { include: { matiere: true } } },
    })
  }

  async delete(id: number, etablissementType: string) {
    const promo = await this.prisma.promo.findFirst({ where: { id, etablissementType } })
    if (!promo) throw new NotFoundException('Promotion introuvable')
    await this.prisma.promo.delete({ where: { id } })
    return { message: 'Promotion supprimée' }
  }
}
