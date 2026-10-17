import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MatiereService } from './matiere.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { IsString, IsOptional, IsArray } from 'class-validator'
import type { Response } from 'express'

class CreateMatiereDto {
  @IsString() nom!: string
  @IsOptional() @IsArray() promoIds?: number[]
}

class UpdateMatiereDto {
  @IsOptional() @IsString() nom?: string
  @IsOptional() @IsArray() promoIds?: number[]
}

@Controller('matieres')
@Roles('admin')
export class MatiereController {
  constructor(private readonly matiereService: MatiereService) {}

  @Get()
  async findAll(@CurrentUser() user: { etablissementType: string }, @Query('promoId') promoId?: string, @Query('search') search?: string) {
    return this.matiereService.findAll(user.etablissementType, promoId ? +promoId : undefined, search)
  }

  @Post()
  async create(@CurrentUser() user: { etablissementType: string }, @Body() dto: CreateMatiereDto) {
    return this.matiereService.create(user.etablissementType, dto.nom, dto.promoIds ?? [])
  }

  @Put(':id')
  async update(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string, @Body() dto: UpdateMatiereDto) {
    return this.matiereService.update(+id, user.etablissementType, dto)
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.matiereService.delete(+id, user.etablissementType)
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser() user: { etablissementType: string },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { titre: string; type: string; format: string; promo: string },
  ) {
    if (!file) throw new Error('Aucun fichier fourni')
    return this.matiereService.uploadDocument(+id, user.etablissementType, file, body)
  }

  @Delete(':id/documents/:docId')
  async deleteDocument(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string, @Param('docId') docId: string) {
    return this.matiereService.deleteDocument(+id, +docId, user.etablissementType)
  }

  @Get(':id/documents/:docId/download')
  async download(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string, @Param('docId') docId: string, @Res() res: Response) {
    const { filePath, fileName } = await this.matiereService.getDownloadPath(+id, +docId, user.etablissementType)
    res.download(filePath, fileName)
  }
}
