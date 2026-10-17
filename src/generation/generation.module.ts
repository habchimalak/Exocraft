import { Module } from '@nestjs/common'
import { GenerationService } from './generation.service.js'
import { GenerationController } from './generation.controller.js'

@Module({
  controllers: [GenerationController],
  providers: [GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
