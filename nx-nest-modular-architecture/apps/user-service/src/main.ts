import { bootstrapHttpApp } from '@lib/core/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await bootstrapHttpApp({
    appModule: AppModule,
    serviceName: 'user-service',
    title: 'FocusEd User Service',
    description: 'FocusEd User Service documentation',
    defaultPort: 3002,
    portEnvKey: 'USER_SERVICE_PORT',
  });
}

bootstrap();
