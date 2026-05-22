/* eslint-disable @typescript-eslint/no-unused-vars */
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from '../../typeorm/entities/user.entity';
import { CreateUserDto } from './dtos/Graphql.CreateUser.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Resolver((of) => User)
export class UserResolver {
  constructor(private userService: UsersService, private constant:ConstantConfig) {}

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  @Query((returns) => [User])
  async users() {
    return this.userService.findAllUsers();
  }

  @Mutation((returns) => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserDto,
  ): Promise<User> {
    try {
      const existingUser = await this.userService.findUserByEmail(
        createUserInput.email,
      );
      if (existingUser) {
        throw new Error(this.constant.error.auth.emailExists);
      }
      const newUser = await this.userService.createUser(createUserInput);
      return newUser;
    } catch (error) {
      throw new Error(`${this.constant.error.auth.createUserError}: ${error.message}`);
    }
  }
}
