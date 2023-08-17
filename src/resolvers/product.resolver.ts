import {
  Query,
  Args,
  Mutation,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ProductService } from '../product/product.service';
import { AccountService } from '../account/account.service';
import {
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
  ProductSortInput,
  ProductsFilter,
} from '../graphql';
import { Product } from 'src/product/product.model';

@Resolver('Product')
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private accountService: AccountService,
  ) {}

  @Mutation('createProduct')
  async createProduct(@Args('input') createProductInput: CreateProductInput) {
    const product = await this.productService.create(createProductInput);

    const { _id, ...rest } = product;

    return {
      ...rest,
      id: Buffer.from(_id.toString()),
    };
  }

  @Mutation('updateProduct')
  async updateProduct(@Args('input') updateProductInput: UpdateProductInput) {
    const product = await this.productService.update(
      updateProductInput.id,
      updateProductInput.body,
    );
    if (!product) {
      throw new Error('BAD_USER_INPUT: Product not found.');
    }
    const { _id, ...rest } = product;

    return {
      ...rest,
      id: Buffer.from(_id.toString()),
    };
  }

  @Mutation('deleteProduct')
  async deleteProduct(
    @Args('input') deleteProductInput: DeleteProductInput,
  ): Promise<boolean> {
    return this.productService.delete(deleteProductInput.id);
  }

  @ResolveField()
  async owner(@Parent() product: Product) {
    return this.accountService.retrieveById(product.owner);
  }

  @Query('products')
  async products(
    @Args('first', { defaultValue: 10 }) first: number,
    @Args('after') after: Buffer,
    @Args('filter') filter: ProductsFilter,
    @Args('sort') sort: ProductSortInput,
  ) {
    return this.productService.getProducts({
      first,
      after,
      filter,
      sort,
    });
  }
}
