import { Controller, Get, Post, Param, Query, Body, Res, HttpCode, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { ExportService, type ExportDirectDto } from './export.service.js'

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('direct/pdf')
  @HttpCode(HttpStatus.OK)
  async exportDirectPdf(@Body() dto: ExportDirectDto, @Res() res: Response) {
    const buffer = await this.exportService.exportDirectPdf(dto)
    const nom = `${dto.type}-${dto.theme.slice(0, 30).replace(/\s/g, '-')}.pdf`
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${encodeURIComponent(nom)}"`, 'Content-Length': buffer.length })
    res.end(buffer)
  }

  @Post('direct/word')
  @HttpCode(HttpStatus.OK)
  async exportDirectWord(@Body() dto: ExportDirectDto, @Res() res: Response) {
    const buffer = await this.exportService.exportDirectWord(dto)
    const nom = `${dto.type}-${dto.theme.slice(0, 30).replace(/\s/g, '-')}.docx`
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="${encodeURIComponent(nom)}"`, 'Content-Length': buffer.length })
    res.end(buffer)
  }

  @Get('content/:id/pdf')
  async exportContentPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.exportService.exportContentPdf(+id)
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="content-${id}.pdf"`, 'Content-Length': buffer.length })
    res.end(buffer)
  }

  @Get('content/:id/word')
  async exportContentWord(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.exportService.exportContentWord(+id)
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="content-${id}.docx"`, 'Content-Length': buffer.length })
    res.end(buffer)
  }

  @Get('quiz/:id/pdf')
  async exportQuizPdf(@Param('id') id: string, @Query('corrige') corrige: string, @Res() res: Response) {
    const buffer = await this.exportService.exportQuizPdf(+id, corrige === 'true')
    const suffix = corrige === 'true' ? '-corrige' : '-etudiant'
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="quiz-${id}${suffix}.pdf"`, 'Content-Length': buffer.length })
    res.end(buffer)
  }

  @Get('quiz/:id/word')
  async exportQuizWord(@Param('id') id: string, @Query('corrige') corrige: string, @Res() res: Response) {
    const buffer = await this.exportService.exportQuizWord(+id, corrige === 'true')
    const suffix = corrige === 'true' ? '-corrige' : '-etudiant'
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="quiz-${id}${suffix}.docx"`, 'Content-Length': buffer.length })
    res.end(buffer)
  }
}
