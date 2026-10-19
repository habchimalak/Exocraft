import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { deleteFile, UPLOAD_DIR_PATH } from '../utils/upload.js'
import path from 'path'

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    const p = user.profile
    return {
      nom: user.nom, prenom: user.prenom, email: user.email,
      telephone: p?.telephone ?? '', poste: p?.poste ?? '',
      departement: p?.departement ?? '', etablissement: p?.etablissement ?? '',
      bio: p?.bio ?? '',
      avatar: p?.avatarPath ? `/uploads/avatars/${p.avatarPath}` : null,
    }
  }

  async update(userId: number, data: Partial<{ nom: string; prenom: string; email: string; telephone: string; poste: string; departement: string; etablissement: string; bio: string }>) {
    await this.prisma.$transaction(async (tx) => {
      if (data.nom || data.prenom || data.email) {
        await tx.user.update({ where: { id: userId }, data: { ...(data.nom ? { nom: data.nom } : {}), ...(data.prenom ? { prenom: data.prenom } : {}), ...(data.email ? { email: data.email } : {}) } })
      }
      const profileData: Record<string, string> = {}
      for (const [k, v] of Object.entries(data)) {
        if (['telephone','poste','departement','etablissement','bio'].includes(k) && v !== undefined) profileData[k] = String(v)
      }
      if (Object.keys(profileData).length > 0) {
        await tx.adminProfile.upsert({ where: { userId }, update: profileData, create: { userId, ...profileData } })
      }
    })
    return this.get(userId)
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const existing = await this.prisma.adminProfile.findUnique({ where: { userId } })
    if (existing?.avatarPath) deleteFile(path.join(UPLOAD_DIR_PATH, 'avatars', existing.avatarPath))
    await this.prisma.adminProfile.upsert({ where: { userId }, update: { avatarPath: file.filename }, create: { userId, avatarPath: file.filename } })
    return { avatar: `/uploads/avatars/${file.filename}` }
  }
}
