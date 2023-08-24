import { faker } from '@faker-js/faker';
import { User } from '../../src/libs/types';

export function generateUserDetails(
  params?: Partial<
    Pick<User, 'emailAddress' | 'firstname' | 'lastname' | 'password'>
  >,
): Pick<User, 'emailAddress' | 'firstname' | 'lastname' | 'password'> {
  return {
    emailAddress: faker.internet.email(),
    password: faker.internet.password(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    ...(params || {}),
  };
}
