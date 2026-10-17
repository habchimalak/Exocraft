import { Controller, Get, Put, Body, Param } from '@nestjs/common'
import { AssociationService } from './association.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { IsArray } from 'class-validator'

class SaveAssociationDto {
  @IsArray() matiereNoms!: string[]
  @IsArray() promoNoms!: string[]
}

@Controller('associations')
@Roles('admin')
export class AssociationController {
  constructor(private readonly associationService: AssociationService) {}

  @Get()
  async findAll(@CurrentUser() user: { etablissementType: string }) {
    return this.associationService.findAll(user.etablissementType)
  }

  @Put(':userId')
  async save(@CurrentUser() user: { etablissementType: string }, @Param('userId') userId: string, @Body() dto: SaveAssociationDto) {
    return this.associationService.save(+userId, user.etablissementType, dto.matiereNoms, dto.promoNoms)
  }
}
