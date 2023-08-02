import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export function privateDirectiveTransformerFactory(JwtService) {
  return (schema, directiveName) => {
    return mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const privateDirective = getDirective(
          schema,
          fieldConfig,
          directiveName,
        )?.[0];
        if (privateDirective) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = getResolveFunction(resolve, JwtService);
          return fieldConfig;
        }
      },

      [MapperKind.OBJECT_TYPE]: (objectConfig) => {
        const privateDirective = getDirective(
          schema,
          objectConfig,
          directiveName,
        )?.[0];
        if (privateDirective) {
          for (const fieldName in objectConfig.getFields()) {
            const field = objectConfig.getFields()[fieldName];
            const { resolve = defaultFieldResolver } = field;
            field.resolve = getResolveFunction(resolve, JwtService);
          }
          return objectConfig;
        }
      },
    });
  };
}

const getResolveFunction = (defaultResolver, JwtService) => {
  return async (...args) => {
    const [, , context] = args;
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header not found');
    }

    const [, token] = authHeader.split(' ');
    try {
      const decodedToken = JwtService.verify(token); // Verify the token
      context.user = decodedToken.emailAddress; // Set the user object in the request
    } catch (err) {
      throw new Error('Invalid token');
    }

    return defaultResolver.apply(this, args);
  };
};

// const extractTokenFromHeader = (request: any): string | undefined => {
//   const headers = request.headers as Record<string, string>;
//   const [type, token] = headers.authorization?.split(' ') ?? [];
//   return type === 'Bearer' ? token : undefined;
// };
