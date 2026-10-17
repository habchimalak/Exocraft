import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { UserService } from './user.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { IsString, IsEmail, IsIn, IsOptional } from 'class-validator'

class CreateUserDto {
  @IsString() nom!: string
  @IsString() prenom!: string
  @IsEmail() email!: string
  @IsIn(['admin', 'enseignant']) role!: string
  @IsIn(['actif', 'inactif']) status!: string
  @IsOptional() @IsString() password?: string
}

class UpdateUserDto {
  @IsOptional() @IsString() nom?: string
  @IsOptional() @IsString() prenom?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsIn(['admin', 'enseignant']) role?: string
  @IsOptional() @IsIn(['actif', 'inactif']) status?: string
}

@Controller('users')
@Roles('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @CurrentUser() user: { etablissementType: string },
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const users = await this.userService.findAll(user.etablissementType, role, status, search)
    return users.map(({ password: _pw, ...u }) => ({
      ...u,
      matieres: u.matiereAssoc.map((a) => a.matiere.nom),
      promos: u.promoAssoc.map((a) => a.promo.nom),
      created_at: u.createdAt.toISOString(),
    }))
  }

  @Post()
  async create(@CurrentUser() user: { etablissementType: string }, @Body() dto: CreateUserDto) {
    const created = await this.userService.create({ ...dto, etablissementType: user.etablissementType })
    const { password: _pw, ...safe } = created
    return { ...safe, matieres: [], promos: [], created_at: created.createdAt.toISOString() }
  }

  @Put(':id')
  async update(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const updated = await this.userService.update(+id, user.etablissementType, dto)
    const { password: _pw, ...safe } = updated
    return { ...safe, matieres: updated.matiereAssoc.map((a) => a.matiere.nom), promos: updated.promoAssoc.map((a) => a.promo.nom), created_at: updated.createdAt.toISOString() }
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { id: number; etablissementType: string }, @Param('id') id: string) {
    return this.userService.delete(+id, user.etablissementType, user.id)
  }

  @Patch(':id/status')
  async toggleStatus(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.userService.toggleStatus(+id, user.etablissementType)
  }

  @Patch(':id/promote')
  async promote(@CurrentUser() user: { etablissementType: string }, @Param('id') id: string) {
    return this.userService.promote(+id, user.etablissementType)
  }
}
