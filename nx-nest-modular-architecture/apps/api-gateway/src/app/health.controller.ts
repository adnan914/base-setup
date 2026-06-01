import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import {
  createServiceHealthResponse,
  createServiceMetricsResponse,
  createServiceReadinessResponse,
  RES_MESSAGES,
  SWAGGER_MESSAGES,
} from '@lib/core/common';
import { GatewayReadinessService } from './gateway-readiness.service';

@ApiTags('system')
@Controller()
export class HealthController {
  constructor(
    private readonly gatewayReadinessService: GatewayReadinessService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: SWAGGER_MESSAGES.SYSTEM_HEALTH })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  getHealth() {
    return createServiceHealthResponse('api-gateway');
  }

  @Get('metrics')
  @ApiOperation({ summary: SWAGGER_MESSAGES.SYSTEM_METRICS })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  getMetrics() {
    return createServiceMetricsResponse('api-gateway');
  }

  @Get('ready')
  @ApiOperation({ summary: SWAGGER_MESSAGES.SYSTEM_READINESS })
  @ApiOkResponse({ description: RES_MESSAGES.DATA_FOUND })
  @ApiServiceUnavailableResponse({
    description: 'One or more downstream services are not ready',
  })
  async getReadiness() {
    const checks = await this.gatewayReadinessService.getChecks();
    const isReady = checks.every((check) => check.status === 'ready');
    const response = createServiceReadinessResponse('api-gateway', checks);

    if (!isReady) {
      throw new HttpException(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return response;
  }
}

