import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@/features/auth/strategies/jwt.strategy';
import { UsersServiceModule } from '@/features/users/users-service.module';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthSessionsService } from './auth-sessions.service';

@Module({
  imports: [
    UsersServiceModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthSessionsService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
