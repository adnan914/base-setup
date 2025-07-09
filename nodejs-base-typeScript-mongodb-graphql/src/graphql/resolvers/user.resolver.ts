import { LoginInput, UpdateUserInput, CreateUserInput, Response, UserDocument, UserListInput } from '../../types';
import { GraphQLContext } from '../../types';
import userController from '../../controller/user.controller';

const userResolver = {
  Query: {
    users: (
      _: unknown,
      { input }: { input: UserListInput },
      ctx: GraphQLContext
    ): Promise<Response<UserDocument[]>> => userController.userList(ctx, input),
  },

  Mutation: {
    createUser: (
      _: unknown,
      { input }: { input: CreateUserInput },
      ctx: GraphQLContext
    ): Promise<Response<UserDocument>> => userController.createUser(ctx, input),

    updateProfile: (
      _: unknown,
      { input }: { input: UpdateUserInput },
      ctx: GraphQLContext
    ): Promise<Response<UserDocument>> => userController.updateProfile(ctx, input),

    loginUser: (
      _: unknown,
      { input }: { input: LoginInput },
      ctx: GraphQLContext
    ): Promise<Response<UserDocument>> => userController.loginUser(ctx, input),

    logOut: (
      _: unknown,
      _arg: unknown,
      ctx: GraphQLContext
    ): Promise<Response<void>> => userController.logOut(ctx),
  },
};

export default userResolver;