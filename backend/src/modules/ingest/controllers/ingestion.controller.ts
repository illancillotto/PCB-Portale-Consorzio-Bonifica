import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { IngestService } from '../ingest.service';
import { IngestionRunResponseDto } from '../dto/ingestion-run-response.dto';
import { StartIngestionRunResponseDto } from '../dto/start-ingestion-run-response.dto';

@Controller({
  path: 'ingestion',
  version: '1',
})
export class IngestionController {
  constructor(private readonly ingestService: IngestService) {}

  @Get('runs')
  listRuns(): { items: IngestionRunResponseDto[]; total: number } {
    return this.ingestService.listRuns();
  }

  @Get('runs/:id')
  getRunById(@Param('id') id: string): IngestionRunResponseDto {
    const run = this.ingestService.getRunById(id);

    if (!run) {
      throw new NotFoundException(`Ingestion run not found for id ${id}`);
    }

    return run;
  }

  @Post('connectors/:connectorName/run')
  startRun(@Param('connectorName') connectorName: string): StartIngestionRunResponseDto {
    return this.ingestService.startManualRun(connectorName);
  }
}
