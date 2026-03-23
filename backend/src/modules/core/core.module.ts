import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { SystemController } from './controllers/system.controller';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { SystemMetadataService } from './services/system-metadata.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [HealthController, SystemController],
  providers: [SystemMetadataService],
  exports: [SystemMetadataService, RedisModule],
})
export class CoreModule {}
