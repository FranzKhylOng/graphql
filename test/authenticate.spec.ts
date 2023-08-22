import { fixture } from './fixture';
import { faker } from '@faker-js/faker';

describe('Authentication', () => {
  // Variables for the tests
  const userbody = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  const signUpMutation = `
    mutation($input: SignUpInput!){
      signUp(input: $input){
        token
      }
    }
  `;

  const authenticateMutation = `
    mutation($input: AuthenticateInput!){
      authenticate(input: $input){
        token
      }
    }
  `;

  const signUpVariables = {
    input: {
      emailAddress: userbody.email,
      password: userbody.password,
      firstname: userbody.firstName,
      lastname: userbody.lastName,
    },
  };

  const authenticateVariables = {
    input: {
      emailAddress: userbody.email,
      password: userbody.password,
    },
  };

  test('authenticates user', async () => {
    const { request, teardown } = await fixture();

    await request
      .post('/graphql')
      .send({
        query: signUpMutation,
        variables: signUpVariables,
      })
      .expect(200);

    const response = await request
      .post('/graphql')
      .send({
        query: authenticateMutation,
        variables: authenticateVariables,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.authenticate.token).toBeDefined();

    await teardown();
  });

  test('fails to authenticate with wrong password', async () => {
    const { request, teardown } = await fixture();

    await request
      .post('/graphql')
      .send({
        query: signUpMutation,
        variables: signUpVariables,
      })
      .expect(200);

    const wrongPasswordVariables = {
      input: {
        emailAddress: userbody.email,
        password: 'WrongPassword',
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: authenticateMutation,
        variables: wrongPasswordVariables,
      })
      .expect(200);

    expect(response.body.errors[0].message).toBe('Invalid credentials');
    expect(response.body.data).toBeNull();

    await teardown();
  });
});
