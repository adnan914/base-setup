/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entities/user.entity';
import { UsersService } from './users.service';
import { UserResolver } from './users.resolver';
import { AuthModule } from '../auth/auth.module';
import { LibsModule } from 'src/lib/Utils/lib.module';
import { ConstantModule } from 'src/lib/constant/constant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => LibsModule),
    ConstantModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UserResolver],
  exports: [UsersService],
})
export class UsersModule {}
