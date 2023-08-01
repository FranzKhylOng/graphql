import { defaultFieldResolver } from 'graphql';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AccountService } from '../account/account.service';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export class privateDirectiveTransformer {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: AccountService,
  ) {}

  privateDirectiveTransformer(schema, directiveName) {
    return mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const privateDirective = getDirective(
          schema,
          fieldConfig,
          directiveName,
        )?.[0];
        if (privateDirective) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = this.getResolveFunction(resolve);
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
            field.resolve = this.getResolveFunction(resolve);
          }
          return objectConfig;
        }
      },
    });
  }

  private getResolveFunction(defaultResolver) {
    return async (...args) => {
      const [, , context] = args;
      const token = this.extractTokenFromHeader(context.req);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });
        const user = await this.userService.retrieve({ id: payload.sub });
        if (!user) {
          throw new UnauthorizedException();
        }
        context.req.user = user; // Set the user object in the request
      } catch {
        throw new UnauthorizedException();
      }
      return defaultResolver.apply(this, args);
    };
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const headers = request.headers as Record<string, string>;
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
