import { Controller, Post, Get, Patch, Body, UsePipes, ValidationPipe } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { Public } from './decorators/public.decorator.js'
import { Roles } from './decorators/roles.decorator.js'
import { CurrentUser } from './decorators/current-user.decorator.js'
import { LoginDto } from './dto/login.dto.js'
import { IsString, IsNotEmpty } from 'class-validator'

class ChangePasswordDto {
  @IsString() @IsNotEmpty() currentPassword!: string
  @IsString() @IsNotEmpty() newPassword!: string
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.motDePasse, dto.etablissementType)
  }

  @Get('me')
  async me(@CurrentUser() user: { id: number }) {
    return this.authService.getMe(user.id)
  }

  @Public()
  @Post('logout')
  async logout() {
    return { message: 'Déconnexion réussie' }
  }

  @Roles('admin')
  @Patch('password')
  async changePassword(
    @CurrentUser() user: { id: number },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword)
  }
}
