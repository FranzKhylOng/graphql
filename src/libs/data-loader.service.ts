import { AccountService } from '../account/account.service';
import { ProductService } from '../product/product.service';
import { Binary } from '../graphql';
import { AppContext, UserType, Product } from '../libs/types';
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import R from 'ramda';

@Injectable()
export class DataLoaderService {
  constructor(
    private readonly accountService: AccountService,
    private readonly productService: ProductService,
  ) {}

  dataLoader(ctx: AppContext, type: 'Account'): DataLoader<Binary, UserType>;
  dataLoader(ctx: AppContext, type: 'Product'): DataLoader<Binary, Product>;
  dataLoader(ctx: AppContext, type: string): unknown {
    if (!ctx.dataLoaders) {
      Object.assign(ctx, { dataLoaders: {} });
    }
    if (type === 'Account') {
      let dataLoader = R.path(['dataLoaders', 'Account'], ctx);
      if (!dataLoader) {
        dataLoader = new DataLoader(async (keys: Binary[]) => {
          const list = await this.accountService.retrieveById({
            id: {
              $in: keys,
            },
          });
          const map = new Map(R.map((item) => [item.id, item], list));
          return R.map((key) => map.get(key), keys);
        });
      }
      return dataLoader;
    }

    if (type === 'Product') {
      let dataLoader = R.path(['dataLoaders', 'Product'], ctx);
      if (!dataLoader) {
        dataLoader = new DataLoader(async (keys: Binary[]) => {
          const list = await this.productService.retrieve({
            id: {
              $in: keys,
            },
          });
          const map = new Map(R.map((item) => [item.id, item], list));
          return R.map((key) => map.get(key), keys);
        });
      }
      return dataLoader;
    }
    throw new Error(`Type ${type} is not supported`);
  }
}
