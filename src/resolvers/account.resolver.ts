import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AccountService } from '../account/account.service';

@Resolver('Account')
export class AccountResolver {
  constructor(private accountService: AccountService) {}

  @Mutation('signUp')
  async signUp(@Args('input') signUpInput: any) {
    const existingUser = await this.accountService.retrieve({
      username: signUpInput.emailAddress,
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
}
