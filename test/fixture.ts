import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
// import { JwtService } from '@nestjs/jwt';
// import { ProductService } from '../src/product/product.service';
// import { UserService } from '../src/user/user.service';
import { faker } from '@faker-js/faker';
import * as supertest from 'supertest';

//queries and variables to be use in functions
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

  return response.body.data.authenticate.token;
}

export async function signUpAndGetUserId(request) {
  const signUpResponse = await request.post('/graphql').send({
    query: signUpMutation,
    variables: signUpVariables,
  });

  const token = signUpResponse.body.data.signUp.token;

  const meResponse = await request
    .post('/graphql')
    .send({ query: meQuery })
    .set('Authorization', `Bearer ${token}`);

  return meResponse.body.data.me.id;
}
