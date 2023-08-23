import supertest from 'supertest';
import { User } from '../../src/libs/types';
import { faker } from '@faker-js/faker';

const signUpMutation = `
mutation($input: SignUpInput!){
  signUp(input: $input){
    token
  }
}
`;

export async function signUp(
  request: supertest.SuperTest<supertest.Test>,
  params?: Partial<User>,
) {
  const user = {
    emailAddress: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...(params || {}),
  };

  await request.post('/graphql').send({
    query: signUpMutation,
    variables: {
      input: user,
    },
  });

  return user;
}
