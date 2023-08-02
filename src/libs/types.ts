import { Binary } from '../graphql';

export type UserType = {
  firstname: string;
  lastname: string;
  emailAddress: string;
  password: string;
  id?: Binary;
};

export type Product = {
  name: string;
  price: number;
  emailAddress: string;
  description: string;
  id?: Binary;
};
