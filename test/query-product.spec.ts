import { fixture, createProductAndGetId } from './fixture';
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

  test.concurrent('use after filter', async () => {
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

    const cursor = response.body.data.products.edges[0].cursor;

    const afterQuery = `query {
        products(first: 10, after: "${cursor}") {
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

    const newresponse = await request
      .post('/graphql')
      .send({
        query: afterQuery,
      })
      .expect(200);
    expect(newresponse.body.data.products).toHaveProperty('edges');
    expect(newresponse.body.data.products).toHaveProperty('pageInfo');
    expect(newresponse.body.errors).toBeUndefined();
    await teardown();
  });
});
