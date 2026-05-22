import { Context, Query, Resolver } from '@nestjs/graphql';
import { PublicUser } from '@/database';
import { GraphqlHttpContext } from '@/shared/graphql/graphql-http-context';
import { Role } from '@/shared/enums';
import { UsersService } from '../users.service';
import { UserModel } from './user.model';

type StorefrontGraphqlContext = GraphqlHttpContext & {
  req: GraphqlHttpContext['req'] & {
    user: {
      id: string;
      roles: Role[];
    };
  };
};

@Resolver(() => UserModel)
export class StorefrontUsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserModel, { name: 'me' })
  me(@Context() context: StorefrontGraphqlContext): Promise<PublicUser> {
    return this.usersService.findById(context.req.user.id);
  }
}
