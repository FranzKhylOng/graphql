import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join, resolve } from 'path';
import { AccountModule } from './account/account.module';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DateTimeResolver, EmailAddressResolver } from 'graphql-scalars';
import { privateDirectiveTransformerFactory } from './libs/privatedirective';
import { BinaryScalar } from './scalars/binary.scalar';
import { AccountResolver } from './resolvers/account.resolver';
import { ProductResolver } from './resolvers/product.resolver';
import { NodeResolver } from './resolvers/node.resolver';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nestjs'),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        return {
          playground: true,
          typePaths: [resolve(__dirname, './schemas/*.gql')],
          definitions: {
            path: join(process.cwd(), 'src/graphql.ts'),
          },
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
  providers: [AccountResolver, ProductResolver, NodeResolver],
})
export class AppModule {}
