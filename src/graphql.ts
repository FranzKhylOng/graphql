/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class SignUpInput {
  emailAddress: EmailAddress;
  firstname: string;
  lastname: string;
  password: string;
}

export class AuthenticateInput {
  emailAddress: EmailAddress;
  password: string;
}

export class BinaryQueryOperatorInput {
  eq?: Nullable<Binary>;
  ne?: Nullable<Binary>;
  in?: Nullable<Binary[]>;
  nin?: Nullable<Binary[]>;
}

export class StringQueryOperatorInput {
  eq?: Nullable<string>;
  ne?: Nullable<string>;
  in?: Nullable<string[]>;
  nin?: Nullable<string[]>;
  startsWith?: Nullable<string>;
  contains?: Nullable<string>;
}

export class CreateProductInput {
  name: string;
  description: string;
  owner: Binary;
}

export class UpdateProductInput {
  id: Binary;
  body: UpdateProductBody;
}

export class UpdateProductBody {
  name?: Nullable<string>;
  description?: Nullable<string>;
}

export class DeleteProductInput {
  id: Binary;
}

export class ProductsFilter {
  id?: Nullable<BinaryQueryOperatorInput>;
  name?: Nullable<StringQueryOperatorInput>;
}

export class ProductSortInput {
  createdAt?: Nullable<number>;
}

export interface Node {
  id: Binary;
}

export class Account implements Node {
  id: Binary;
  firstname: string;
  lastname: string;
  emailAddress: EmailAddress;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export abstract class IMutation {
  abstract signUp(input: SignUpInput): Authentication | Promise<Authentication>;

  abstract authenticate(
    input: AuthenticateInput,
  ): Authentication | Promise<Authentication>;

  abstract createProduct(input: CreateProductInput): Product | Promise<Product>;

  abstract updateProduct(input: UpdateProductInput): Product | Promise<Product>;

  abstract deleteProduct(input: DeleteProductInput): boolean | Promise<boolean>;
}

export abstract class IQuery {
  abstract me(): Account | Promise<Account>;

  abstract node(id: Binary): NodeResult | Promise<NodeResult>;

  abstract products(
    first?: Nullable<number>,
    after?: Nullable<Binary>,
    filter?: Nullable<ProductsFilter>,
    sort?: Nullable<ProductSortInput>,
  ): ProductConnection | Promise<ProductConnection>;
}

export class Authentication {
  token: string;
}

export class Product implements Node {
  id: Binary;
  name: string;
  description: string;
  owner: Binary;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class ProductConnection {
  edges: ProductEdge[];
  pageInfo: PageInfo;
}

export class PageInfo {
  hasNextPage: boolean;
  endCursor?: Nullable<Binary>;
}

export class ProductEdge {
  cursor: Binary;
  node: Product;
}

export type Binary = any;
export type EmailAddress = any;
export type DateTime = any;
export type NodeResult = Account | Product;
type Nullable<T> = T | null;
