import { fixture, createProductAndGetId } from './fixture';
describe('queryProducts', () => {
  test.concurrent('gets product', async () => {
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
    const { request, teardown } = await fixture();

    const productCount = 10;
    for (let i = 0; i < productCount; i++) {
      await createProductAndGetId(request);
    }

    const response = await request
      .post('/graphql')
      .send({
        query: productQuery,
      })
      .expect(200);
    expect(response.body.data.products).toHaveProperty('edges');
    expect(response.body.data.products).toHaveProperty('pageInfo');
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });
});
