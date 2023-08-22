import { fixture, createProductAndGetId, loginAndGetToken } from './fixture';

describe('deleteProduct', () => {
  const deleteMutation = `mutation($input: DeleteProductInput!){
        deleteProduct(input: $input)
      }`;
  test.concurrent('deletes product', async () => {
    const { request, teardown } = await fixture();
    const { token } = await loginAndGetToken(request);
    const productid = await createProductAndGetId(request);
    const variables = {
      input: {
        id: productid,
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: deleteMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });
});
