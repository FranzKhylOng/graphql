import { fixture } from './fixture';
import { faker } from '@faker-js/faker';

describe('signUp account', () => {
  const userbody = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  const mutation = `
  mutation($input: SignUpInput!){
    signUp(input: $input){
      token
    }
  }
`;

  const variables = {
    input: {
      emailAddress: userbody.email,
      password: userbody.password,
      firstname: userbody.firstName,
      lastname: userbody.lastName,
    },
  };

  test.concurrent('creates user', async () => {
    const { request, teardown } = await fixture();

    const response = await request
      .post('/graphql')
      .send({
        query: mutation,
        variables: variables,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.signUp.token).toBeDefined();

    await teardown();
  });

  test.concurrent('tests for existing user', async () => {
    const { request, teardown } = await fixture();

    await request
      .post('/graphql')
      .send({
        query: mutation,
        variables: variables,
      })
      .expect(200);

    const secondResponse = await request
      .post('/graphql')
      .send({
        query: mutation,
        variables: variables,
      })
      .expect(200);

    expect(secondResponse.body.errors[0].message).toBe('BAD_USER_INPUT');
    expect(secondResponse.body.data).toBeNull();

    await teardown();
  });
});
