import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from './shared/decorators/public.decorator';
import { DatabaseService } from './database';
import { MESSAGES } from './shared/constants';
import { Messages } from './shared/decorators/messages.decorator';
import {
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from './shared/dto/api-response.dto';
import { HealthResponseDto, ReadinessResponseDto } from './app-response.dto';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiEnvelopeResponse({
    description: 'Application process health status.',
    message: MESSAGES.HEALTHY,
    status: 200,
    type: HealthResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server failure.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.HEALTHY)
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiEnvelopeResponse({
    description: 'Database-backed readiness status.',
    message: MESSAGES.READY,
    status: 200,
    type: ReadinessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'A dependency is not ready or the server failed.',
    type: ApiErrorResponseDto,
  })
  @Messages(MESSAGES.READY)
  async getReadiness() {
    await this.databaseService.ping();

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
