import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service.js'
import type { JwtPayload } from './strategies/jwt.strategy.js'
import { validatePasswordStrength } from '../utils/password.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, motDePasse: string, etablissementType: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    if (user.etablissementType !== etablissementType) {
      throw new UnauthorizedException("Cet utilisateur n'appartient pas à cet établissement")
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedException('Accès refusé — seuls les administrateurs peuvent se connecter au panneau admin')
    }

    if (user.status === 'inactif') {
      throw new UnauthorizedException('Compte désactivé. Contactez un autre administrateur.')
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      etablissementType: user.etablissementType,
    }

    const token = await this.jwtService.signAsync(payload)

    return {
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        status: user.status,
        etablissementType: user.etablissementType,
        createdAt: user.createdAt.toISOString(),
      },
    }
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })
    if (!user) throw new UnauthorizedException('Utilisateur introuvable')

    const { password: _pw, ...userSafe } = user
    return {
      ...userSafe,
      createdAt: userSafe.createdAt.toISOString(),
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('Utilisateur introuvable')

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect')
    }

    const strengthCheck = validatePasswordStrength(newPassword)
    if (!strengthCheck.valid) {
      throw new BadRequestException({
        message: 'Mot de passe trop faible',
        details: strengthCheck.errors,
      })
    }

    const hashedNew = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew },
    })

    return { message: 'Mot de passe mis à jour avec succès' }
  }
}
