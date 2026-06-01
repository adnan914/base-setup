import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfigModuleOptions } from '@lib/core/config';
import { GatewayProxyModule } from './proxy/gateway-proxy.module';
import { HealthController } from './health.controller';
import { GatewayReadinessService } from './gateway-readiness.service';
import { SwaggerAggregateModule } from './swagger/swagger-aggregate.module';

@Module({
  imports: [
    ConfigModule.forRoot(createAppConfigModuleOptions('gateway')),
    GatewayProxyModule,
    SwaggerAggregateModule,
  ],
  controllers: [HealthController],
  providers: [GatewayReadinessService],
})
export class AppModule {}
