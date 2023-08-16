import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { JwtService } from '@nestjs/jwt';

export function privateDirectiveTransformerFactory(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig) => {
      const privateDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];
      if (privateDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = getResolveFunction(resolve);
        return fieldConfig;
      }
    },

    [MapperKind.MUTATION_ROOT_FIELD]: (fieldConfig) => {
      const privateDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];
      if (privateDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = getResolveFunction(resolve);
        return fieldConfig;
      }
    },
  });
}

const getResolveFunction = (defaultResolver) => {
  return async function (source, args, context, info) {
    const authHeader = context.req.headers.authorization;

    if (!authHeader) {
      throw new Error('Authorization header not found');
    }

    const [type, token] = authHeader.split(' ');
    if (type.toLowerCase() !== 'bearer') throw new Error('Invalid Token');
    try {
      const jwt = new JwtService({
        secret: 'secretcodeshhh',
      });
      const decodedToken = jwt.verify(token);
      context.user = decodedToken.emailAddress;

      return await defaultResolver(source, args, context, info);
    } catch (err) {
      throw new Error('Invalid token');
    }
  };
};
