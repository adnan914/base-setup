import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
