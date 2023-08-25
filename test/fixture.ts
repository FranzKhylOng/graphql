import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';

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

  return {
    request: supertest(app.getHttpServer()),
    module,
    teardown: async () => {
      await app.close();
      await mongod.stop();
    },
  };
}
