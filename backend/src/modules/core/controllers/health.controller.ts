import { Controller, Get } from '@nestjs/common';

@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  @Get()
  getHealth() {
    return {
      service: 'pcb-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
