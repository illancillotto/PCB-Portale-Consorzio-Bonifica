import { Module } from '@nestjs/common';
import { GisController } from './controllers/gis.controller';
import { GisService } from './gis.service';

@Module({
  controllers: [GisController],
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
