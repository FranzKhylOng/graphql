import supertest from 'supertest';
import { Product } from '../../src/libs/types';
import { faker } from '@faker-js/faker';

const createProductMutation = `
mutation($input: CreateProductInput!) {
  createProduct(input:$input){
      id
  }
}
`;

export async function createProduct(
  request: supertest.SuperTest<supertest.Test>,
  params: Partial<Omit<Product, 'owner'>> &
    Pick<Product, 'owner'> & { token: string },
) {
  const response = await request
    .post('/graphql')
    .send({
      query: createProductMutation,
      variables: {
        name: faker.commerce.product(),
        decription: faker.commerce.productDescription(),
        ...params,
      },
    })
    .set('Authorization', `Bearer ${params.token}`)
    .expect(200);

  return response.body.data?.createProduct.id;
}
