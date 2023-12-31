import { GraphQLScalarType, Kind, ASTNode } from 'graphql';
import mongoose from 'mongoose';

export const BinaryScalar = new GraphQLScalarType({
  name: 'Binary',
  description: 'Binary custom scalar type',
  serialize(value): string {
    if (value instanceof mongoose.Types.ObjectId) {
      return Buffer.from(value.toString()).toString('base64url');
    }
    if (value instanceof Buffer) {
      return value.toString('base64url');
    }
    if (typeof value === 'string') {
      if (
        /^[A-Za-z0-9+/=]*$/.test(Buffer.from(value, 'base64url').toString())
      ) {
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
