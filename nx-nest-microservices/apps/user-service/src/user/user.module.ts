import { DatabaseModule } from '@ecommerce/database';
import { Module } from '@nestjs/common';
import { UserGrpcController } from './user.grpc-controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserGrpcController],
  providers: [UserRepository, UserService],
  exports: [UserService]
})
export class UserModule {}
