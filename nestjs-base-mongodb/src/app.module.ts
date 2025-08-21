import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { GlobalConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { DiscoveryFeatureModule } from './discovery/discovery.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    GlobalConfigModule,          // async provider + config validation
    DatabaseModule,              // dynamic forRootAsync
    SharedModule,                // common services
    // Lazy loading example via RouterModule:
    RouterModule.register([
      { path: 'reports', module: ReportsModule },        // can be split to lazy chunk in monorepo/build
    ]),
    AuthModule,
    UserModule,
    ReportsModule,
    DiscoveryFeatureModule,       // discovery service example
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
