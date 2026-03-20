import { Module } from '@nestjs/common';
import { IngestionController } from './controllers/ingestion.controller';
import { IngestService } from './ingest.service';

@Module({
  controllers: [IngestionController],
  providers: [IngestService],
  exports: [IngestService],
})
export class IngestModule {}
