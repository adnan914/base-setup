import { NatsEventPublisher } from '@ecommerce/common';
import { GRPC_PACKAGES } from '@ecommerce/contracts';
import { DatabaseModule } from '@ecommerce/database';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { AuthGrpcController } from './auth.grpc-controller';
import { AuthService } from './auth.service';
import { TokenRepository } from './token.repository';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'USER_PACKAGE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGES.user,
            protoPath: join(process.cwd(), 'proto/user.proto'),
            url: config.getOrThrow<string>('grpc.userUrl')
          }
        })
      }
    ])
  ],
  controllers: [AuthGrpcController],
  providers: [AuthService, TokenRepository, NatsEventPublisher]
})
export class AuthModule {}
