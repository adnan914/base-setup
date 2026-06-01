import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerOptions } from 'typeorm';
import * as Entities from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: Number(configService.get('DATABASE_PORT') || 5432),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: Object.values(Entities),
        synchronize: false, // Production safe - use migrations instead
        logging: getDatabaseLogging(configService),
        maxQueryExecutionTime: Number(
          configService.get('DATABASE_SLOW_QUERY_MS') || 1000,
        ),
        ssl: getSslConfig(configService),
        extra: {
          application_name:
            configService.get('SERVICE_NAME') || 'focused-backend',
          max: Number(configService.get('DATABASE_POOL_MAX') || 10),
          min: Number(configService.get('DATABASE_POOL_MIN') || 2),
          idleTimeoutMillis: Number(
            configService.get('DATABASE_IDLE_TIMEOUT_MS') || 30000,
          ),
          connectionTimeoutMillis: Number(
            configService.get('DATABASE_CONNECTION_TIMEOUT_MS') || 5000,
          ),
        },
      }),
    }),
  ],
})
export class DatabaseModule {}

function getSslConfig(configService: ConfigService) {
  const databaseSsl = (configService.get<string>('DATABASE_SSL') || 'false')
    .trim()
    .toLowerCase();

  if (databaseSsl !== 'true') {
    return false;
  }

  return { rejectUnauthorized: false };
}

function getDatabaseLogging(configService: ConfigService): LoggerOptions {
  const nodeEnv = configService.get('NODE_ENV');

  if (nodeEnv === 'development') {
    return ['error', 'warn', 'schema', 'migration'] as LoggerOptions;
  }

  return ['error', 'warn'] as LoggerOptions;
}
