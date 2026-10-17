import { Controller, Get, Put, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ProfileService } from './profile.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { IsString, IsOptional, IsEmail } from 'class-validator'

class UpdateProfileDto {
  @IsOptional() @IsString() nom?: string
  @IsOptional() @IsString() prenom?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() telephone?: string
  @IsOptional() @IsString() poste?: string
  @IsOptional() @IsString() departement?: string
  @IsOptional() @IsString() etablissement?: string
  @IsOptional() @IsString() bio?: string
}

@Controller('profile')
@Roles('admin')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async get(@CurrentUser() user: { id: number }) {
    return this.profileService.get(user.id)
  }

  @Put()
  async update(@CurrentUser() user: { id: number }, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(user.id, dto)
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@CurrentUser() user: { id: number }, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Aucune image fournie')
    return this.profileService.uploadAvatar(user.id, file)
  }
}
