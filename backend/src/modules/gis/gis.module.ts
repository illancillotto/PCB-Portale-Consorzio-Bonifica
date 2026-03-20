import { Module } from '@nestjs/common';
import { GisService } from './gis.service';

@Module({
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
