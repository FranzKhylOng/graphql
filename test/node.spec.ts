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

    expect(response.body.data.node).toHaveProperty('firstname');
    expect(response.body.data.node).toHaveProperty('lastname');
    expect(response.body.data.node).toHaveProperty('emailAddress');
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });

  test.concurrent('node product', async () => {
    const { request, teardown } = await fixture();
    const productid = await createProductAndGetId(request);
    const { token } = await loginAndGetToken(request);

    const nodeProduct = `query{
        node(id: "${productid}"){
             ... on Product{
            name
            description
          }
        }
      }`;

    const response = await request
      .post('/graphql')
      .send({
        query: nodeProduct,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.node).toHaveProperty('name');
    expect(response.body.data.node).toHaveProperty('description');
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });

  test.concurrent('node wrong id', async () => {
    const { request, teardown } = await fixture();
    const { token } = await loginAndGetToken(request);

    const nodeProduct = `query{
        node(id: "wrong_id"){
             ... on Product{
            name
            description
          }
        }
      }`;

    const response = await request
      .post('/graphql')
      .send({
        query: nodeProduct,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.errors).toBeDefined();
    expect(response.body.data).toBeNull();
    await teardown();
  });
});
