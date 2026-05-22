import { Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configureApp } from '@/configure-app';
import { WinstonLogger } from '@/shared/logger/winston.logger';

type ApiBootstrapOptions = {
  description: string;
  portConfigKey: 'ADMIN_API_PORT' | 'ECOMMERCE_API_PORT';
  title: string;
};

export async function bootstrapApi(
  module: Type<unknown>,
  options: ApiBootstrapOptions,
) {
  const app = await NestFactory.create(module);
  const configService = app.get(ConfigService);
  const logger = app.get(WinstonLogger);

  app.useLogger(logger);
  app.enableShutdownHooks();
  configureApp(app);

  if (configService.get<boolean>('SWAGGER_ENABLED')) {
    const config = new DocumentBuilder()
      .setTitle(options.title)
      .setDescription(options.description)
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.getHttpAdapter().get('/', (_req, res) => {
    res.json({
      status: 'Server is running',
    });
  });

  const port =
    configService.get<number>(options.portConfigKey) ??
    configService.get<number>('PORT') ??
    3000;
  await app.listen(port);

  logger.log(`${options.title} is running on port ${port}`);
}
