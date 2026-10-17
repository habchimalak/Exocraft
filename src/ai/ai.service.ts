import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import type { GenerateContentDto } from './dto/generate-content.dto.js'
import type { SaveGeneratedDto } from './dto/save-generated.dto.js'
import type { ChatDto } from './dto/chat.dto.js'
import type { GeneratedContent } from './entities/generated-content.entity.js'
import { ContentService } from '../content/content.service.js'
import { QuizService } from '../quiz/quiz.service.js'

@Injectable()
export class AiService {
  private readonly client: OpenAI
  private readonly model: string
  private contents: GeneratedContent[] = []
  private nextId = 1

  constructor(
    private readonly configService: ConfigService,
    private readonly contentService: ContentService,
    private readonly quizService: QuizService,
  ) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENROUTER_API_KEY') ?? 'no-key',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: { 'HTTP-Referer': 'http://localhost:3001', 'X-Title': 'ExoCraft' },
    })
    this.model = this.configService.get<string>('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct')
  }

  async generate(dto: GenerateContentDto): Promise<{ contenu: string }> {
    const prompt = this.buildPrompt(dto)
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: this.getSystemPrompt(dto.type) },
          { role: 'user', content: prompt },
        ],
      })
      const contenu = response.choices[0]?.message?.content ?? ''
      return { contenu }
    } catch (err) {
      throw new InternalServerErrorException(`Erreur IA: ${(err as Error).message}`)
    }
  }

  async generateFromArchive(archiveId: number, dto: GenerateContentDto): Promise<{ contenu: string }> {
    // Si pas d'archive service, génère normalement
    return this.generate(dto)
  }

  async chat(dto: ChatDto): Promise<{ response: string }> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Tu es ExoCraft, un assistant pédagogique expert.' },
      ...(dto.historique?.map(m => ({ role: m.role as any, content: m.content })) ?? []),
      { role: 'user', content: dto.message },
    ]
    try {
      const response = await this.client.chat.completions.create({ model: this.model, max_tokens: 800, messages })
      return { response: response.choices[0]?.message?.content ?? '' }
    } catch (err) {
      throw new InternalServerErrorException(`Erreur chat: ${(err as Error).message}`)
    }
  }

  save(dto: SaveGeneratedDto, auteurId?: number): any {
    const uid = auteurId ?? 0
    if (['quiz', 'serie', 'examen'].includes(dto.type)) {
      const quiz = this.quizService.create({ titre: dto.titre, theme: dto.theme, matiere: dto.matiere } as any)
      quiz.contenuIA = dto.contenu
      quiz.auteurId = uid
      return quiz
    }
    return this.contentService.create({ ...dto, auteurId: uid } as any)
  }

  findAll(): GeneratedContent[] { return this.contents }
  findOne(id: number): GeneratedContent {
    const c = this.contents.find(c => c.id === id)
    if (!c) throw new Error(`Contenu généré ${id} introuvable`)
    return c
  }
  valider(id: number): GeneratedContent {
    const c = this.findOne(id)
    c.statut = 'valide'
    return c
  }
  updateContenu(id: number, contenu: string): GeneratedContent {
    const c = this.findOne(id)
    c.contenu = contenu
    return c
  }

  private buildPrompt(dto: GenerateContentDto): string {
    const base = `Matière: ${dto.matiere}\nThème: ${dto.theme}\nType: ${dto.type}`
    const opts = [
      dto.niveau ? `Niveau: ${dto.niveau}` : '',
      dto.nombreQuestions ? `Nombre de questions: ${dto.nombreQuestions}` : '',
      dto.duree ? `Durée: ${dto.duree}` : '',
      dto.bareme ? `Barème: ${dto.bareme}` : '',
      dto.courseFourni ? `\nContenu de cours:\n${dto.courseFourni}` : '',
    ].filter(Boolean).join('\n')
    return `${base}\n${opts}`
  }

  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      quiz: 'Tu es un expert pédagogique. Génère un quiz QCM structuré en JSON avec questions, choix A-D et réponses correctes.',
      cours: 'Tu es un expert pédagogique. Rédige un cours structuré avec introduction, développement et conclusion.',
      resume: 'Tu es un expert pédagogique. Fais un résumé clair et structuré.',
      serie: "Tu es un expert pédagogique. Génère une série d'exercices structurés.",
      examen: 'Tu es un expert pédagogique. Génère un examen structuré avec exercices et questions.',
    }
    return prompts[type] ?? 'Tu es un assistant pédagogique expert.'
  }
}
