import { fixture } from './fixture';
import { generateUserDetails } from './helpers/generate-user-details';
import { AccountService } from '../src/account/account.service';

describe('Authentication', () => {
  const userbody = generateUserDetails();

  const authenticateMutation = `
    mutation($input: AuthenticateInput!){
      authenticate(input: $input){
        token
      }
    }
  `;

  const authenticateVariables = {
    input: {
      emailAddress: userbody.emailAddress,
      password: userbody.password,
    },
  };

  test('authenticates user', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    await accountService.create(userbody);

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
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    await accountService.create(userbody);

    const wrongPasswordVariables = {
      input: {
        emailAddress: userbody.emailAddress,
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
