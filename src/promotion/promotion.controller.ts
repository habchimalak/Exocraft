import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { PromotionService } from './promotion.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { IsString, IsIn, IsOptional } from 'class-validator'

class CreatePromoDto {
  @IsString() nom!: string
  @IsString() code!: string
  @IsIn(['1ere','2eme','3eme','4eme','5eme']) niveau!: string
  @IsString() type!: string
  @IsIn(['S1','S2','S1-S2']) semestre!: string
  @IsOptional() specialite?: string | null
  @IsOptional() matieres?: string[]
}

class UpdatePromoDto {
  @IsOptional() @IsString() nom?: string
  @IsOptional() @IsString() code?: string
  @IsOptional() @IsIn(['1ere','2eme','3eme','4eme','5eme']) niveau?: string
  @IsOptional() @IsString() type?: string
  @IsOptional() @IsIn(['S1','S2','S1-S2']) semestre?: string
  @IsOptional() specialite?: string | null
  @IsOptional() matieres?: string[]
}

@Controller('promos')
@Roles('admin')
export class PromotionController {
  constructor(private readonly promoService: PromotionService) {}

  @Get()
  async findAll(@CurrentUser() user: { etablissementType: string }) {
    return this.promoService.findAll(user.etablissementType)
  }

  @Post()
  async create(@CurrentUser() user: { etablissementType: string }, @Body() dto: CreatePromoDto) {
    return this.promoService.create(user.etablissementType, dto)
  }

  @Put(':id')
  async update(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string, @Body() dto: UpdatePromoDto) {
    return this.promoService.update(+id, user.etablissementType, dto)
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.promoService.delete(+id, user.etablissementType)
  }
}
