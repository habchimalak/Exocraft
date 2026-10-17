import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class NoteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(etablissementType: string) {
    const notes = await this.prisma.adminNote.findMany({
      where: { etablissementType },
      include: { author: { select: { id: true, nom: true, prenom: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return notes.map((n) => ({
      id: n.id, content: n.content, pinned: n.pinned, tag: n.tag,
      author: `${n.author.prenom} ${n.author.nom}`, authorId: n.author.id,
      createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString(),
    }))
  }

  async create(userId: number, etablissementType: string, content: string, tag = 'info') {
    const note = await this.prisma.adminNote.create({
      data: { content, tag, authorId: userId, etablissementType },
      include: { author: { select: { id: true, nom: true, prenom: true } } },
    })
    return {
      id: note.id, content: note.content, pinned: note.pinned, tag: note.tag,
      author: `${note.author.prenom} ${note.author.nom}`, authorId: note.author.id,
      createdAt: note.createdAt.toISOString(), updatedAt: note.updatedAt.toISOString(),
    }
  }

  async togglePin(id: number, etablissementType: string) {
    const note = await this.prisma.adminNote.findFirst({ where: { id, etablissementType } })
    if (!note) throw new NotFoundException('Note introuvable')
    const updated = await this.prisma.adminNote.update({ where: { id }, data: { pinned: !note.pinned }, include: { author: { select: { id: true, nom: true, prenom: true } } } })
    return {
      id: updated.id, content: updated.content, pinned: updated.pinned, tag: updated.tag,
      author: `${updated.author.prenom} ${updated.author.nom}`, authorId: updated.author.id,
      createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
    }
  }

  async delete(id: number, etablissementType: string) {
    const note = await this.prisma.adminNote.findFirst({ where: { id, etablissementType } })
    if (!note) throw new NotFoundException('Note introuvable')
    await this.prisma.adminNote.delete({ where: { id } })
    return { message: 'Note supprimée' }
  }
}
