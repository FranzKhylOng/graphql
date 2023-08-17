import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.model';
import { ProductService } from './product.service';
import { ProductResolver } from '../resolvers/product.resolver';
import { AccountModule } from '../account/account.module';
import { DataLoaderService } from 'src/libs/data-loader.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AccountModule,
  ],
  providers: [ProductService, ProductResolver, DataLoaderService],
  exports: [ProductService],
})
export class ProductModule {}
