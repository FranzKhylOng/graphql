import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';
import { ProductService } from '../product/product.service';
import { User } from '../account/account.model';
import { Product } from '../product/product.model';

@Resolver('NodeResult') // Using Account as a placeholder.
export class NodeResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly productService: ProductService,
  ) {}

  @Query(() => User, { name: 'node' }) // Again, User is a placeholder.
  async getNode(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User | Product> {
    // Try to retrieve an account by the given ID
    console.log('getNode resolver called with ID:', id);
    const account = await this.accountService.retrieveById(id);
    if (account) {
      return account;
    }

    // If not found, try to retrieve a product by the given ID
    // NOTE: The method name 'retrieveProductById' is assumed and might need adjustment
    const product = await this.productService.retrieve(id);
    if (product) {
      return product as Product;
    }

    // If neither account nor product is found, throw an error
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
    return null; // GraphQLError is thrown if no type can be resolved
  }
}
