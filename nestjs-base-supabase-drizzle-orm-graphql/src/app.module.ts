import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import { AuthModule } from '@/features/auth/auth.module';
import { UsersModule } from '@/features/users/users.module';
import { SharedModule } from '@/shared/shared.module';
import { AppController } from '@/app.controller';
import { DatabaseModule, DatabaseThrottlerStorage } from '@/database';

import { APP_GUARD } from '@nestjs/core';
import { validateEnvironment } from '@/config/env.validation';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { ApiThrottlerGuard } from '@/shared/guards/api-throttler.guard';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validate: validateEnvironment,
    }),

    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ThrottlerModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DatabaseThrottlerStorage],
      useFactory: (storage: DatabaseThrottlerStorage) => ({
        storage,
        throttlers: [{ ttl: 60000, limit: 100 }],
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: true,
        sortSchema: true,
        path: createGraphqlPath(
          configService.getOrThrow<string>('API_PREFIX'),
          configService.getOrThrow<string>('GRAPHQL_PATH'),
        ),
        graphiql: configService.getOrThrow<boolean>('GRAPHQL_GRAPHIQL_ENABLED'),
        introspection: configService.getOrThrow<boolean>(
          'GRAPHQL_INTROSPECTION_ENABLED',
        ),
        context: ({ req, res }: GraphqlHttpContext) => ({ req, res }),
      }),
    }),
    DatabaseModule,
    // Feature modules
    AuthModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

function createGraphqlPath(apiPrefix: string, graphqlPath: string): string {
  const path = [apiPrefix, graphqlPath]
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');

  return `/${path}`;
}
