import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';
import { JwtService } from '@nestjs/jwt';

@Resolver('Account')
export class AccountResolver {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
  ) {}

  @Mutation('signUp')
  async signUp(@Args('input') signUpInput: any) {
    const existingUser = await this.accountService.retrieve({
      emailAddress: signUpInput.emailAddress,
    });
    if (existingUser) {
      throw new Error('BAD_USER_INPUT');
    }
    const user = await this.accountService.create(signUpInput);
    const token = await this.accountService.generateToken(user);
    return {
      token,
      user,
    };
  }

  @Mutation('authenticate')
  async authenticate(@Args('input') authenticateInput: any) {
    const user = await this.accountService.login(
      authenticateInput.emailAddress,
      authenticateInput.password,
    );
    const token = await this.accountService.generateToken(user);
    return {
      token,
      user,
    };
  }

  @Query('me')
  async me(@Context() context: any) {
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header not found');
    }

    const [, token] = authHeader.split(' ');
    const decodedToken = this.jwtService.decode(token) as any;

    if (!decodedToken?.username) {
      throw new Error('Invalid token');
    }

    const user = await this.accountService.retrieve({
      username: decodedToken.username,
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
