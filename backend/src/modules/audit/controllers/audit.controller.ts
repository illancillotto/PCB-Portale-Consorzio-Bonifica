import { Controller, Get } from '@nestjs/common';
import { AuditService } from '../audit.service';
import { AuditEventResponseDto } from '../dto/audit-event-response.dto';

@Controller({
  path: 'audit',
  version: '1',
})
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  async listEvents(): Promise<{ items: AuditEventResponseDto[]; total: number }> {
    return this.auditService.listEvents();
  }
}
