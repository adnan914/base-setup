import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  AUTH_ROUTE_PATTERNS,
  SERVICE_URL_ENV_KEYS,
  USER_ROUTE_PATTERNS,
} from '@lib/core/contracts';
import { GatewayProxyService } from './gateway-proxy.service';

@ApiExcludeController()
@Controller()
export class GatewayProxyController {
  constructor(private readonly gatewayProxyService: GatewayProxyService) {}
  
  @All(AUTH_ROUTE_PATTERNS as unknown as string[])
  proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.gatewayProxyService.forward(
      req,
      res,
      SERVICE_URL_ENV_KEYS.auth,
    );
  }

  @All(USER_ROUTE_PATTERNS as unknown as string[])
  proxyUsers(@Req() req: Request, @Res() res: Response) {
    return this.gatewayProxyService.forward(
      req,
      res,
      SERVICE_URL_ENV_KEYS.users,
    );
  }
}
