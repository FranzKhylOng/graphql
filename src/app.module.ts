import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join, resolve } from 'path';
import { AccountModule } from './account/account.module';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DateTimeResolver, EmailAddressResolver } from 'graphql-scalars';
import { privateDirectiveTransformer } from './libs/private-directive';
import { JwtService } from '@nestjs/jwt';

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
  providers: [AppService, JwtService],
})
export class AppModule {}
