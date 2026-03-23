import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CoreModule } from '../core/core.module';
import { RedisModule } from '../core/redis/redis.module';
import { IngestionController } from './controllers/ingestion.controller';
import { IngestService } from './ingest.service';

@Module({
  imports: [AuditModule, CoreModule, RedisModule],
  controllers: [IngestionController],
  providers: [IngestService],
  exports: [IngestService],
})
export class IngestModule {}
