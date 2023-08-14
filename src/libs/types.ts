import { Binary } from '../graphql';
import { Document } from 'mongoose';

export type UserType = Document & {
  firstname: string;
  lastname: string;
  emailAddress: string;
  password: string;
  id?: Binary;
};

export type Product = {
  id: Binary;
  name: string;
  price: number;
  cursor: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: UserType;
};

export type ProductEdge = {
  cursor: Binary;
  node: Product;
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: Binary;
};

export type ProductConnection = {
  edges: ProductEdge[];
  pageInfo: PageInfo;
};

export type AccountInput = {
  id: Binary;
  emailAddress: string;
};

export type CreateProductInput = {
  name: string;
  description: string;
  owner: AccountInput;
};
