import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
// import { JwtService } from '@nestjs/jwt';
// import { ProductService } from '../src/product/product.service';
// import { UserService } from '../src/user/user.service';
// import { faker } from '@faker-js/faker';
import * as supertest from 'supertest';

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
