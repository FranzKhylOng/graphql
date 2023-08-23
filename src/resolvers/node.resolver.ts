import { Resolver, ResolveField } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';
import { ProductService } from '../product/product.service';
import { User } from '../account/account.model';
import { Product } from '../product/product.model';

@Resolver('Node')
export class NodeResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly productService: ProductService,
  ) {}

  @ResolveField()
  async __resolveType(obj: User | Product) {
    if ('emailAddress' in obj) {
      return 'Account';
    }
    if ('price' in obj) {
      return 'Product';
    }
    return null;
  }
}
