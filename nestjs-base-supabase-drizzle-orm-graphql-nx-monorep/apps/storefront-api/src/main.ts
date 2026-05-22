import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureApp } from '@/configure-app';
import { WinstonLogger } from '@/shared/logger/winston.logger';
import { StorefrontApiModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(StorefrontApiModule);
  const configService = app.get(ConfigService);

  app.useLogger(app.get(WinstonLogger));
  app.enableShutdownHooks();
  configureApp(app);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  app.get(WinstonLogger).log(`Storefront API is running on port ${port}`);
}

bootstrap();
