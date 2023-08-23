import { fixture, createProductAndGetId, loginAndGetToken } from './fixture';
import { faker } from '@faker-js/faker';
describe('queryProducts', () => {
  const productQuery = `query {
    products(first: 10) {
      edges {
        cursor
        node {
          name
          id
          description
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  `;

  test.concurrent('gets product', async () => {
    const { request, teardown } = await fixture();
    const { token } = await loginAndGetToken(request);

    const productCount = 10;
    for (let i = 0; i < productCount; i++) {
      await createProductAndGetId(request);
    }

    const response = await request
      .post('/graphql')
      .send({
        query: productQuery,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });
});
