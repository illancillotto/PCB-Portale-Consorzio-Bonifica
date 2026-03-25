import {
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { PcbDomainException } from '../../core/errors/pcb-domain.exception';
import { IngestService } from '../ingest.service';
import { IngestionConnectorCatalogResponseDto } from '../dto/connector-catalog-response.dto';
import { IngestionConnectorDetailResponseDto } from '../dto/connector-detail-response.dto';
import { IngestionConnectorIssueResponseDto } from '../dto/connector-issue-response.dto';
import { IngestionRunResponseDto } from '../dto/ingestion-run-response.dto';
import { MatchingResultResponseDto } from '../dto/matching-result-response.dto';
import { NormalizeRunResponseDto } from '../dto/normalize-run-response.dto';
import { NormalizedRecordResponseDto } from '../dto/normalized-record-response.dto';
import { IngestionOrchestrationSummaryResponseDto } from '../dto/orchestration-summary-response.dto';
import { RawRecordResponseDto } from '../dto/raw-record-response.dto';
import { ListConnectorsQueryDto } from '../dto/list-connectors-query.dto';
import { ListConnectorIssuesQueryDto } from '../dto/list-connector-issues-query.dto';
import { ListConnectorRunsQueryDto } from '../dto/list-connector-runs-query.dto';
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
  async listConnectors(
    @Query() query: ListConnectorsQueryDto,
  ): Promise<{ items: IngestionConnectorCatalogResponseDto[]; total: number }> {
    return this.ingestService.listConnectorCatalog(query);
  }

  @Get('connectors/issues')
  async listConnectorOperationalIssues(
    @Query() query: ListConnectorIssuesQueryDto,
  ): Promise<{
    items: IngestionConnectorIssueResponseDto[];
    total: number;
  }> {
    return this.ingestService.listConnectorOperationalIssuesFiltered(query);
  }

  @Get('connectors/:connectorName')
  async getConnectorDetail(
    @Param('connectorName') connectorName: string,
  ): Promise<IngestionConnectorDetailResponseDto> {
    const connector = await this.ingestService.getConnectorDetail(connectorName);

    if (!connector) {
      throw PcbDomainException.notFound(
        'ingest.connector_not_found',
        `Connector not found for name ${connectorName}`,
        { connectorName },
      );
    }

    return connector;
  }

  @Get('connectors/:connectorName/runs')
  async listRunsByConnector(
    @Param('connectorName') connectorName: string,
    @Query() query: ListConnectorRunsQueryDto,
  ): Promise<{ items: IngestionRunResponseDto[]; total: number }> {
    const runs = await this.ingestService.listRunsByConnectorName(connectorName, query.status);

    if (!runs) {
      throw PcbDomainException.notFound(
        'ingest.connector_not_found',
        `Connector not found for name ${connectorName}`,
        { connectorName },
      );
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
      throw PcbDomainException.notFound('ingest.run_not_found', `Ingestion run not found for id ${id}`, { runId: id });
    }

    return run;
  }

  @Post('runs/:id/normalize')
  async normalizeRun(@Param('id') id: string): Promise<NormalizeRunResponseDto> {
    const result = await this.ingestService.normalizeRun(id);

    if (!result) {
      throw PcbDomainException.notFound('ingest.run_not_found', `Ingestion run not found for id ${id}`, { runId: id });
    }

    return result;
  }

  @Get('runs/:id/raw-records')
  async listRawRecords(
    @Param('id') id: string,
  ): Promise<{ items: RawRecordResponseDto[]; total: number }> {
    const result = await this.ingestService.listRawRecordsByRunId(id);

    if (!result) {
      throw PcbDomainException.notFound('ingest.run_not_found', `Ingestion run not found for id ${id}`, { runId: id });
    }

    return result;
  }

  @Get('runs/:id/normalized-records')
  async listNormalizedRecords(
    @Param('id') id: string,
  ): Promise<{ items: NormalizedRecordResponseDto[]; total: number }> {
    const result = await this.ingestService.listNormalizedRecordsByRunId(id);

    if (!result) {
      throw PcbDomainException.notFound('ingest.run_not_found', `Ingestion run not found for id ${id}`, { runId: id });
    }

    return result;
  }

  @Post('runs/:id/match')
  async runMatching(@Param('id') id: string): Promise<RunMatchingResponseDto> {
    const result = await this.ingestService.runMatching(id);

    if (!result) {
      throw PcbDomainException.notFound('ingest.run_not_found', `Ingestion run not found for id ${id}`, { runId: id });
    }

    return result;
  }

  @Get('runs/:id/matching-results')
  async listMatchingResults(
    @Param('id') id: string,
  ): Promise<{ items: MatchingResultResponseDto[]; total: number }> {
    const result = await this.ingestService.listMatchingResultsByRunId(id);

    if (!result) {
      throw PcbDomainException.notFound('ingest.run_not_found', `Ingestion run not found for id ${id}`, { runId: id });
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
      throw PcbDomainException.badRequest(
        'ingest.unsupported_matching_action',
        `Unsupported matching action ${action}`,
        { action },
      );
    }

    try {
      const result = await this.ingestService.confirmMatchingResult(id, resultId, action);

      if (result === null) {
        throw PcbDomainException.notFound(
          'ingest.run_not_found',
          `Ingestion run not found for id ${id}`,
          { runId: id },
        );
      }

      if (!result) {
        throw PcbDomainException.notFound(
          'ingest.matching_result_not_found',
          `Matching result not found for id ${resultId}`,
          { runId: id, resultId },
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Matching decision could not be applied';
      throw PcbDomainException.badRequest(
        'ingest.matching_decision_failed',
        message,
        { runId: id, resultId, action },
      );
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
        throw PcbDomainException.notFound(
          'ingest.run_not_found',
          `Ingestion run not found for id ${id}`,
          { runId: id },
        );
      }

      if (!result) {
        throw PcbDomainException.notFound(
          'ingest.matching_result_not_found',
          `Matching result not found for id ${resultId}`,
          { runId: id, resultId },
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Manual subject assignment could not be applied';
      throw PcbDomainException.badRequest(
        'ingest.manual_subject_assignment_failed',
        message,
        { runId: id, resultId, subjectId },
      );
    }
  }

  @Post('connectors/:connectorName/run')
  async startRun(
    @Param('connectorName') connectorName: string,
  ): Promise<StartIngestionRunResponseDto> {
    try {
      return await this.ingestService.startManualRun(connectorName);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Run request could not be started';
      throw PcbDomainException.badRequest(
        'ingest.run_request_failed',
        message,
        { connectorName },
      );
    }
  }
}
