import { fixture } from './fixture';
import { generateProductDetails } from './helpers/generate-product-details';
import { AccountService } from '../src/account/account.service';
import { generateUserDetails } from './helpers/generate-user-details';

describe('create product', () => {
  const createMutation = `mutation($input: CreateProductInput!) {
    createProduct(input:$input){
        id
        name
        description
      }
    }
    `;
  test.only('successful product creation', async () => {
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);

    const { token } = await accountService.generateToken({
      emailAddress: account.emailAddress,
    });

    const productbody = {
      ...generateProductDetails(),
      owner: account.id.toString(),
    };

    const variables = {
      input: productbody,
    };

    console.log(variables);
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
    const { request, module, teardown } = await fixture();
    const accountService = module.get<AccountService>(AccountService);

    const userDetails = generateUserDetails();
    const account = await accountService.create(userDetails);

    const token = 'Wrong_Token';

    const productbody = {
      ...generateProductDetails(),
      owner: account.id.toString(),
    };

    const variables = {
      input: productbody,
    };

    console.log(variables);
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
});
