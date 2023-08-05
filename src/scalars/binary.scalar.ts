import { GraphQLScalarType, Kind, ASTNode } from 'graphql';

export const BinaryScalar = new GraphQLScalarType({
  name: 'Binary',
  description: 'Binary custom scalar type',
  serialize(value): string {
    if (value instanceof Buffer) {
      return value.toString('base64url');
    }
    if (typeof value === 'string') {
      // Check if the string could be a base64 string
      if (/^[A-Za-z0-9+/=]*$/.test(value)) {
        return value;
      }
    }
    throw Error('GraphQL Binary scalar expected buffer or base64 string');
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
