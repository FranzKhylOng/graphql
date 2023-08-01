import { GraphQLScalarType, Kind, ASTNode } from 'graphql';

export const BinaryScalar = new GraphQLScalarType({
  name: 'Binary',
  description: 'Binary custom scalar type',
  serialize(value): string {
    if (value instanceof Buffer) {
      return value.toString('base64url');
    }
    throw Error('GraphQL Binary scalar expected buffer');
  },

  parseValue(value): Buffer {
    if (typeof value === 'string') {
      return Buffer.from(value, 'base64url');
    }
    throw Error('GraphQL Binary scalar expected string');
  },

  parseLiteral(ast: ASTNode): Buffer | null {
    if (ast.kind === Kind.STRING) {
      return Buffer.from(ast.value, 'base64url');
    }
    return null;
  },
});
