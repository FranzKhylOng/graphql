import { fixture } from './fixture';
import { generateUserDetails } from './helpers/generate-user-details';
import { AccountService } from '../src/account/account.service';
import { ProductService } from '../src/product/product.service';
import { generateProductDetails } from './helpers/generate-product-details';

describe('node', () => {
  test.concurrent('node account', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);
    const { token } = await accountService.generateToken({
      emailAddress: account.emailAddress,
    });

    const nodeAccount = `query{
        node(id: "${account.id}"){
             ... on Account{
            firstname
            lastname
            emailAddress
          }
        }
      }`;

    const response = await request
      .post('/graphql')
      .send({
        query: nodeAccount,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.node).toHaveProperty('firstname');
    expect(response.body.data.node).toHaveProperty('lastname');
    expect(response.body.data.node).toHaveProperty('emailAddress');
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });

  test.concurrent('node product', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);
    const productService = module.get<ProductService>(ProductService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);
    const { token } = await accountService.generateToken({
      emailAddress: account.emailAddress,
    });

    const productDetails = generateProductDetails();
    const product = await productService.create({
      ...productDetails,
      owner: Buffer.from(account.id.toString()),
    });
    const nodeProduct = `query{
        node(id: "${product.id}"){
             ... on Product{
            name
            description
          }
        }
      }`;

    const response = await request
      .post('/graphql')
      .send({
        query: nodeProduct,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.node).toHaveProperty('name');
    expect(response.body.data.node).toHaveProperty('description');
    expect(response.body.errors).toBeUndefined();
    await teardown();
  });

  test.concurrent('node wrong id', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);
    const { token } = await accountService.generateToken({
      emailAddress: account.emailAddress,
    });

    const nodeProduct = `query{
        node(id: "wrong_id"){
             ... on Product{
            name
            description
          }
        }
      }`;

    const response = await request
      .post('/graphql')
      .send({
        query: nodeProduct,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.errors).toBeDefined();
    expect(response.body.data).toBeNull();
    await teardown();
  });
});
