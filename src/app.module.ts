import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module.js'
import { AuthModule } from './auth/auth.module.js'
import { UserModule } from './user/user.module.js'
import { PromotionModule } from './promotion/promotion.module.js'
import { MatiereModule } from './matiere/matiere.module.js'
import { ArchiveModule } from './archive/archive.module.js'
import { AssociationModule } from './association/association.module.js'
import { GenerationModule } from './generation/generation.module.js'
import { ProfileModule } from './profile/profile.module.js'
import { NoteModule } from './note/note.module.js'
import { StatsModule } from './stats/stats.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    PromotionModule,
    MatiereModule,
    ArchiveModule,
    AssociationModule,
    GenerationModule,
    ProfileModule,
    NoteModule,
    StatsModule,
  ],
})
export class AppModule {}
