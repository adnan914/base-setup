import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonLogger } from '@/shared/logger/winston.logger';
import { configureApp } from '@/configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.useLogger(app.get(WinstonLogger));
  app.enableShutdownHooks();
  configureApp(app);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  app.get(WinstonLogger).log(`Application is running on port ${port}`);
}

bootstrap();
