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
    expect(response.body.data.deleteProduct).toBe(true);
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });

  test.concurrent('invalid token', async () => {
    const { request, teardown } = await fixture();
    const productid = await createProductAndGetId(request);
    const variables = {
      input: {
        id: productid,
      },
    };

    const token = 'I_am_a_wrong_token';
    const response = await request
      .post('/graphql')
      .send({
        query: deleteMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors[0].message).toBe('Invalid token');
    await teardown();
  });

  test.concurrent('wrong product id', async () => {
    const { request, teardown } = await fixture();
    const { token } = await loginAndGetToken(request);
    const productid = 'i_am_a_wrong_id';
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
    expect(response.body.errors[0].message).toBe('Invalid token');
    await teardown();
  });
});
