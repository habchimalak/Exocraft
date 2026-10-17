import { Injectable, BadRequestException } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { ContentService } from '../content/content.service.js'
import { QuizService } from '../quiz/quiz.service.js'

export interface ExportDirectDto {
  titre: string
  matiere: string
  theme: string
  type: string
  contenu: string
  avecCorrige?: boolean
}

@Injectable()
export class ExportService {
  constructor(
    private readonly contentService: ContentService,
    private readonly quizService: QuizService,
  ) {}

  private buildPdf(titre: string, matiere: string, theme: string, type: string, contenu: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []
      doc.on('data', (c) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
      doc.fontSize(20).font('Helvetica-Bold').text(titre, { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(12).font('Helvetica')
        .text(`Matière : ${matiere}`, { align: 'center' })
        .text(`Thème : ${theme}`, { align: 'center' })
        .text(`Type : ${type}`, { align: 'center' })
      doc.moveDown(1)
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke()
      doc.moveDown(1)
      doc.fontSize(11).font('Helvetica').text(contenu, { lineGap: 4 })
      doc.end()
    })
  }

  private async buildWord(titre: string, matiere: string, theme: string, type: string, contenu: string): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: titre, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun({ text: `Matière : ${matiere} | Thème : ${theme} | Type : ${type}`, italics: true })] }),
          new Paragraph({ text: '' }),
          ...contenu.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line })] })),
        ],
      }],
    })
    const buffer = await Packer.toBuffer(doc)
    return buffer
  }

  async exportDirectPdf(dto: ExportDirectDto): Promise<Buffer> {
    return this.buildPdf(dto.titre, dto.matiere, dto.theme, dto.type, dto.contenu)
  }

  async exportDirectWord(dto: ExportDirectDto): Promise<Buffer> {
    return this.buildWord(dto.titre, dto.matiere, dto.theme, dto.type, dto.contenu)
  }

  async exportContentPdf(id: number): Promise<Buffer> {
    const content = this.contentService.findOne(id)
    if (!content.contenu) throw new BadRequestException('Contenu vide')
    return this.buildPdf(content.titre, content.matiere, content.theme, content.type, content.contenu)
  }

  async exportContentWord(id: number): Promise<Buffer> {
    const content = this.contentService.findOne(id)
    return this.buildWord(content.titre, content.matiere, content.theme, content.type, content.contenu)
  }

  async exportQuizPdf(id: number, _avecCorrige: boolean): Promise<Buffer> {
    const quiz = this.quizService.findOne(id)
    const contenu = quiz.questions.map((q, i) =>
      `${i + 1}. ${q.enonce}\nA) ${q.choixA}  B) ${q.choixB}  C) ${q.choixC}  D) ${q.choixD}`
    ).join('\n\n')
    return this.buildPdf(quiz.titre, quiz.matiere, quiz.theme, 'Quiz', contenu)
  }

  async exportQuizWord(id: number, _avecCorrige: boolean): Promise<Buffer> {
    const quiz = this.quizService.findOne(id)
    const contenu = quiz.questions.map((q, i) =>
      `${i + 1}. ${q.enonce}\nA) ${q.choixA}  B) ${q.choixB}  C) ${q.choixC}  D) ${q.choixD}`
    ).join('\n\n')
    return this.buildWord(quiz.titre, quiz.matiere, quiz.theme, 'Quiz', contenu)
  }
}
