import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from '@/app.controller';
import { validateEnvironment } from '@/config/env.validation';
import { DatabaseModule, DatabaseThrottlerStorage } from '@/database';
import { StorefrontAuthModule } from '@/features/auth';
import { StorefrontUsersModule } from '@/features/users';
import { ApiThrottlerGuard } from '@/shared/guards/api-throttler.guard';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validate: validateEnvironment,
    }),
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
    SharedModule,
    StorefrontAuthModule,
    StorefrontUsersModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ApiThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class StorefrontApiModule {}

function createGraphqlPath(apiPrefix: string, graphqlPath: string): string {
  const path = [apiPrefix, graphqlPath]
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');

  return `/${path}`;
}
