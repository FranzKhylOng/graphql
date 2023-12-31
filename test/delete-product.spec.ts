import { fixture } from './fixture';
import { generateUserDetails } from './helpers/generate-user-details';
import { AccountService } from '../src/account/account.service';
import { ProductService } from '../src/product/product.service';
import { generateProductDetails } from './helpers/generate-product-details';
import mongoose from 'mongoose';

describe('deleteProduct', () => {
  const deleteMutation = `mutation($input: DeleteProductInput!){
        deleteProduct(input: $input)
      }`;
  test.concurrent('deletes product', async () => {
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
      owner: account.id.toString(),
    });

    const variables = {
      input: {
        id: product.base64URLID,
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: deleteMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.data.deleteProduct).toBe(true);
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
      owner: account.id.toString(),
    });

    const variables = {
      input: {
        id: product.base64URLID,
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: deleteMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.errors[0].message).toBe('Invalid token');
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
      owner: account.id.toString(),
    });

    const variables = {
      input: {
        id: Buffer.from(new mongoose.Types.ObjectId().toString()).toString(
          'base64url',
        ),
      },
    };

    const response = await request
      .post('/graphql')
      .send({
        query: deleteMutation,
        variables: variables,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.data.deleteProduct).toBe(false);
    await teardown();
  });
});
