import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import {
  Product,
  ProductEdge,
  PageInfo,
  ProductConnection,
  UserDocument,
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

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private model: Model<Product>,
    private accountService: AccountService,
  ) {}

  async create(createProductInput: CreateProductInput) {
    return this.model.create(createProductInput);
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
    after: string;
    filter: ProductsFilter;
    sort: ProductSortInput;
  }): Promise<ProductConnection> {
    let query = this.model.find();

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

    if (sort) {
      query = query.sort(sort as Record<string, SortOrder>);
    }

    if (after) {
      const decodedJson = Buffer.from(after, 'base64').toString('utf8');
      const structuredData: Array<{ type: string; value: string | number }> =
        JSON.parse(decodedJson);

      let productName: string | undefined;
      let creationTimestamp: number | undefined;

      structuredData.forEach((data) => {
        if (data.type === 'string') {
          productName = data.value as string;
        } else if (data.type === 'date') {
          creationTimestamp = data.value as number;
        }
      });

      if (productName && creationTimestamp) {
        query = query.where({
          $or: [
            { name: { $gt: productName } },
            {
              name: productName,
              createdAt: { $gt: new Date(creationTimestamp) },
            },
          ],
        });
      }
    }

    query = query.populate('owner');

    const products = await query.limit(first + 1).exec();

    const hasNextPage = products.length > first;
    const edges: ProductEdge[] = products.slice(0, first).map((product) => {
      const cursor = generateCursor(product.name, product.createdAt);
      return {
        cursor,
        node: {
          ...product.toObject(),
          id: Buffer.from(product._id.toString()),
          owner: {
            id: Buffer.from(product.owner._id.toString()),
            firstname: product.owner.firstname,
            lastname: product.owner.lastname,
            emailAddress: product.owner.emailAddress,
          } as UserDocument,
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

type Argument = string | Date;

export function generateCursor(...args: Argument[]): string {
  const structuredData: Array<{ type: string; value: string | number }> =
    args.map((arg: Argument) => {
      if (arg instanceof Date) {
        return { type: 'date', value: arg.getTime() };
      }
      if (typeof arg === 'string') {
        return { type: 'string', value: arg };
      }
      throw new Error('Unsupported argument type');
    });

  const jsonString = JSON.stringify(structuredData);

  const base64Encoded = Buffer.from(jsonString).toString('base64');

  return base64Encoded;
}
