import { fixture } from './fixture';
import { generateUserDetails } from './helpers/generate-user-details';
import { AccountService } from '../src/account/account.service';
import { ProductService } from '../src/product/product.service';
import { generateProductDetails } from './helpers/generate-product-details';
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
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);
    const productService = module.get<ProductService>(ProductService);

    const productCount = 10;
    for (let i = 0; i < productCount; i++) {
      const userDetails = generateUserDetails();
      const account = await accountService.create(userDetails);

      const productDetails = generateProductDetails();
      await productService.create({
        ...productDetails,
        owner: Buffer.from(account.id.toString()),
      });
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
