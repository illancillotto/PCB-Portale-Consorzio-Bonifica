import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { IngestService } from '../ingest.service';
import { IngestionConnectorCatalogResponseDto } from '../dto/connector-catalog-response.dto';
import { IngestionConnectorDetailResponseDto } from '../dto/connector-detail-response.dto';
import { IngestionRunResponseDto } from '../dto/ingestion-run-response.dto';
import { MatchingResultResponseDto } from '../dto/matching-result-response.dto';
import { NormalizeRunResponseDto } from '../dto/normalize-run-response.dto';
import { NormalizedRecordResponseDto } from '../dto/normalized-record-response.dto';
import { IngestionOrchestrationSummaryResponseDto } from '../dto/orchestration-summary-response.dto';
import { RunMatchingResponseDto } from '../dto/run-matching-response.dto';
import { StartIngestionRunResponseDto } from '../dto/start-ingestion-run-response.dto';

@Controller({
  path: 'ingestion',
  version: '1',
})
@UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
@Roles('pcb-operator')
export class IngestionController {
  constructor(private readonly ingestService: IngestService) {}

  @Get('connectors')
  async listConnectors(): Promise<{ items: IngestionConnectorCatalogResponseDto[]; total: number }> {
    return this.ingestService.listConnectorCatalog();
  }

  @Get('connectors/:connectorName')
  async getConnectorDetail(
    @Param('connectorName') connectorName: string,
  ): Promise<IngestionConnectorDetailResponseDto> {
    const connector = await this.ingestService.getConnectorDetail(connectorName);

    if (!connector) {
      throw new NotFoundException(`Connector not found for name ${connectorName}`);
    }

    return connector;
  }

  @Get('connectors/:connectorName/runs')
  async listRunsByConnector(
    @Param('connectorName') connectorName: string,
  ): Promise<{ items: IngestionRunResponseDto[]; total: number }> {
    const runs = await this.ingestService.listRunsByConnectorName(connectorName);

    if (!runs) {
      throw new NotFoundException(`Connector not found for name ${connectorName}`);
    }

    return runs;
  }

  @Get('orchestration-summary')
  async getOrchestrationSummary(): Promise<IngestionOrchestrationSummaryResponseDto> {
    return this.ingestService.getOrchestrationSummary();
  }

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

  @Post('runs/:id/normalize')
  async normalizeRun(@Param('id') id: string): Promise<NormalizeRunResponseDto> {
    const result = await this.ingestService.normalizeRun(id);

    if (!result) {
      throw new NotFoundException(`Ingestion run not found for id ${id}`);
    }

    return result;
  }

  @Get('runs/:id/normalized-records')
  async listNormalizedRecords(
    @Param('id') id: string,
  ): Promise<{ items: NormalizedRecordResponseDto[]; total: number }> {
    const result = await this.ingestService.listNormalizedRecordsByRunId(id);

    if (!result) {
      throw new NotFoundException(`Ingestion run not found for id ${id}`);
    }

    return result;
  }

  @Post('runs/:id/match')
  async runMatching(@Param('id') id: string): Promise<RunMatchingResponseDto> {
    const result = await this.ingestService.runMatching(id);

    if (!result) {
      throw new NotFoundException(`Ingestion run not found for id ${id}`);
    }

    return result;
  }

  @Get('runs/:id/matching-results')
  async listMatchingResults(
    @Param('id') id: string,
  ): Promise<{ items: MatchingResultResponseDto[]; total: number }> {
    const result = await this.ingestService.listMatchingResultsByRunId(id);

    if (!result) {
      throw new NotFoundException(`Ingestion run not found for id ${id}`);
    }

    return result;
  }

  @Post('runs/:id/matching-results/:resultId/:action')
  async confirmMatchingResult(
    @Param('id') id: string,
    @Param('resultId') resultId: string,
    @Param('action') action: 'confirm-match' | 'confirm-no-match',
  ): Promise<MatchingResultResponseDto> {
    if (action !== 'confirm-match' && action !== 'confirm-no-match') {
      throw new BadRequestException(`Unsupported matching action ${action}`);
    }

    try {
      const result = await this.ingestService.confirmMatchingResult(id, resultId, action);

      if (result === null) {
        throw new NotFoundException(`Ingestion run not found for id ${id}`);
      }

      if (!result) {
        throw new NotFoundException(`Matching result not found for id ${resultId}`);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Matching decision could not be applied';
      throw new BadRequestException(message);
    }
  }

  @Post('runs/:id/matching-results/:resultId/assign-subject/:subjectId')
  async assignSubjectToMatchingResult(
    @Param('id') id: string,
    @Param('resultId') resultId: string,
    @Param('subjectId') subjectId: string,
  ): Promise<MatchingResultResponseDto> {
    try {
      const result = await this.ingestService.assignSubjectToMatchingResult(
        id,
        resultId,
        subjectId,
      );

      if (result === null) {
        throw new NotFoundException(`Ingestion run not found for id ${id}`);
      }

      if (!result) {
        throw new NotFoundException(`Matching result not found for id ${resultId}`);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Manual subject assignment could not be applied';
      throw new BadRequestException(message);
    }
  }

  @Post('connectors/:connectorName/run')
  async startRun(
    @Param('connectorName') connectorName: string,
  ): Promise<StartIngestionRunResponseDto> {
    try {
      return await this.ingestService.startManualRun(connectorName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Run request could not be started';
      throw new BadRequestException(message);
    }
  }
}
