import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { User, UserRole } from '../../typeorm/entities/user.entity';

export const UsersFactory = setSeederFactory(User, (faker: Faker) => {
  const user = new User();
  user.first_name = faker.person.firstName();
  user.last_name = faker.person.lastName();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.terms_agreed_at = faker.date.past();
  user.photo_url = faker.internet.avatar();
  user.verified = faker.datatype.boolean().toString();
  user.bio = faker.lorem.sentence();
  user.role = faker.helpers.arrayElement(Object.values(UserRole));
  user.isActive = faker.datatype.boolean();
  return user;
});
