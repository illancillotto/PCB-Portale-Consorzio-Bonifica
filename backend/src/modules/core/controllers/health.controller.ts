import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  async getHealth() {
    const redis = await this.redisService.ping();

    return {
      service: 'pcb-backend',
      status: 'ok',
      dependencies: {
        redis,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
