import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './account.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Binary } from '../graphql';
import { UserType } from '../libs/types';
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
    return await this.model.create({ ...user, password: hashedPassword });
  }

  async update(id: string, updates: UserType) {
    return this.model.findByIdAndUpdate(id, updates);
  }

  async retrieve(params: { emailAddress: string }) {
    if (params.emailAddress) {
      return this.model
        .findOne({ emailAddress: params.emailAddress }, { __v: 0 })
        .lean();
    }
    return null;
  }

  async retrieveById(id: Binary) {
    console.log(id);
    const ownerId = Buffer.from(id, 'base64').toString();
    console.log(ownerId);
    const owner = await this.model.findById(ownerId).lean();
    console.log(owner);
    if (!owner) {
      throw new Error(`Owner with id ${ownerId} not found`);
    }
    return owner;
  }

  async retrieveByEmail(emailAddress: string) {
    return this.model.findOne({ emailAddress });
  }

  async delete(id: string) {
    this.model.findByIdAndDelete(id);
  }

  async generateToken(user: UserType) {
    const payload = { emailAddress: user.emailAddress, sub: user.id };
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
