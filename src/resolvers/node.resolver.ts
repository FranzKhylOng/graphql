import { Query, Args, Resolver } from '@nestjs/graphql';
import { ProductService } from '../product/product.service';
import { AccountService } from '../account/account.service';
import { Product, Account, Binary } from 'src/graphql';

@Resolver()
export class NodeResolver {
  constructor(
    private productService: ProductService,
    private accountService: AccountService,
  ) {}

  @Query('node')
  async node(@Args('id') id: Binary): Promise<Product | Account> {
    let entity: Product | Account;

    // Handle the product
    const productDoc = await this.productService.retrieve(id);
    if (productDoc) {
      const productData = productDoc.toObject();
      if (productData._id && !productData.id) {
        productData.id = productData._id; // Convert _id to id
        delete productData._id; // Remove the _id property if needed
      }
    }
    // Handle the account
    if (!entity) {
      const accountDoc = await this.accountService.retrieveById(id);
      if (accountDoc) {
        entity = accountDoc.toObject() as Account;
        // We're directly casting it to Account since we're expecting Mongoose to provide createdAt and updatedAt
      }
    }

    // If still not found, throw an error
    if (!entity) {
      throw new Error('Entity not found');
    }

    return entity;
  }
}
