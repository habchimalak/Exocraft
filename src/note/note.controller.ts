import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { NoteService } from './note.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { IsString, IsOptional, IsIn } from 'class-validator'

class CreateNoteDto {
  @IsString() content!: string
  @IsOptional() @IsIn(['info', 'urgent', 'todo', 'done']) tag?: string
}

@Controller('notes')
@Roles('admin')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  async findAll(@CurrentUser() user: { etablissementType: string }) {
    return this.noteService.findAll(user.etablissementType)
  }

  @Post()
  async create(@CurrentUser() user: { id: number; etablissementType: string }, @Body() dto: CreateNoteDto) {
    return this.noteService.create(user.id, user.etablissementType, dto.content, dto.tag)
  }

  @Patch(':id/pin')
  async togglePin(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.noteService.togglePin(+id, user.etablissementType)
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.noteService.delete(+id, user.etablissementType)
  }
}
