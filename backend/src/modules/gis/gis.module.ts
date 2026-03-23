import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GisController } from './controllers/gis.controller';
import { GisService } from './gis.service';

@Module({
  imports: [AuthModule],
  controllers: [GisController],
  providers: [GisService],
  exports: [GisService],
})
export class GisModule {}
