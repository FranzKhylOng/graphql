import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async getProducts({
    first,
    after,
    filter,
    sort,
  }: {
    first: number;
    after: string;
    filter: ProductsFilter;
    sort: ProductSortInput;
  }): Promise<ProductConnection> {
    let query = this.model.find();

    // Apply filters
    if (filter) {
      if (filter.id) {
        if (filter.id.eq) {
          query = query.where('_id', Buffer.from(filter.id.eq, 'base64'));
        }
        if (filter.id.ne) {
          query = query.where('_id').ne(Buffer.from(filter.id.ne, 'base64'));
        }
        if (filter.id.in) {
          const inIds = filter.id.in.map((id) => Buffer.from(id, 'base64'));
          query = query.where('_id').in(inIds);
        }
        if (filter.id.nin) {
          const ninIds = filter.id.nin.map((id) => Buffer.from(id, 'base64'));
          query = query.where('_id').nin(ninIds);
        }
      }
      if (filter.name) {
        if (filter.name.eq) {
          query = query.where('name', filter.name.eq);
        }
        if (filter.name.ne) {
          query = query.where('name').ne(filter.name.ne);
        }
        if (filter.name.in) {
          query = query.where('name').in(filter.name.in);
        }
        if (filter.name.nin) {
          query = query.where('name').nin(filter.name.nin);
        }
        if (filter.name.startsWith) {
          query = query.where('name', new RegExp('^' + filter.name.startsWith));
        }
        if (filter.name.contains) {
          query = query.where('name', new RegExp(filter.name.contains));
        }
      }
    }

    // Apply sorting
    if (sort) {
      if (sort && typeof sort.name === 'number') {
        query = query.sort({ name: 1, createdAt: 1 });
      }
    }

    // If 'after' cursor is provided, adjust the query to start after this cursor
    if (after) {
      const afterBuffer = Buffer.from(after, 'base64');
      // Assuming cursor is based on name and created at date
      const [name, createdAt] = afterBuffer.toString('utf8').split('_');
      query = query.where({
        $or: [
          { name: { $gt: name } },
          { name, createdAt: { $gt: new Date(Number(createdAt)) } },
        ],
      });
    }

    const products = await query.limit(first + 1).exec();

    const hasNextPage = products.length > first;
    const edges: ProductEdge[] = products.slice(0, first).map((product) => {
      const cursor = generateCursor(product.name, product.createdAt);
      return {
        cursor,
        node: product,
      };
    });

    const pageInfo: PageInfo = {
      hasNextPage,
      endCursor: hasNextPage ? edges[edges.length - 1].cursor : null,
    };

    return { edges, pageInfo };
  }
  y;
}

type Argument = string | Date;
export function generateCursor(...args: Argument[]): Buffer {
  return Buffer.concat(
    args.map((arg: Argument) => {
      if (arg === null || arg === undefined) {
        throw new Error('null or undefined argument');
      }
      if (arg instanceof Date) {
        const buf = Buffer.alloc(8, 0);
        buf.writeBigUInt64BE(BigInt(arg.getTime()));
        return buf;
      }
      if (typeof arg === 'string') {
        return Buffer.from(arg.substring(0, 8).padEnd(8, ' '), 'utf8');
      }
      throw new Error('argument type is not supported');
    }),
  );
}
