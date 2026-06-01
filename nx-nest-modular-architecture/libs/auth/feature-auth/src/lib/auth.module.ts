import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { UsersDataAccessModule } from "@lib/users/feature-users";
import { Token } from "@lib/core/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StorageModule } from "@lib/core/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    UsersDataAccessModule,
    PassportModule,
    StorageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_ACCESS_SECRET"),
        signOptions: {
          expiresIn: configService.get("JWT_ACCESS_EXPIRATION"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
