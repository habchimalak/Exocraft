import { Controller, Post, Get, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { AiService } from './ai.service.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import type { GenerateContentDto } from './dto/generate-content.dto.js'
import type { SaveGeneratedDto } from './dto/save-generated.dto.js'
import type { ChatDto } from './dto/chat.dto.js'
import { Public } from '../auth/decorators/public.decorator.js'

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() dto: ChatDto) { return this.aiService.chat(dto) }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generate(@Body() dto: GenerateContentDto) { return this.aiService.generate(dto) }

  @Post('generate-from-archive/:archiveId')
  @HttpCode(HttpStatus.OK)
  generateFromArchive(@Param('archiveId') archiveId: string, @Body() dto: GenerateContentDto) {
    return this.aiService.generateFromArchive(+archiveId, dto)
  }

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  save(@Body() dto: SaveGeneratedDto, @CurrentUser() user: { id: number }) {
    return this.aiService.save(dto, user?.id)
  }

  @Get('contents')
  findAll() { return this.aiService.findAll() }

  @Get('contents/:id')
  findOne(@Param('id') id: string) { return this.aiService.findOne(+id) }

  @Patch('contents/:id/valider')
  valider(@Param('id') id: string) { return this.aiService.valider(+id) }

  @Patch('contents/:id/modifier')
  modifier(@Param('id') id: string, @Body() body: { contenu: string }) {
    return this.aiService.updateContenu(+id, body.contenu)
  }
}
