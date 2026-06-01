import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validateEnv } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: ['.env'],
      isGlobal: true,
      load: [configuration],
      validate: validateEnv
    })
  ],
  exports: [ConfigModule]
})
export class AppConfigModule {}
