import { fixture, loginAndGetToken } from './fixture';
import { faker } from '@faker-js/faker';

describe('create product', () => {
  type ProductBodyType = {
    name: string;
    description: string;
    owner?: any;
  };

  let productbody: ProductBodyType = {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
  };

  const createMutation = `mutation($input: CreateProductInput!) {
    createProduct(input:$input){
        id
        name
        description
      }
    }
    `;
  test.concurrent('successful product creation', async () => {
    const { request, teardown } = await fixture();
    const { token, id } = await loginAndGetToken(request);
    productbody = { ...productbody, owner: id };
    const variables = {
      input: productbody,
    };

    const response = await request
      .post('/graphql')
      .send({
        query: createMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createProduct).toMatchObject({
      name: productbody.name,
      description: productbody.description,
    });
    await teardown();
  });

  test.concurrent('invalid access token', async () => {
    const { request, teardown } = await fixture();
    const { id } = await loginAndGetToken(request);
    productbody = { ...productbody, owner: id };
    const variables = {
      input: productbody,
    };

    const token = 'I_am_a_wrong_token';
    const response = await request
      .post('/graphql')
      .send({
        query: createMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.errors[0].message).toBe('Invalid token');
    await teardown();
  });
});
