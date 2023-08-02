import { Binary } from '../graphql';

export type UserType = {
  firstname: string;
  lastname: string;
  emailAddress: string;
  password: string;
  id?: Binary;
};
