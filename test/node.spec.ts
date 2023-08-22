import { fixture, createProductAndGetId, loginAndGetToken } from './fixture';
describe('node', () => {
  test.concurrent('node account', async () => {
    const { request, teardown } = await fixture();
    const { token, id } = await loginAndGetToken(request);

    const nodeAccount = `query{
        node(id: "${id}"){
             ... on Account{
            firstname
            lastname
            emailAddress
          }
        }
      }`;

    const response = await request
      .post('/graphql')
      .send({
        query: nodeAccount,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });
});
