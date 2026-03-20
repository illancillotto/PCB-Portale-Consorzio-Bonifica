import { Module } from '@nestjs/common';
import { ParcelsController } from './controllers/parcels.controller';
import { CatastoService } from './catasto.service';

@Module({
  controllers: [ParcelsController],
  providers: [CatastoService],
  exports: [CatastoService],
})
export class CatastoModule {}
