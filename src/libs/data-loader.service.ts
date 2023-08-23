import { AccountService } from '../account/account.service';
import { ProductService } from '../product/product.service';
import { Binary } from '../graphql';
import { AppContext, UserDocument, Product } from '../libs/types';
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import R from 'ramda';
import mongoose from 'mongoose';

@Injectable()
export class DataLoaderService {
  constructor(
    private readonly accountService: AccountService,
    private readonly productService: ProductService,
  ) {}

  dataLoader(
    ctx: AppContext,
    type: 'Account',
  ): DataLoader<Binary, UserDocument>;
  dataLoader(ctx: AppContext, type: 'Product'): DataLoader<Binary, Product>;
  dataLoader(ctx: AppContext, type: string): unknown {
    if (!ctx.dataLoaders) {
      Object.assign(ctx, { dataLoaders: {} });
    }
    if (type === 'Account') {
      let dataLoader = R.path(['dataLoaders', 'Account'], ctx);
      if (!dataLoader) {
        dataLoader = new DataLoader(async (ids: Binary[]) => {
          const accounts = (await this.accountService.retrieve({
            _id: {
              $in: ids,
            },
          })) as UserDocument[];
          return R.map(
            (id) =>
              accounts.find((account) =>
                (account._id as mongoose.Types.ObjectId).equals(id),
              ),
            ids,
          );
        });
      }
      return dataLoader;
    }

    if (type === 'Product') {
      let dataLoader = R.path(['dataLoaders', 'Product'], ctx);
      if (!dataLoader) {
        dataLoader = new DataLoader(async (ids: Binary[]) => {
          const products = (await this.productService.retrieve({
            _id: {
              $in: ids,
            },
          })) as Product[];
          return R.map(
            (id) => products.find((product) => product.id.compare(id) === 0),
            ids,
          );
        });
      }
      return dataLoader;
    }
    throw new Error(`Type ${type} is not supported`);
  }
}
