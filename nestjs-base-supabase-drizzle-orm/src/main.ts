import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Swagger documentation
  if (configService.get<boolean>('SWAGGER_ENABLED')) {
    const config = new DocumentBuilder()
      .setTitle('Hash Tax')
      .setDescription(
        'Hash Tax API documentation for health, authentication, and user endpoints.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      status: 'Server is running',
    });
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  app.get(WinstonLogger).log(`Application is running on port ${port}`);
}

bootstrap();
