import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProductService } from '../product/product.service';
import {
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
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
}
