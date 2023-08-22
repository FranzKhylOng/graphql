import { fixture, loginAndGetToken } from './fixture';
import { faker } from '@faker-js/faker';

describe('create product', () => {
  let productbody: ProductBodyType = {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    owner: faker.database.mongodbObjectId(),
  };

  type ProductBodyType = {
    name: string;
    description: string;
    owner?: any;
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

    await teardown();
  });
});
