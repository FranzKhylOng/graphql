import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './account.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../libs/constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '600s' },
    }),
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
