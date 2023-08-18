import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import {
  Product,
  ProductEdge,
  PageInfo,
  ProductConnection,
} from '../libs/types';
import {
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
  ProductSortInput,
  ProductsFilter,
  Binary,
} from '../graphql';
import { AccountService } from '../account/account.service';
import { pipe, toPairs, fromPairs, map } from 'ramda';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private model: Model<Product>,
    private accountService: AccountService,
  ) {}

  async create(createProductInput: CreateProductInput) {
    const product = await this.model.create(createProductInput);
    const base64Id = Buffer.from(String(product._id)).toString('base64');
    return {
      ...product.toObject(),
      id: base64Id,
    };
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

  async retrieve(filter: FilterQuery<Product>) {
    return this.model.find<Product>(filter, { __v: 0 }).lean();
  }

  retrieveById(id: Binary) {
    return this.model.findById(id);
  }

  async delete(id: DeleteProductInput['id']): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async getProducts({
    first,
    after,
    filter,
    sort,
  }: {
    first: number;
    after: Buffer;
    filter: ProductsFilter;
    sort: ProductSortInput;
  }): Promise<ProductConnection> {
    let query: FilterQuery<Product> = filter || {};

    if (filter) {
      query = pipe(
        toPairs,
        map(([key, value]) => {
          if (key === 'id') return ['_id', toMongooseQueryOperator(value)];
          return [key, toMongooseQueryOperator(value)];
        }),
        fromPairs,
      )(filter);
    }

    const cursorKey = 'cursor';

    if (after) {
      query = { ...query, [cursorKey]: { $gt: after } };
    }

    const products = await this.model
      .find(query)
      .sort({ [cursorKey]: (sort?.createdAt as SortOrder) || 1 })
      .limit(first + 1)
      .exec();

    const hasNextPage = products.length > first;
    const edges: ProductEdge[] = products.slice(0, first).map((product) => {
      return {
        cursor: product.cursor,
        node: {
          ...product.toJSON(),
          id: Buffer.from(product._id.toString()),
        },
      };
    });

    const pageInfo: PageInfo = {
      hasNextPage,
      endCursor: hasNextPage ? edges[edges.length - 1].cursor : null,
    };

    return { edges, pageInfo };
  }
}

function toMongooseQueryOperator(queryOperator) {
  const operators = ['eq', 'ne', 'in', 'nin'];
  return pipe(
    toPairs,
    map(([key, value]) => {
      if (operators.includes(key)) return [`$${key}`, value];
      if (key === 'startsWith') {
        const regex = new RegExp(`^${value}.*$`, 'i');
        return ['name', { $regex: regex, $options: 'i' }];
      }
      if (key === 'contains') {
        const regex = new RegExp(`^.*${value}.*$`, 'i');
        return ['name', { $regex: regex, $options: 'i' }];
      }
      return [key, value];
    }),
    fromPairs,
  )(queryOperator);
}
