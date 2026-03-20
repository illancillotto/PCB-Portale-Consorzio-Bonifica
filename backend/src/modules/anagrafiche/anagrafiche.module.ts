import { Module } from '@nestjs/common';
import { AnagraficheService } from './anagrafiche.service';
import { SubjectsController } from './controllers/subjects.controller';

@Module({
  controllers: [SubjectsController],
  providers: [AnagraficheService],
  exports: [AnagraficheService],
})
export class AnagraficheModule {}
