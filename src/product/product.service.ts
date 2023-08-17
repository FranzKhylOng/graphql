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
    after: Buffer;
    filter: ProductsFilter;
    sort: ProductSortInput;
  }): Promise<ProductConnection> {
    // if (filter) {
    //   if (filter.id) {
    //     if (filter.id.eq) {
    //       query = query.where('_id', Buffer.from(filter.id.eq, 'base64'));
    //     }
    //     if (filter.id.ne) {
    //       query = query.where('_id').ne(Buffer.from(filter.id.ne, 'base64'));
    //     }
    //     if (filter.id.in) {
    //       const inIds = filter.id.in.map((id) => Buffer.from(id, 'base64'));
    //       query = query.where('_id').in(inIds);
    //     }
    //     if (filter.id.nin) {
    //       const ninIds = filter.id.nin.map((id) => Buffer.from(id, 'base64'));
    //       query = query.where('_id').nin(ninIds);
    //     }
    //   }
    //   if (filter.name) {
    //     if (filter.name.eq) {
    //       query = query.where('name', filter.name.eq);
    //     }
    //     if (filter.name.ne) {
    //       query = query.where('name').ne(filter.name.ne);
    //     }
    //     if (filter.name.in) {
    //       query = query.where('name').in(filter.name.in);
    //     }
    //     if (filter.name.nin) {
    //       query = query.where('name').nin(filter.name.nin);
    //     }
    //     if (filter.name.startsWith) {
    //       query = query.where('name', new RegExp('^' + filter.name.startsWith));
    //     }
    //     if (filter.name.contains) {
    //       query = query.where('name', new RegExp(filter.name.contains));
    //     }
    //   }
    // }
    let query: FilterQuery<Product> = filter || {};
    const cursorKey = 'cursor';

    if (after) {
      query = { ...query, [cursorKey]: { $gt: after } };
    }

    const products = await this.model
      .find(query)
      .sort({ [cursorKey]: (sort.createdAt as SortOrder) || 1 })
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
