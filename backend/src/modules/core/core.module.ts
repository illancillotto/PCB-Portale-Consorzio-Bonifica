import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { SystemController } from './controllers/system.controller';
import { DatabaseModule } from './database/database.module';
import { SystemMetadataService } from './services/system-metadata.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController, SystemController],
  providers: [SystemMetadataService],
  exports: [SystemMetadataService],
})
export class CoreModule {}
