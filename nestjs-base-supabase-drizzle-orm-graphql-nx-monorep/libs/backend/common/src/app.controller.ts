import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@/shared/decorators/public.decorator';
import { DatabaseService } from '@/database';
import {
  HealthResponseDataDto,
  ReadinessResponseDataDto,
} from './app-response.dto';
import { ApiEnvelopeResponse } from '@/shared/decorators/api-envelope-response.decorator';
import { ApiErrorResponseDto } from '@/shared/dto/api-response.dto';
import { Messages } from '@/shared/decorators/messages.decorator';
import { MESSAGES } from '@/shared/constants';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('health')
  @Public()
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({
    summary: 'Check application health',
    description:
      'Returns process-level liveness data without querying external dependencies.',
  })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'Application health data returned.',
    type: HealthResponseDataDto,
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @Public()
  @Messages(MESSAGES.DATA_FOUND)
  @ApiOperation({
    summary: 'Check application readiness',
    description:
      'Checks whether the API dependencies required for serving requests are ready.',
  })
  @ApiEnvelopeResponse({
    status: 200,
    description: 'Application dependencies are ready.',
    type: ReadinessResponseDataDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'A readiness dependency check failed.',
    type: ApiErrorResponseDto,
  })
  async getReadiness() {
    await this.databaseService.ping();

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
