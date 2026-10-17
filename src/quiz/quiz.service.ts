import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import type { CreateQuizDto } from './dto/create-quiz.dto.js'
import type { UpdateQuizDto } from './dto/update-quiz.dto.js'
import type { CreateQuestionDto } from './dto/create-question.dto.js'
import type { UpdateQuestionDto } from './dto/update-question.dto.js'
import type { ImportQuizDto } from './dto/import-quiz.dto.js'
import type { Quiz } from './entities/quiz.entity.js'

@Injectable()
export class QuizService {
  private quizzes: Quiz[] = []
  private nextQuizId = 1
  private nextQuestionId = 1

  create(dto: CreateQuizDto): Quiz {
    const newQuiz: Quiz = {
      id: this.nextQuizId++,
      titre: dto.titre,
      theme: dto.theme,
      matiere: dto.matiere,
      niveau: dto.niveau ?? 'intermediaire',
      statut: 'brouillon',
      visibilite: dto.visibilite ?? 'prive',
      dateGeneration: new Date(),
      questions: [],
      archived: false,
    }
    this.quizzes.push(newQuiz)
    return newQuiz
  }

  findAllPaginated(filters: { matiere?: string; statut?: 'brouillon' | 'valide'; niveau?: string; page?: number; limit?: number }) {
    let result = this.quizzes.filter(q => !q.archived)
    if (filters.matiere) result = result.filter(q => q.matiere.toLowerCase().includes(filters.matiere!.toLowerCase()))
    if (filters.statut)  result = result.filter(q => q.statut === filters.statut)
    if (filters.niveau)  result = result.filter(q => q.niveau === filters.niveau)
    const total = result.length
    const page  = filters.page  ?? 1
    const limit = filters.limit ?? 10
    return { data: result.slice((page - 1) * limit, (page - 1) * limit + limit), total, page, limit }
  }

  findOne(id: number): Quiz {
    const q = this.quizzes.find(q => q.id === id)
    if (!q) throw new NotFoundException(`Quiz ${id} introuvable`)
    return q
  }

  update(id: number, dto: UpdateQuizDto): Quiz {
    const q = this.findOne(id)
    Object.assign(q, dto)
    return q
  }

  remove(id: number): Quiz {
    const idx = this.quizzes.findIndex(q => q.id === id)
    if (idx === -1) throw new NotFoundException(`Quiz ${id} introuvable`)
    const [removed] = this.quizzes.splice(idx, 1)
    return removed
  }

  valider(id: number): Quiz {
    const q = this.findOne(id)
    if (q.questions.length === 0) throw new BadRequestException('Impossible de valider sans questions')
    q.statut = 'valide'
    return q
  }

  toggleVisibilite(id: number): Quiz {
    const q = this.findOne(id)
    q.visibilite = q.visibilite === 'prive' ? 'public' : 'prive'
    return q
  }

  archiver(id: number): Quiz {
    const q = this.findOne(id)
    q.archived = true
    q.archivedAt = new Date()
    return q
  }

  desarchiver(id: number): Quiz {
    const q = this.quizzes.find(q => q.id === id)
    if (!q) throw new NotFoundException(`Quiz ${id} introuvable`)
    q.archived = false
    q.archivedAt = undefined
    return q
  }

  findArchived(filters: { matiere?: string; page?: number; limit?: number }) {
    let result = this.quizzes.filter(q => q.archived)
    if (filters.matiere) result = result.filter(q => q.matiere.toLowerCase().includes(filters.matiere!.toLowerCase()))
    const total = result.length
    const page  = filters.page  ?? 1
    const limit = filters.limit ?? 10
    return { data: result.slice((page - 1) * limit, (page - 1) * limit + limit), total, page, limit }
  }

  addQuestion(quizId: number, dto: CreateQuestionDto): Quiz {
    const q = this.findOne(quizId)
    const newQ = { id: this.nextQuestionId++, ...dto }
    q.questions.push(newQ as any)
    return q
  }

  updateQuestion(quizId: number, questionId: number, dto: UpdateQuestionDto): Quiz {
    const q = this.findOne(quizId)
    const idx = q.questions.findIndex(qu => qu.id === questionId)
    if (idx === -1) throw new NotFoundException(`Question ${questionId} introuvable`)
    Object.assign(q.questions[idx], dto)
    return q
  }

  removeQuestion(quizId: number, questionId: number): Quiz {
    const q = this.findOne(quizId)
    q.questions = q.questions.filter(qu => qu.id !== questionId)
    return q
  }

  importFromAi(dto: ImportQuizDto): Quiz {
    const newQuiz = this.create({ titre: dto.titre, theme: dto.theme, matiere: dto.matiere, niveau: dto.niveau } as any)
    dto.questions.forEach(qu => this.addQuestion(newQuiz.id, qu))
    return this.findOne(newQuiz.id)
  }

  creerVariante(id: number): Quiz {
    const original = this.findOne(id)
    const variante: Quiz = {
      ...original,
      id: this.nextQuizId++,
      titre: `${original.titre} (variante)`,
      statut: 'brouillon',
      dateGeneration: new Date(),
      questions: original.questions.map(q => ({ ...q, id: this.nextQuestionId++ })),
    }
    this.quizzes.push(variante)
    return variante
  }
}
