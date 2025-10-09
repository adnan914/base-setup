/* eslint-disable prettier/prettier */
// auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { GqlAuthGuard } from './gql-auth.guard';
import { ConstantConfig } from 'src/lib/constant/constant.config';
@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      // signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    GqlAuthGuard,
    ConstantConfig
  ],
  exports: [AuthService],
})
export class AuthModule {}
