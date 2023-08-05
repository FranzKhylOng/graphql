import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProductService } from '../product/product.service';
import {
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
  ProductSortInput,
  ProductsFilter,
} from '../graphql';

@Resolver('Product')
export class ProductResolver {
  constructor(private productService: ProductService) {}

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

  @Query('products')
  async products(
    @Args('first', { defaultValue: 10 }) first: number,
    @Args('after') after: string,
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
