import { fixture } from './fixture';
import { generateUserDetails } from './helpers/generate-user-details';

describe('signUp account', () => {
  const mutation = `
  mutation($input: SignUpInput!){
    signUp(input: $input){
      token
    }
  }
`;
  const userbody = generateUserDetails();
  const variables = {
    input: userbody,
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
