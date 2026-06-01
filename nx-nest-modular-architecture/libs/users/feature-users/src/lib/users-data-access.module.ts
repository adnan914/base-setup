import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog, Role, Token, User } from '@lib/core/database';
import { StorageModule } from '@lib/core/common';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, Role, AuditLog]),
    StorageModule,
  ],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersDataAccessModule {}
