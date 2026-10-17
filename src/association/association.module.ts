import { Module } from '@nestjs/common'
import { AssociationService } from './association.service.js'
import { AssociationController } from './association.controller.js'

@Module({
  controllers: [AssociationController],
  providers: [AssociationService],
  exports: [AssociationService],
})
export class AssociationModule {}
