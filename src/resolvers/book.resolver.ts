import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from '../app.service';

@Resolver('Book')
export class BookResolver {
  constructor(private appService: AppService) {}

  @Query()
  async books() {
    return this.appService.getBooks();
  }
}
