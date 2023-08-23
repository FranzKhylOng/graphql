import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from './account.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Binary } from '../graphql';
import { UserDocument } from '../libs/types';
import { SignUpInput } from '../graphql';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(User.name) private model: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(user: SignUpInput) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    return this.model.create({ ...user, password: hashedPassword });
  }

  async update(id: string, updates: UserDocument) {
    return this.model.findByIdAndUpdate(id, updates);
  }

  async retrieveByEmail(params: { emailAddress: string }) {
    if (params.emailAddress) {
      return this.model
        .findOne({ emailAddress: params.emailAddress }, { __v: 0 })
        .lean();
    }
    return null;
  }

  async retrieveById(id: Binary) {
    const ownerId = Buffer.from(id, 'base64').toString();
    const owner = await this.model.findById(ownerId).lean();
    return owner || null;
  }

  async retrieve(filter: FilterQuery<UserDocument>) {
    return this.model.find<UserDocument>(filter, { __v: 0 });
  }

  async delete(id: string) {
    this.model.findByIdAndDelete(id);
  }

  async generateToken(user: { emailAddress: string }) {
    const payload = { emailAddress: user.emailAddress, sub: user.emailAddress };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async login(email: string, password: string) {
    const user = await this.model.findOne({ emailAddress: email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
}
