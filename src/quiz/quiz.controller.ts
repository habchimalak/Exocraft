import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { QuizService } from './quiz.service.js'
import type { CreateQuizDto } from './dto/create-quiz.dto.js'
import type { UpdateQuizDto } from './dto/update-quiz.dto.js'
import type { CreateQuestionDto } from './dto/create-question.dto.js'
import type { UpdateQuestionDto } from './dto/update-question.dto.js'
import type { ImportQuizDto } from './dto/import-quiz.dto.js'

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateQuizDto) { return this.quizService.create(dto) }

  @Get()
  findAll(@Query('matiere') matiere?: string, @Query('statut') statut?: 'brouillon'|'valide', @Query('niveau') niveau?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.quizService.findAllPaginated({ matiere, statut, niveau, page: page ? +page : undefined, limit: limit ? +limit : undefined })
  }

  @Get('archived/list')
  findArchived(@Query('matiere') matiere?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.quizService.findArchived({ matiere, page: page ? +page : undefined, limit: limit ? +limit : undefined })
  }

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  importFromAi(@Body() dto: ImportQuizDto) { return this.quizService.importFromAi(dto) }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.quizService.findOne(+id) }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) { return this.quizService.update(+id, dto) }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.quizService.remove(+id) }

  @Patch(':id/valider')
  valider(@Param('id') id: string) { return this.quizService.valider(+id) }

  @Patch(':id/visibilite')
  toggleVisibilite(@Param('id') id: string) { return this.quizService.toggleVisibilite(+id) }

  @Patch(':id/archiver')
  archiver(@Param('id') id: string) { return this.quizService.archiver(+id) }

  @Patch(':id/desarchiver')
  desarchiver(@Param('id') id: string) { return this.quizService.desarchiver(+id) }

  @Post(':id/questions')
  @HttpCode(HttpStatus.CREATED)
  addQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto) { return this.quizService.addQuestion(+id, dto) }

  @Patch(':id/questions/:qid')
  updateQuestion(@Param('id') id: string, @Param('qid') qid: string, @Body() dto: UpdateQuestionDto) { return this.quizService.updateQuestion(+id, +qid, dto) }

  @Delete(':id/questions/:qid')
  removeQuestion(@Param('id') id: string, @Param('qid') qid: string) { return this.quizService.removeQuestion(+id, +qid) }

  @Post(':id/variante')
  @HttpCode(HttpStatus.CREATED)
  creerVariante(@Param('id') id: string) { return this.quizService.creerVariante(+id) }
}
