import { fixture } from './fixture';
import { AccountService } from '../src/account/account.service';
import { generateUserDetails } from './helpers/generate-user-details';
describe('me', () => {
  const query = `query{
        me{
          firstname
          lastname
          emailAddress
          id
        }
      }`;
  test.concurrent('me query', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);
    const { token } = await accountService.generateToken({
      emailAddress: account.emailAddress,
    });

    console.log(token);
    const response = await request
      .post('/graphql')
      .send({
        query: query,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const user = response.body.data.me;
    expect(user).toHaveProperty('firstname');
    expect(user).toHaveProperty('lastname');
    expect(user).toHaveProperty('emailAddress');
    expect(user).toHaveProperty('id');

    await teardown();
  });

  test.concurrent('invalid bearer token', async () => {
    const { request, teardown } = await fixture();
    const token = 'I_am_a_wrong_token';

    const response = await request
      .post('/graphql')
      .send({
        query: query,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.errors[0].message).toBe('Invalid token');

    await teardown();
  });
});
