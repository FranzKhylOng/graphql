import { Injectable } from '@nestjs/common';

const books = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
  },
];

@Injectable()
export class AppService {
  getBooks() {
    return books;
  }
}
