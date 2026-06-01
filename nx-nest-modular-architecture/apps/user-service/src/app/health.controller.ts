import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  createServiceHealthResponse,
  createServiceMetricsResponse,
  createServiceReadinessResponse,
} from '@lib/core/common';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  getHealth() {
    return createServiceHealthResponse('user-service');
  }

  @Get('metrics')
  getMetrics() {
    return createServiceMetricsResponse('user-service');
  }

  @Get('ready')
  async getReadiness() {
    try {
      await this.dataSource.query('SELECT 1');
      return createServiceReadinessResponse('user-service', [
        {
          name: 'database',
          status: 'ready',
        },
      ]);
    } catch (error) {
      throw new ServiceUnavailableException(
        createServiceReadinessResponse('user-service', [
          {
            name: 'database',
            status: 'not_ready',
            details:
              error instanceof Error ? error.message : 'Database not reachable',
          },
        ]),
      );
    }
  }
}
