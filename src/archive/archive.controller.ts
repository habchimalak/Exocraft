import { Controller, Get, Post, Delete, Body, Param, Query, Res, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ArchiveService } from './archive.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type { Response } from 'express'

@Controller('archives')
@Roles('admin')
export class ArchiveController {
  constructor(
    private readonly archiveService: ArchiveService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: { etablissementType: string }, @Query('type') type?: string, @Query('matiere') matiere?: string, @Query('search') search?: string) {
    return this.archiveService.findAll(user.etablissementType, type, matiere, search)
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @CurrentUser() user: { id: number; etablissementType: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { titre: string; type: string; format: string; matiere: string; promo: string },
  ) {
    if (!file) throw new Error('Aucun fichier fourni')
    const u = await this.prisma.user.findUnique({ where: { id: user.id } })
    const uploadedBy = u ? `${u.prenom} ${u.nom}` : 'Administrateur'
    return this.archiveService.create(user.etablissementType, user.id, uploadedBy, file, body)
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.archiveService.delete(+id, user.etablissementType)
  }

  @Get(':id/download')
  async download(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string, @Res() res: Response) {
    const { filePath, fileName } = await this.archiveService.getDownloadPath(+id, user.etablissementType)
    res.download(filePath, fileName)
  }
}
