import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string, role?: string, status?: string, search?: string) {
    return this.prisma.user.findMany({
      where: {
        etablissementType,
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(search ? { OR: [{ nom: { contains: search } }, { prenom: { contains: search } }, { email: { contains: search } }] } : {}),
      },
      include: { matiereAssoc: { include: { matiere: true } }, promoAssoc: { include: { promo: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { nom: string; prenom: string; email: string; role: string; status: string; etablissementType: string; password?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new BadRequestException('Un utilisateur avec cet email existe déjà')

    const hashedPw = await bcrypt.hash(data.password ?? 'Exocraft@2024', 10)
    return this.prisma.user.create({
      data: { ...data, password: hashedPw, profile: { create: {} } },
      include: { matiereAssoc: { include: { matiere: true } }, promoAssoc: { include: { promo: true } } },
    })
  }

  async update(id: number, etablissementType: string, data: Partial<{ nom: string; prenom: string; email: string; role: string; status: string }>) {
    const user = await this.prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    return this.prisma.user.update({ where: { id }, data, include: { matiereAssoc: { include: { matiere: true } }, promoAssoc: { include: { promo: true } } } })
  }

  async delete(id: number, etablissementType: string, currentUserId: number) {
    const user = await this.prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    if (id === currentUserId) throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte')
    if (user.role === 'admin') {
      const adminCount = await this.prisma.user.count({ where: { etablissementType, role: 'admin' } })
      if (adminCount <= 1) throw new BadRequestException('Impossible de supprimer le dernier administrateur')
    }
    await this.prisma.user.delete({ where: { id } })
    return { message: 'Utilisateur supprimé' }
  }

  async toggleStatus(id: number, etablissementType: string) {
    const user = await this.prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    const updated = await this.prisma.user.update({ where: { id }, data: { status: user.status === 'actif' ? 'inactif' : 'actif' } })
    return { id: updated.id, status: updated.status }
  }

  async promote(id: number, etablissementType: string) {
    const user = await this.prisma.user.findFirst({ where: { id, etablissementType } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    if (user.role === 'admin') throw new BadRequestException('Cet utilisateur est déjà administrateur')
    const updated = await this.prisma.user.update({ where: { id }, data: { role: 'admin' } })
    return { id: updated.id, role: updated.role }
  }
}
