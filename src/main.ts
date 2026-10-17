import { NestFactory, Reflector } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module.js'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js'
import { RolesGuard } from './auth/guards/roles.guard.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
    ],
    credentials: true,
  })

  // ── Préfixe global /api ────────────────────────────
  app.setGlobalPrefix('api')

  // ── Validation globale des DTOs ─────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )

  // ── Guards globaux (JWT + Roles) ────────────────────
  const reflector = app.get(Reflector)
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new RolesGuard(reflector),
  )

  const PORT = process.env.PORT ?? 3001
  await app.listen(PORT)
  console.log(`✅ ExoCraft Backend (NestJS) running on http://localhost:${PORT}`)
}

await bootstrap()
