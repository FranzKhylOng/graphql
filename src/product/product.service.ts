import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../libs/types';
import {
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
} from '../graphql';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private model: Model<Product>) {}

  async create(product: CreateProductInput) {
    return this.model.create(product);
  }

  async update(
    id: UpdateProductInput['id'],
    updates: UpdateProductInput['body'],
  ) {
    return this.model.findByIdAndUpdate(id, updates, {
      new: true,
    });
  }

  retrieve(id: string) {
    return this.model.findById(id);
  }

  delete(id: DeleteProductInput['id']) {
    this.model.findByIdAndDelete(id);
  }
}
