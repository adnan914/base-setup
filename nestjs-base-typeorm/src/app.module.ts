import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '@/features/auth/auth.module';
import { UsersModule } from '@/features/users/users.module';
import { SharedModule } from '@/shared/shared.module';
import { AppController } from '@/app.controller';

import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from './config/db.config';
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`]
    }),

    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
    TypeOrmModule.forRoot(dbConfig),
    // Feature modules
    AuthModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
