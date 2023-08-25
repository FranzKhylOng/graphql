import { Document } from 'mongoose';
import DataLoader from 'dataloader';

export type Binary = Buffer;

export type AppContext = {
  claims: Claims;
  dataLoaders: {
    Account: DataLoader<Buffer, UserDocument>;
    Product: DataLoader<Buffer, Product>;
  };
};

export type Claims = {
  id: string;
};

export type User = {
  firstname: string;
  lastname: string;
  emailAddress: string;
  password: string;
  id?: Binary;
};

export type UserDocument = Document & User;

export type Product = {
  id: Binary;
  base64URLID: string;
  name: string;
  price: number;
  cursor: Binary;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: Binary;
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

export type CreateProductInput = {
  name: string;
  description: string;
  owner: Binary;
};
