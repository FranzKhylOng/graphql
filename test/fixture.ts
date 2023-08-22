import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
// import { JwtService } from '@nestjs/jwt';
// import { ProductService } from '../src/product/product.service';
// import { UserService } from '../src/user/user.service';
import { faker } from '@faker-js/faker';
import * as supertest from 'supertest';

//queries and variables to be used in functions
const signUpMutation = `
mutation($input: SignUpInput!){
  signUp(input: $input){
    token
  }
}
`;

const authenticateMutation = `
mutation($input: AuthenticateInput!){
  authenticate(input: $input){
    token
  }
}
`;

const meQuery = `
query {
  me {
    id
  }
}
`;

const createProductMutation = `
mutation($input: CreateProductInput!) {
  createProduct(input:$input){
      id
  }
}
`;

const userbody = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
};

const signUpVariables = {
  input: {
    emailAddress: userbody.email,
    password: userbody.password,
    firstname: userbody.firstName,
    lastname: userbody.lastName,
  },
};

export async function fixture() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const config = {
    MONGODB_URI: uri,
  };

  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: jest.fn((key) => {
        return config[key] || null;
      }),
    })
    .compile();

  const app = module.createNestApplication();

  await app.listen(0);
  const response = await supertest(app.getHttpServer());

  return {
    request: response,
    module,
    teardown: async () => {
      await app.close();
      await mongod.stop();
    },
  };
}

export async function loginAndGetToken(request) {
  const authenticateVariables = {
    input: {
      emailAddress: userbody.email,
      password: userbody.password,
    },
  };

  await request.post('/graphql').send({
    query: signUpMutation,
    variables: signUpVariables,
  });

  const response = await request.post('/graphql').send({
    query: authenticateMutation,
    variables: authenticateVariables,
  });

  const token = response.body.data.authenticate.token;

  const meResponse = await request
    .post('/graphql')
    .send({ query: meQuery })
    .set('Authorization', `Bearer ${token}`);

  const id = meResponse.body.data.me.id;

  return {
    token: token,
    id: id,
  };
}

export async function createProductAndGetId(request) {
  type ProductBodyType = {
    name: string;
    description: string;
    owner?: any;
  };

  let productbody: ProductBodyType = {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
  };

  const { token, id } = await loginAndGetToken(request);
  productbody = { ...productbody, owner: id };
  const variables = {
    input: productbody,
  };

  const response = await request
    .post('/graphql')
    .send({
      query: createProductMutation,
      variables: variables,
    })
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return response.body.data.createProduct.id;
}
