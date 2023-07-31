import { defaultFieldResolver, GraphQLField } from 'graphql';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AccountService } from '../account/account.service';

export class privateDirectiveTransformer {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: AccountService,
  ) {}

  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...args) => {
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
      return resolve.apply(this, args);
    };
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const headers = request.headers as Record<string, string>;
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
