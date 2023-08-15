import { Resolver, Query, Args, ResolveField } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';
import { ProductService } from '../product/product.service';
import { User } from '../account/account.model';
import { Product } from '../product/product.model';

@Resolver('NodeResult')
export class NodeResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly productService: ProductService,
  ) {}

  @Query(() => 'NodeResult', { name: 'node' })
  async getNode(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User | Product> {
    try {
      const account = await this.accountService.retrieveById(id);
      if (account) {
        return account;
      }
    } catch (e) {
      console.error(e.message);
    }

    const product = await this.productService.retrieve(id);
    if (product) {
      return product;
    }

    throw new Error('Entity not found for the provided ID.');
  }

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
