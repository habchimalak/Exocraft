import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { ContentService } from './content.service.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import type { CreateContentDto } from './dto/create-content.dto.js'
import type { UpdateContentDto } from './dto/update-content.dto.js'
import type { FilterContentDto } from './dto/filter-content.dto.js'

@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContentDto, @CurrentUser() user: { id: number }) {
    return this.contentService.create({ ...dto, auteurId: user.id })
  }

  @Get()
  findAll(@Query() filters: FilterContentDto) { return this.contentService.findAll(filters) }

  @Get('public')
  findPublic(@Query() filters: FilterContentDto) { return this.contentService.findPublic(filters) }

  @Get('mes-contenus')
  findMiens(@CurrentUser() user: { id: number }, @Query() filters: FilterContentDto) {
    return this.contentService.findByAuteur(user.id, filters)
  }

  @Get('archived/list')
  findArchived(@CurrentUser() user: { id: number }, @Query() filters: FilterContentDto) {
    return this.contentService.findArchived(user.id, filters)
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.contentService.findOne(+id) }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentDto, @CurrentUser() user: { id: number }) {
    return this.contentService.update(+id, user.id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.contentService.remove(+id, user.id)
  }

  @Patch(':id/valider')
  valider(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.contentService.valider(+id, user.id)
  }

  @Patch(':id/visibilite')
  toggleVisibilite(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.contentService.toggleVisibilite(+id, user.id)
  }

  @Post(':id/dupliquer')
  @HttpCode(HttpStatus.CREATED)
  dupliquer(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.contentService.dupliquer(+id, user.id)
  }

  @Patch(':id/archiver')
  archiver(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.contentService.archiver(+id, user.id)
  }

  @Patch(':id/desarchiver')
  desarchiver(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.contentService.desarchiver(+id, user.id)
  }
}
