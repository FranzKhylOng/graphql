import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../libs/types';
import {
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
  ProductSortInput,
  ProductsFilter,
  Binary,
} from '../graphql';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private model: Model<Product>) {}

  async create(product: CreateProductInput) {
    const createdProduct = await this.model.create(product);
    return createdProduct.toObject();
  }

  async update(id: Binary, updates: UpdateProductInput['body']) {
    const bufferId = Buffer.from(id, 'base64');
    const updatedProduct = await this.model.findByIdAndUpdate(
      bufferId,
      updates,
      {
        new: true,
      },
    );
    return updatedProduct.toObject();
  }

  retrieve(id: Binary) {
    return this.model.findById(id);
  }

  async delete(id: DeleteProductInput['id']): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async getProducts(
    first = 10,
    after: Buffer | null,
    filter: ProductsFilter | null,
    sort: ProductSortInput | null,
  ): Promise<any> {
    let query = this.model.find();

    if (filter) {
      query = query.where(filter);
    }
    if (after) {
      const afterNumber = parseInt(after.toString('utf8'), 10);
      query = query.where('cursor').gt(afterNumber);
    }
    if (sort) {
      const mongooseSort = {};
      for (const key in sort) {
        mongooseSort[key] = sort[key] === 1 ? 'asc' : 'desc';
      }
      query = query.sort(mongooseSort);
    }
    query = query.limit(first);

    const items = await query.exec();
    const totalCount = await this.model.countDocuments();

    const startCursor = items.length > 0 ? items[0].cursor : null;
    const endCursor = items.length > 0 ? items[items.length - 1].cursor : null;

    const hasNextPage = items.length === first && endCursor !== null;

    const formattedProducts = items.map((item) => ({
      node: {
        id: item._id,
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      cursor: item.cursor,
    }));

    const pageInfo = {
      startCursor,
      endCursor,
      hasNextPage,
      totalCount,
    };

    return {
      edges: formattedProducts,
      pageInfo,
    };
  }
}
