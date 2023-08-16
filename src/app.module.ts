import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { resolve } from 'path';
import { AccountModule } from './account/account.module';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DateTimeResolver, EmailAddressResolver } from 'graphql-scalars';
import { privateDirectiveTransformerFactory } from './libs/private-directive';
import { BinaryScalar } from './scalars/binary.scalar';
import { AccountResolver } from './resolvers/account.resolver';
import { ProductResolver } from './resolvers/product.resolver';
import { NodeResolver } from './resolvers/node.resolver';
import { DataLoaderService } from './libs/data-loader.service';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get('MONGODB_URI') || 'mongodb://localhost:27017',
        };
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        return {
          playground: true,
          typePaths: [resolve(__dirname, './schemas/*.gql')],
          resolvers: {
            DateTime: DateTimeResolver,
            EmailAddress: EmailAddressResolver,
            Binary: BinaryScalar,
          },
          transformSchema(schema) {
            return privateDirectiveTransformerFactory(schema, 'private');
          },
        };
      },
    }),
    AccountModule,
    ProductModule,
  ],
  providers: [
    AccountResolver,
    ProductResolver,
    NodeResolver,
    DataLoaderService,
  ],
})
export class AppModule {}
