import { ForbiddenException } from '@nestjs/common';
import { Args, Context, ID, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from '@/features/users/users.service';
import { PublicUser } from '@/database';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Role } from '@/shared/enums';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';
import { MESSAGES } from '@/shared/constants';
import { UserModel } from './user.model';
import { UsersQueryArgs } from './users-query.args';

type RequestUser = {
  id: string;
  roles: Role[];
};

type AuthenticatedGraphqlContext = GraphqlHttpContext & {
  req: GraphqlHttpContext['req'] & {
    user: RequestUser;
  };
};

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserModel, { name: 'me' })
  me(@Context() context: AuthenticatedGraphqlContext): Promise<PublicUser> {
    return this.usersService.findById(context.req.user.id);
  }

  @Query(() => UserModel, { name: 'user' })
  user(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: AuthenticatedGraphqlContext,
  ): Promise<PublicUser> {
    this.assertCanAccessUser(context.req.user, id);
    return this.usersService.findById(id);
  }

  @Query(() => [UserModel], { name: 'users' })
  @Roles(Role.ADMIN)
  users(@Args() args: UsersQueryArgs): Promise<PublicUser[]> {
    return this.usersService.findAll(args);
  }

  private assertCanAccessUser(user: RequestUser, userId: string): void {
    if (user.id !== userId && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException(MESSAGES.USER_ACCESS_FORBIDDEN);
    }
  }
}
