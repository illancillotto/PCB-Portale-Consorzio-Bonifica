import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ParcelsController } from './controllers/parcels.controller';
import { CatastoService } from './catasto.service';

@Module({
  imports: [AuthModule],
  controllers: [ParcelsController],
  providers: [CatastoService],
  exports: [CatastoService],
})
export class CatastoModule {}
