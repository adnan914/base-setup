import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import {
  createServiceHealthResponse,
  createServiceMetricsResponse,
  createServiceReadinessResponse,
} from '@lib/core/common';
import { DataSource } from 'typeorm';

@ApiTags('system')
@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  @ApiOperation({ summary: 'Auth service health check' })
  @ApiOkResponse({ description: 'Auth service process health information' })
  getHealth() {
    return createServiceHealthResponse('auth-service');
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Auth service process metrics' })
  @ApiOkResponse({ description: 'Auth service process metrics snapshot' })
  getMetrics() {
    return createServiceMetricsResponse('auth-service');
  }

  @Get('ready')
  @ApiOperation({ summary: 'Auth service readiness check' })
  @ApiOkResponse({ description: 'Auth service is ready' })
  @ApiServiceUnavailableResponse({ description: 'Auth service is not ready' })
  async getReadiness() {
    try {
      await this.dataSource.query('SELECT 1');
      return createServiceReadinessResponse('auth-service', [
        {
          name: 'database',
          status: 'ready',
        },
      ]);
    } catch (error) {
      throw new ServiceUnavailableException(
        createServiceReadinessResponse('auth-service', [
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
