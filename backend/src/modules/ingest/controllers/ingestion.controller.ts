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
  async listRuns(): Promise<{ items: IngestionRunResponseDto[]; total: number }> {
    return this.ingestService.listRuns();
  }

  @Get('runs/:id')
  async getRunById(@Param('id') id: string): Promise<IngestionRunResponseDto> {
    const run = await this.ingestService.getRunById(id);

    if (!run) {
      throw new NotFoundException(`Ingestion run not found for id ${id}`);
    }

    return run;
  }

  @Post('connectors/:connectorName/run')
  async startRun(
    @Param('connectorName') connectorName: string,
  ): Promise<StartIngestionRunResponseDto> {
    return this.ingestService.startManualRun(connectorName);
  }
}
