import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { JwtService } from '@nestjs/jwt';

export function privateDirectiveTransformerFactory() {
  return (schema, directiveName) => {
    return mapSchema(schema, {
      [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig) => {
        const privateDirective = getDirective(
          schema,
          fieldConfig,
          directiveName,
        )?.[0];
        if (privateDirective) {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context, info) {
            const authHeader = context.req.headers.authorization;

            if (!authHeader) {
              throw new Error('Authorization header not found');
            }

            const [, token] = authHeader.split(' ');
            try {
              const jwt = new JwtService({
                secret: 'secretcodeshhh',
              });
              const decodedToken = jwt.verify(token); // Verify the token
              context.user = decodedToken.emailAddress; // Set the user object in the request

              return await resolve(source, args, context, info);
            } catch (err) {
              throw new Error('Invalid token');
            }
          };

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
            field.resolve = getResolveFunction(resolve);
          }
          return objectConfig;
        }
      },
    });
  };
}

const getResolveFunction = (defaultResolver) => {
  return async (...args) => {
    const [, , context] = args;
    console.log('RESOLVE FIELD', context.req);

    const authHeader = context.req.headers.authorization;

    if (!authHeader) {
      throw new Error('Authorization header not found');
    }

    const [, token] = authHeader.split(' ');
    try {
      const jwt = new JwtService({
        secret: 'secretcodeshhh',
      });
      const decodedToken = jwt.verify(token); // Verify the token
      context.user = decodedToken.emailAddress; // Set the user object in the request

      // return await defaultFieldResolver(...args)
      return await defaultResolver.apply(this, args);
    } catch (err) {
      throw new Error('Invalid token');
    }
  };
};

// const extractTokenFromHeader = (request: any): string | undefined => {
//   const headers = request.headers as Record<string, string>;
//   const [type, token] = headers.authorization?.split(' ') ?? [];
//   return type === 'Bearer' ? token : undefined;
// };
