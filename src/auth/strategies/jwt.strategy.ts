import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'

export interface JwtPayload {
  sub: number
  email: string
  role: string
  etablissementType: string
}

function extractJwt(req: Request): string | null {
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
  if (fromHeader) return fromHeader

  const tokenFromQuery = req.query?.token
  if (typeof tokenFromQuery === 'string' && tokenFromQuery) return tokenFromQuery

  return null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    })
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      etablissementType: payload.etablissementType,
    }
  }
}
