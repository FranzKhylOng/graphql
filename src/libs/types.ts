import { Binary } from '../graphql';

export type UserType = {
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
