import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpInput, AuthenticateInput } from 'src/graphql';

@Resolver('Account')
export class AccountResolver {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
  ) {}

  @Mutation('signUp')
  async signUp(@Args('input') signUpInput: SignUpInput) {
    const existingUser = await this.accountService.retrieve({
      emailAddress: signUpInput.emailAddress,
    });
    if (existingUser) {
      throw new Error('BAD_USER_INPUT');
    }
    const user = await this.accountService.create(signUpInput);
    return this.accountService.generateToken(user);
  }

  @Mutation('authenticate')
  async authenticate(@Args('input') authenticateInput: AuthenticateInput) {
    const user = await this.accountService.login(
      authenticateInput.emailAddress,
      authenticateInput.password,
    );
    return this.accountService.generateToken(user);
  }

  @Query('me')
  async me(@Context() context: any) {
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header not found');
    }

    const [, token] = authHeader.split(' ');
    const decodedToken = this.jwtService.decode(token) as any;

    if (!decodedToken?.emailAddress) {
      throw new Error('Invalid token');
    }

    const user = await this.accountService.retrieve({
      emailAddress: decodedToken.emailAddress,
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
