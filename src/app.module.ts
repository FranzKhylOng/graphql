import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join, resolve } from 'path';
import { AccountModule } from './account/account.module';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DateTimeResolver, EmailAddressResolver } from 'graphql-scalars';
import { privateDirectiveTransformer } from './libs/privatedirective';
import { JwtService } from '@nestjs/jwt';
import { BinaryScalar } from './scalars/binary.scalar';
import { AccountResolver } from './resolvers/account.resolver';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nestjs'),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        // transformations

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
          schemaDirectives: {
            private: privateDirectiveTransformer,
          },
        };
      },
    }),
    AccountModule,
    ProductModule,
  ],
  providers: [JwtService, AccountResolver],
})
export class AppModule {}
