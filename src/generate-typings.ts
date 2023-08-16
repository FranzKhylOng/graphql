import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join, resolve } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: [resolve(__dirname, './schemas/*.gql')],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
});
