import { fixture } from './fixture';
import { generateUserDetails } from './helpers/generate-user-details';
import { AccountService } from '../src/account/account.service';
import { ProductService } from '../src/product/product.service';
import { generateProductDetails } from './helpers/generate-product-details';

describe('updateProduct', () => {
  const updateMutation = `mutation($input: UpdateProductInput!){
    updateProduct(input: $input){
      name
      id
      createdAt
      description
    }
  }`;

  test.concurrent('updates product', async () => {
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

    const newProduct = generateProductDetails();

    const variables = {
      input: {
        id: product.id,
        body: newProduct,
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
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);
    const productService = module.get<ProductService>(ProductService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);
    const token = 'Wrong_Token';

    const productDetails = generateProductDetails();
    const product = await productService.create({
      ...productDetails,
      owner: Buffer.from(account.id.toString()),
    });

    const newProduct = generateProductDetails();

    const variables = {
      input: {
        id: product.id,
        body: newProduct,
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

  test.concurrent('wrong product id', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);
    const productService = module.get<ProductService>(ProductService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);
    const { token } = await accountService.generateToken({
      emailAddress: account.emailAddress,
    });

    const productDetails = generateProductDetails();
    await productService.create({
      ...productDetails,
      owner: Buffer.from(account.id.toString()),
    });

    const newProduct = generateProductDetails();

    const variables = {
      input: {
        id: 'wrong_id',
        body: newProduct,
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
});
