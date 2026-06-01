import { Module } from '@nestjs/common';
import { GatewayProxyController } from './gateway-proxy.controller';
import { GatewayProxyService } from './gateway-proxy.service';

@Module({
  controllers: [GatewayProxyController],
  providers: [GatewayProxyService],
})
export class GatewayProxyModule {}
