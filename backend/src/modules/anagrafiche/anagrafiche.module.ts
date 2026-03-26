import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnagraficheService } from './anagrafiche.service';
import { SubjectsController } from './controllers/subjects.controller';

@Module({
  imports: [AuthModule],
  controllers: [SubjectsController],
  providers: [AnagraficheService],
  exports: [AnagraficheService],
})
export class AnagraficheModule {}
