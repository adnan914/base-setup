import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from '@/features/auth/strategies/jwt.strategy';
import { UsersModule } from '@/features/users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthSessionsService } from './auth-sessions.service';

@Module({
  imports: [
    UsersModule,
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
  providers: [AuthService, AuthSessionsService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
