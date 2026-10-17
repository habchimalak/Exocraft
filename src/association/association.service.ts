import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class AssociationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string) {
    const users = await this.prisma.user.findMany({
      where: { etablissementType, role: 'enseignant' },
      include: { matiereAssoc: { include: { matiere: true } }, promoAssoc: { include: { promo: true } } },
      orderBy: { nom: 'asc' },
    })
    return users.map(({ password: _pw, ...u }) => ({
      id: u.id, nom: u.nom, prenom: u.prenom, email: u.email,
      matieres: u.matiereAssoc.map((a) => a.matiere.nom),
      promos: u.promoAssoc.map((a) => a.promo.nom),
    }))
  }

  async save(userId: number, etablissementType: string, matiereNoms: string[], promoNoms: string[]) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, etablissementType } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    const matieres = await this.prisma.matiere.findMany({ where: { etablissementType, nom: { in: matiereNoms } } })
    const promos = await this.prisma.promo.findMany({ where: { etablissementType, nom: { in: promoNoms } } })

    await this.prisma.$transaction([
      this.prisma.userMatiere.deleteMany({ where: { userId } }),
      this.prisma.userPromo.deleteMany({ where: { userId } }),
      ...(matieres.length > 0 ? [this.prisma.userMatiere.createMany({ data: matieres.map((m) => ({ userId, matiereId: m.id })) })] : []),
      ...(promos.length > 0 ? [this.prisma.userPromo.createMany({ data: promos.map((p) => ({ userId, promoId: p.id })) })] : []),
    ])

    return { userId, matieres: matieres.map((m) => m.nom), promos: promos.map((p) => p.nom) }
  }
}
