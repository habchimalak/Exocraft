import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import type { CreateContentDto } from './dto/create-content.dto.js'
import type { UpdateContentDto } from './dto/update-content.dto.js'
import type { FilterContentDto } from './dto/filter-content.dto.js'
import type { Content } from './entities/content.entity.js'

@Injectable()
export class ContentService {
  private contents: Content[] = []
  private nextId = 1

  create(dto: Omit<CreateContentDto, 'auteurId'> & { auteurId: number }): Content {
    const c: Content = {
      id: this.nextId++,
      titre: dto.titre,
      type: dto.type,
      matiere: dto.matiere,
      theme: dto.theme,
      contenu: dto.contenu,
      statut: 'brouillon',
      visibilite: (dto as any).visibilite ?? 'prive',
      auteurId: dto.auteurId,
      dateCreation: new Date(),
      dateModification: new Date(),
      archived: false,
    }
    this.contents.push(c)
    return c
  }

  findAll(filters: FilterContentDto) {
    let result = this.contents.filter(c => !c.archived)
    if (filters.type)       result = result.filter(c => c.type === filters.type)
    if (filters.matiere)    result = result.filter(c => c.matiere.toLowerCase().includes(filters.matiere!.toLowerCase()))
    if (filters.statut)     result = result.filter(c => c.statut === filters.statut)
    if (filters.visibilite) result = result.filter(c => c.visibilite === filters.visibilite)
    const total = result.length
    const page  = filters.page  ?? 1
    const limit = filters.limit ?? 10
    return { data: result.slice((page - 1) * limit, (page - 1) * limit + limit), total, page, limit }
  }

  findPublic(filters: FilterContentDto) {
    return this.findAll({ ...filters, visibilite: 'public' as any, statut: 'valide' as any })
  }

  findByAuteur(auteurId: number, filters: FilterContentDto) {
    return this.findAll({ ...filters, auteurId } as any)
  }

  findOne(id: number): Content {
    const c = this.contents.find(c => c.id === id)
    if (!c) throw new NotFoundException(`Contenu ${id} introuvable`)
    return c
  }

  update(id: number, auteurId: number, dto: UpdateContentDto): Content {
    const c = this.findOne(id)
    if (c.auteurId !== auteurId) throw new ForbiddenException('Accès refusé')
    Object.assign(c, dto, { dateModification: new Date() })
    return c
  }

  remove(id: number, auteurId: number): Content {
    const c = this.findOne(id)
    if (c.auteurId !== auteurId) throw new ForbiddenException('Accès refusé')
    this.contents = this.contents.filter(x => x.id !== id)
    return c
  }

  valider(id: number, _auteurId: number): Content {
    const c = this.findOne(id)
    c.statut = 'valide'
    return c
  }

  toggleVisibilite(id: number, _auteurId: number): Content {
    const c = this.findOne(id)
    c.visibilite = c.visibilite === 'prive' ? 'public' : 'prive'
    return c
  }

  dupliquer(id: number, auteurId: number): Content {
    const original = this.findOne(id)
    return this.create({ titre: `${original.titre} (copie)`, type: original.type, matiere: original.matiere, theme: original.theme, contenu: original.contenu, auteurId } as any)
  }

  findArchived(auteurId: number, filters: FilterContentDto) {
    let result = this.contents.filter(c => c.archived && c.auteurId === auteurId)
    if (filters.type) result = result.filter(c => c.type === filters.type)
    const total = result.length
    const page  = filters.page  ?? 1
    const limit = filters.limit ?? 10
    return { data: result.slice((page - 1) * limit, (page - 1) * limit + limit), total, page, limit }
  }

  archiver(id: number, auteurId: number): Content {
    const c = this.findOne(id)
    if (c.auteurId !== auteurId) throw new ForbiddenException('Accès refusé')
    c.archived = true
    c.archivedAt = new Date()
    return c
  }

  desarchiver(id: number, auteurId: number): Content {
    const c = this.contents.find(c => c.id === id)
    if (!c) throw new NotFoundException(`Contenu ${id} introuvable`)
    if (c.auteurId !== auteurId) throw new ForbiddenException('Accès refusé')
    c.archived = false
    c.archivedAt = undefined
    return c
  }
}
