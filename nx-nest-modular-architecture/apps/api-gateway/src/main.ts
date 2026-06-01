import { bootstrapHttpApp } from '@lib/core/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await bootstrapHttpApp({
    appModule: AppModule,
    serviceName: 'api-gateway',
    title: 'FocusEd API Gateway',
    description: 'FocusEd API Gateway documentation',
    defaultPort: 3000,
    portEnvKey: 'GATEWAY_PORT',
  });
}

bootstrap();
