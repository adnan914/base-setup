import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerAggregateService } from './swagger-aggregate.service';

@ApiExcludeController()
@Controller()
export class SwaggerAggregateController {
  constructor(
    private readonly swaggerAggregateService: SwaggerAggregateService,
  ) {}

  @Get('openapi.json')
  async getOpenApiDocument(@Res() res: Response) {
    const document = await this.swaggerAggregateService.getMergedDocument();
    res.type('application/json').send(document);
  }

  @Get('openapi/gateway.json')
  async getGatewayDocument(@Res() res: Response) {
    const document =
      await this.swaggerAggregateService.getServiceDocument('gateway');
    res.type('application/json').send(document);
  }

  @Get('openapi/auth.json')
  async getAuthDocument(@Res() res: Response) {
    const document =
      await this.swaggerAggregateService.getServiceDocument('auth');
    res.type('application/json').send(document);
  }

  @Get('openapi/users.json')
  async getUsersDocument(@Res() res: Response) {
    const document =
      await this.swaggerAggregateService.getServiceDocument('users');
    res.type('application/json').send(document);
  }
}
