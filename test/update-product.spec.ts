import { fixture, createProductAndGetId, loginAndGetToken } from './fixture';
import { faker } from '@faker-js/faker';
describe('updateProduct', () => {
  const updateMutation = `mutation($input: UpdateProductInput!){
    updateProduct(input: $input){
      name
      id
      createdAt
      description
    }
  }`;

  type ProductBodyType = {
    name: string;
    description: string;
    owner?: any;
  };

  const newproductbody: ProductBodyType = {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
  };
  test.concurrent('updates product', async () => {
    const { request, teardown } = await fixture();
    const { token } = await loginAndGetToken(request);
    const productid = await createProductAndGetId(request);
    const variables = {
      input: {
        id: productid,
        body: {
          name: newproductbody.name,
          description: newproductbody.description,
        },
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: updateMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });

  test.concurrent('invalid token', async () => {
    const { request, teardown } = await fixture();
    const productid = await createProductAndGetId(request);
    const variables = {
      input: {
        id: productid,
        body: {
          name: newproductbody.name,
          description: newproductbody.description,
        },
      },
    };

    const token = 'I_am_a_wrong_token';
    const response = await request
      .post('/graphql')
      .send({
        query: updateMutation,
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
        body: {
          name: newproductbody.name,
          description: newproductbody.description,
        },
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: updateMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors[0].message).toBe('Invalid token');
    await teardown();
  });
});
