import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Role, Status } from '@/shared/enums';

registerEnumType(Role, { name: 'Role' });
registerEnumType(Status, { name: 'UserStatus' });

@ObjectType('User')
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [Role])
  roles: Role[];

  @Field(() => Status)
  status: Status;

  @Field(() => String, { nullable: true })
  profileImg: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastLoginAt: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
