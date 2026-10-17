import { Module } from '@nestjs/common'
import { NoteService } from './note.service.js'
import { NoteController } from './note.controller.js'

@Module({
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
