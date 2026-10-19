import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { formatFileSize, deleteFile, UPLOAD_DIR_PATH } from '../utils/upload.js'
import path from 'path'

@Injectable()
export class MatiereService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string, promoId?: number, search?: string) {
    const matieres = await this.prisma.matiere.findMany({
      where: {
        etablissementType,
        ...(search ? { nom: { contains: search } } : {}),
        ...(promoId ? { matierePromos: { some: { promoId } } } : {}),
      },
      include: {
        matierePromos: { include: { promo: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        _count: { select: { userMatieres: true } },
      },
      orderBy: { nom: 'asc' },
    })
    return matieres.map((m) => ({
      id: m.id, nom: m.nom,
      enseignantsCount: m._count.userMatieres,
      promoIds: m.matierePromos.map((mp) => mp.promoId),
      documents: m.documents.map((d) => ({
        id: d.id, titre: d.titre, type: d.type, format: d.format,
        fileName: d.fileName, size: d.size,
        uploadedAt: d.uploadedAt.toISOString(), promo: d.promo,
      })),
    }))
  }

  async create(etablissementType: string, nom: string, promoIds: number[] = []) {
    return this.prisma.matiere.create({
      data: { nom, etablissementType, matierePromos: { create: promoIds.map((pid) => ({ promoId: pid })) } },
      include: { matierePromos: true, _count: { select: { userMatieres: true } } },
    })
  }

  async update(id: number, etablissementType: string, data: { nom?: string; promoIds?: number[] }) {
    const existing = await this.prisma.matiere.findFirst({ where: { id, etablissementType } })
    if (!existing) throw new NotFoundException('Matière introuvable')
    await this.prisma.$transaction(async (tx) => {
      if (data.nom) await tx.matiere.update({ where: { id }, data: { nom: data.nom } })
      if (data.promoIds !== undefined) {
        await tx.matierePromo.deleteMany({ where: { matiereId: id } })
        if (data.promoIds.length > 0) {
          await tx.matierePromo.createMany({ data: data.promoIds.map((pid) => ({ matiereId: id, promoId: pid })) })
        }
      }
    })
    return this.prisma.matiere.findFirst({
      where: { id, etablissementType },
      include: { matierePromos: { include: { promo: true } }, documents: true, _count: { select: { userMatieres: true } } },
    })
  }

  async delete(id: number, etablissementType: string) {
    const matiere = await this.prisma.matiere.findFirst({ where: { id, etablissementType }, include: { documents: true } })
    if (!matiere) throw new NotFoundException('Matière introuvable')
    for (const doc of matiere.documents) {
      deleteFile(path.join(UPLOAD_DIR_PATH, 'documents', doc.filePath))
    }
    await this.prisma.matiere.delete({ where: { id } })
    return { message: 'Matière supprimée' }
  }

  async uploadDocument(matiereId: number, etablissementType: string, file: Express.Multer.File, meta: { titre: string; type: string; format: string; promo: string }) {
    const matiere = await this.prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
    if (!matiere) { deleteFile(file.path); throw new NotFoundException('Matière introuvable') }
    if (!meta.titre || !meta.type || !meta.format || !meta.promo) {
      deleteFile(file.path); throw new BadRequestException('Champs manquants')
    }
    const doc = await this.prisma.document.create({
      data: { matiereId, titre: meta.titre, type: meta.type, format: meta.format, fileName: file.originalname, filePath: file.filename, size: formatFileSize(file.size), promo: meta.promo },
    })
    return { id: doc.id, titre: doc.titre, type: doc.type, format: doc.format, fileName: doc.fileName, size: doc.size, uploadedAt: doc.uploadedAt.toISOString(), promo: doc.promo }
  }

  async deleteDocument(matiereId: number, docId: number, etablissementType: string) {
    const matiere = await this.prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
    if (!matiere) throw new NotFoundException('Matière introuvable')
    const doc = await this.prisma.document.findFirst({ where: { id: docId, matiereId } })
    if (!doc) throw new NotFoundException('Document introuvable')
    deleteFile(path.join(UPLOAD_DIR_PATH, 'documents', doc.filePath))
    await this.prisma.document.delete({ where: { id: docId } })
    return { message: 'Document supprimé' }
  }

  async getDownloadPath(matiereId: number, docId: number, etablissementType: string) {
    const matiere = await this.prisma.matiere.findFirst({ where: { id: matiereId, etablissementType } })
    if (!matiere) throw new NotFoundException('Matière introuvable')
    const doc = await this.prisma.document.findFirst({ where: { id: docId, matiereId } })
    if (!doc) throw new NotFoundException('Document introuvable')
    return { filePath: path.join(UPLOAD_DIR_PATH, 'documents', doc.filePath), fileName: doc.fileName }
  }
}
