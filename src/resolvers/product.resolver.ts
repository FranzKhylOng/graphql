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
    await this.productService.create(createProductInput);
  }

  @Mutation('updateProduct')
  async updateProduct(@Args('input') updateProductInput: UpdateProductInput) {
    await this.productService.update(updateProductInput.id, updateProductInput);
  }

  @Mutation('deleteProduct')
  async deleteProduct(@Args('input') deleteProductInput: DeleteProductInput) {
    this.productService.delete(deleteProductInput.id);
  }
}
