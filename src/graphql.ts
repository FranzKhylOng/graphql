
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface SignUpInput {
    emailAddress: EmailAddress;
    firstname: string;
    lastname: string;
    password: string;
}

export interface AuthenticateInput {
    emailAddress: EmailAddress;
    password: string;
}

export interface BinaryQueryOperatorInput {
    eq?: Nullable<Binary>;
    ne?: Nullable<Binary>;
    in?: Nullable<Binary[]>;
    nin?: Nullable<Binary[]>;
}

export interface StringQueryOperatorInput {
    eq?: Nullable<string>;
    ne?: Nullable<string>;
    in?: Nullable<string[]>;
    nin?: Nullable<string[]>;
    startsWith?: Nullable<string>;
    contains?: Nullable<string>;
}

export interface AccountInput {
    id: Binary;
    emailAddress: string;
}

export interface CreateProductInput {
    name: string;
    description: string;
    owner: AccountInput;
}

export interface UpdateProductInput {
    id: Binary;
    body: UpdateProductBody;
}

export interface UpdateProductBody {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export interface DeleteProductInput {
    id: Binary;
}

export interface ProductsFilter {
    id?: Nullable<BinaryQueryOperatorInput>;
    name?: Nullable<StringQueryOperatorInput>;
}

export interface ProductSortInput {
    name?: Nullable<number>;
    createdAt?: Nullable<number>;
}

export interface Node {
    id: Binary;
}

export interface Account extends Node {
    id: Binary;
    firstname: string;
    lastname: string;
    emailAddress: EmailAddress;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface IMutation {
    signUp(input: SignUpInput): Authentication | Promise<Authentication>;
    authenticate(input: AuthenticateInput): Authentication | Promise<Authentication>;
    createProduct(input: CreateProductInput): Product | Promise<Product>;
    updateProduct(input: UpdateProductInput): Product | Promise<Product>;
    deleteProduct(input: DeleteProductInput): boolean | Promise<boolean>;
}

export interface IQuery {
    me(): Account | Promise<Account>;
    node(id: Binary): Node | Promise<Node>;
    products(first?: Nullable<number>, after?: Nullable<Binary>, filter?: Nullable<ProductsFilter>, sort?: Nullable<ProductSortInput>): ProductConnection | Promise<ProductConnection>;
}

export interface Authentication {
    token: string;
}

export interface Product extends Node {
    id: Binary;
    name: string;
    description: string;
    owner: Account;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface ProductConnection {
    edges: ProductEdge[];
    pageInfo: PageInfo;
}

export interface PageInfo {
    hasNextPage: boolean;
    endCursor?: Nullable<Binary>;
}

export interface ProductEdge {
    cursor: Binary;
    node: Product;
}

export type Binary = any;
export type EmailAddress = any;
export type DateTime = any;
type Nullable<T> = T | null;
