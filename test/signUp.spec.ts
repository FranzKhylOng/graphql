import { fixture } from './fixture';
import { faker } from '@faker-js/faker';

describe('signUp account', () => {
  test.concurrent('creates user', async () => {
    const { request, teardown } = await fixture();

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
});
