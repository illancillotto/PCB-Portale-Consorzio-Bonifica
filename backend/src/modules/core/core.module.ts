import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HealthController } from './controllers/health.controller';
import { SystemController } from './controllers/system.controller';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { SystemMetadataService } from './services/system-metadata.service';

@Module({
  imports: [AuthModule, DatabaseModule, RedisModule],
  controllers: [HealthController, SystemController],
  providers: [SystemMetadataService],
  exports: [SystemMetadataService, RedisModule],
})
export class CoreModule {}
