import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { formatFileSize, deleteFile, UPLOAD_DIR_PATH } from '../utils/upload.js'
import path from 'path'

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string, type?: string, matiere?: string, search?: string) {
    const archives = await this.prisma.archive.findMany({
      where: {
        etablissementType,
        ...(type ? { type } : {}),
        ...(matiere ? { matiere: { contains: matiere } } : {}),
        ...(search ? { OR: [{ titre: { contains: search } }, { matiere: { contains: search } }, { promo: { contains: search } }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return archives.map((a) => ({
      id: a.id, titre: a.titre, type: a.type, format: a.format, fichier: a.fileName,
      size: a.size, matiere: a.matiere, promo: a.promo, uploadedBy: a.uploadedBy,
      created_at: a.createdAt.toISOString(),
    }))
  }

  async create(etablissementType: string, uploadedById: number, uploadedBy: string, file: Express.Multer.File, meta: { titre: string; type: string; format: string; matiere: string; promo: string }) {
    if (!['cours', 'examen'].includes(meta.type)) { deleteFile(file.path); throw new BadRequestException('Type invalide') }
    const archive = await this.prisma.archive.create({
      data: { titre: meta.titre, type: meta.type, format: meta.format, fileName: file.originalname, filePath: file.filename, size: formatFileSize(file.size), matiere: meta.matiere, promo: meta.promo, uploadedBy, uploadedById, etablissementType },
    })
    return { id: archive.id, titre: archive.titre, type: archive.type, format: archive.format, fichier: archive.fileName, size: archive.size, matiere: archive.matiere, promo: archive.promo, uploadedBy: archive.uploadedBy, created_at: archive.createdAt.toISOString() }
  }

  async delete(id: number, etablissementType: string) {
    const archive = await this.prisma.archive.findFirst({ where: { id, etablissementType } })
    if (!archive) throw new NotFoundException('Archive introuvable')
    deleteFile(path.join(UPLOAD_DIR_PATH, 'archives', archive.filePath))
    await this.prisma.archive.delete({ where: { id } })
    return { message: 'Archive supprimée' }
  }

  async getDownloadPath(id: number, etablissementType: string) {
    const archive = await this.prisma.archive.findFirst({ where: { id, etablissementType } })
    if (!archive) throw new NotFoundException('Archive introuvable')
    return { filePath: path.join(UPLOAD_DIR_PATH, 'archives', archive.filePath), fileName: archive.fileName }
  }
}
