import { bootstrapHttpApp } from '@lib/core/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await bootstrapHttpApp({
    appModule: AppModule,
    serviceName: 'auth-service',
    title: 'FocusEd Auth Service',
    description: 'FocusEd Auth Service documentation',
    defaultPort: 3001,
    portEnvKey: 'AUTH_SERVICE_PORT',
  });
}

bootstrap();
