import { fixture, loginAndGetToken } from './fixture';

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
    const { request, teardown } = await fixture();
    const token = await loginAndGetToken(request);

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
