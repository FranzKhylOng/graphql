/* eslint-disable @typescript-eslint/no-unused-vars */
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
    const existingUser = await this.accountService.retrieveByEmail({
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
    return this.accountService.generateToken(
      await this.accountService.login(
        authenticateInput.emailAddress,
        authenticateInput.password,
      ),
    );
  }

  @Query('me')
  async me(@Context() context: any) {
    const user = await this.accountService.retrieveByEmail({
      emailAddress: context.user,
    });

    const { _id, password, ...rest } = user;

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...rest,
      id: Buffer.from(_id.toString()),
    };
  }
}
