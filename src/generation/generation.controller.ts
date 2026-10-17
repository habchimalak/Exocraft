import { Controller, Get, Post, Body, Query, Sse, MessageEvent } from '@nestjs/common'
import { GenerationService } from './generation.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { Observable } from 'rxjs'
import { IsString, IsIn, IsOptional } from 'class-validator'

class CreateGenerationDto {
  @IsIn(['Quiz', 'Examen', 'Cours', 'Exercices', 'Résumé']) type!: string
  @IsString() sujet!: string
  @IsOptional() @IsIn(['success', 'pending']) status?: string
}

@Controller('generations')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Get()
  @Roles('admin')
  async findAll(@CurrentUser() user: { etablissementType: string }, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.generationService.findAll(user.etablissementType, page ? +page : 1, limit ? +limit : 20)
  }

  @Get('stats')
  @Roles('admin')
  async getStats(@CurrentUser() user: { etablissementType: string }) {
    return this.generationService.getStats(user.etablissementType)
  }

  @Post()
  async create(@CurrentUser() user: { id: number; etablissementType: string }, @Body() dto: CreateGenerationDto) {
    return this.generationService.create(user.id, user.etablissementType, dto.type, dto.sujet, dto.status)
  }
}
