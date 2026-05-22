import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const validationOptions = {
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  };

  app.useGlobalPipes(new ValidationPipe(validationOptions));
  await app.listen(process.env.PORT);
}

bootstrap();
